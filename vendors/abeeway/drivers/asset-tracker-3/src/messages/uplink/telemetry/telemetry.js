let util = require("../../../util");

const TelemetryTypeEnum = Object.freeze({
    TELEMETRY: "TELEMETRY",
    METADATA: "METADATA",
});

class Telemetry {
    static metadataStore = {};

    /**
     * Décodage d'un payload metadata.
     * Le payload est composé d'un header de 4 octets suivi de N enregistrements de 8 octets.
     * Chaque enregistrement comporte :
     *  - Byte 0 : Bit 7 = type metadata, bits 6-4 = telemetryId, bits 2-0 = cyclic version.
     *  - Byte 1 : Bits 4-3 = fixed time interval, bits 2-0 = nombre de mesures.
     *  - Bytes 2-3 : TelemetryIDMaxInterval (2 octets en big-endian, unité : x10 secondes).
     *  - Bytes 4-5 : MeasurementNMaxInterval (en secondes).
     *  - Bytes 6-7 : Détails de la mesure.
     */
    static decodeMetadataPayload(payload) {
        const headerLength = 4;
        const recordLength = 8;
        const numberOfRecords = (payload.length - headerLength) / recordLength;
        const metadataList = [];

        for (let i = 0; i < numberOfRecords; i++) {
            const offset = headerLength + i * recordLength;
            const b0 = payload[offset];
            // Vérifier que l'octet indique bien un payload metadata (bit 7 doit être à 1)
            const isMetadata = ((b0 >> 7) & 0x01) === 1;
            if (!isMetadata) {
                throw new Error("Enregistrement inattendu : le bit de type n'indique pas un payload metadata");
            }
            // Bits 6-4 : telemetryId, Bits 2-0 : cyclic version
            const telemetryId = (b0 >> 4) & 0x07;
            const cyclicVersion = b0 & 0x07;

            const b1 = payload[offset + 1];
            // Bits 4-3 : fixed time interval, Bits 2-0 : nombre de mesures
            const fixedTimeInterval = (b1 >> 3) & 0x03;
            const numberOfMeasurements = b1 & 0x07;

            // Bytes 2-3 : TelemetryIDMaxInterval (2 octets, en big-endian, unité x10 secondes)
            const telemetryIDMaxInterval = (((payload[offset + 2] << 8) | payload[offset + 3]) * 10);
            // Bytes 4-5 : MeasurementNMaxInterval (2 octets)
            const measurementNMaxInterval = (payload[offset + 4] << 8) | payload[offset + 5];

            // Bytes 6-7 : Détails de la mesure
            const b6 = payload[offset + 6];
            // Bits 7-6 : measurementN ID
            const measurementNId = (b6 >> 6) & 0x03;
            // Bits 3-2 : coding policy
            const codingPolicy = (b6 >> 2) & 0x03;
            // Bits 1-0 : data type
            const dataType = b6 & 0x03;

            const b7 = payload[offset + 7];
            // Bits 7-5 : recording policy
            const recordingPolicy = (b7 >> 5) & 0x07;
            // Bits 3-1 : scaling factor (stocké en complément à deux sur 3 bits)
            let scalingFactorBits = (b7 >> 1) & 0x07;
            let scalingFactor = (scalingFactorBits & 0x04) ? scalingFactorBits - 8 : scalingFactorBits;
            // Bit 0 : sample compression
            const sampleCompression = b7 & 0x01;

            const metadata = {
                telemetryId,
                cyclicVersion,
                fixedTimeInterval,
                numberOfMeasurements,
                telemetryIDMaxInterval,
                measurementNMaxInterval,
                measurementDetails: {
                    measurementNId,
                    codingPolicy,
                    dataType,
                    recordingPolicy,
                    scalingFactor,
                    sampleCompression,
                },
            };

            metadataList.push(metadata);
            // Enregistrement dans la mémoire globale
            Telemetry.metadataStore[telemetryId] = metadata;
        }
        return {
            telemetryType: TelemetryTypeEnum.METADATA,
            metadata: metadataList,
        };
    }

    /**
     * Décodage d'un payload timeseries.
     * Ce décodage utilise les métadonnées précédemment enregistrées pour appliquer
     * le bon scaling, la compression et le décodage des vecteurs de mesures.
     *
     * On suppose ici que :
     *  - L'octet 4 contient (bits 6-4) l'identifiant de la télémétrie et (bit 0) le flag d'alarme.
     *  - L'octet 5 contient (bits 7-5) la version cyclique et (bits 4-0) le compteur de trames.
     *  - Les octets 6+ correspondent à un vecteur de mesures delta compressées.
     *
     * Le décodage est fait de façon simplifiée :
     *  - Le premier octet représente la valeur absolue.
     *  - Les suivants représentent des deltas (1 octet signé) à ajouter successivement.
     *  - Le scaling (10^scalingFactor) est appliqué à chaque valeur.
     */
    static decodeTimeseriesPayload(payload) {
        // Vérifier le header (4 octets) et extraire l'octet 4
        const b4 = payload[4];
        const isTimeseries = ((b4 >> 7) & 0x01) === 0;
        if (!isTimeseries) {
            throw new Error("Le payload n'est pas de type timeseries");
        }
        // Bits 6-4 : telemetryId, Bit 0 : alarm trigger
        const telemetryId = (b4 >> 4) & 0x07;
        const alarmTrigger = b4 & 0x01;

        // Octet 5 : version cyclique et compteur
        const b5 = payload[5];
        const cyclicVersion = (b5 >> 5) & 0x07;
        const cyclicCounter = b5 & 0x1F;

        // Vérifier que des métadonnées existent pour ce telemetryId
        if (!Telemetry.metadataStore.hasOwnProperty(telemetryId)) {
            throw new Error(
                `Les métadonnées pour telemetry ID ${telemetryId} n'ont pas été enregistrées. Décodage impossible.`
            );
        }
        const metadata = Telemetry.metadataStore[telemetryId];
        if (metadata.cyclicVersion !== cyclicVersion) {
            throw new Error(
                `Incohérence de version cyclique pour telemetry ID ${telemetryId} : metadata version ${metadata.cyclicVersion} vs payload version ${cyclicVersion}`
            );
        }

        // Extraction du vecteur de mesures (les octets restants)
        const measurementVectors = payload.slice(6);

        // Décodage simplifié des mesures
        const scalingFactor = metadata.measurementDetails.scalingFactor;
        const multiplier = Math.pow(10, scalingFactor);
        let decodedMeasurements = [];

        if (measurementVectors.length > 0) {
            // Première mesure absolue
            let previous = measurementVectors[0];
            decodedMeasurements.push(previous * multiplier);
            for (let i = 1; i < measurementVectors.length; i++) {
                let delta = measurementVectors[i];
                // Conversion en entier signé (8 bits)
                if (delta > 127) {
                    delta = delta - 256;
                }
                let value = previous + delta;
                decodedMeasurements.push(value * multiplier);
                previous = value;
            }
        }

        return {
            telemetryType: TelemetryTypeEnum.TELEMETRY,
            telemetryId,
            alarmTrigger,
            cyclicVersion,
            cyclicCounter,
            rawMeasurementVectors: measurementVectors,
            decodedMeasurements,
            metadataUsed: metadata,
        };
    }

    /**
     * Fonction principale qui détermine le type de payload (metadata ou timeseries)
     * et déclenche le décodage approprié.
     */
    static determineTelemetry(payload) {
        // Vérifier le type de payload selon l'octet 4 (bit 7)
        const payloadTypeBit = (payload[4] >> 7) & 0x01;
        if (payloadTypeBit === 1) {
            return Telemetry.decodeMetadataPayload(payload);
        } else {
            return Telemetry.decodeTimeseriesPayload(payload);
        }
    }
}

module.exports = {Telemetry, determineTelemetry: determineTelemetry};

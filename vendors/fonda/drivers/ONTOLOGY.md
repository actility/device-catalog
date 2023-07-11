# Ontology

This is the ontology supported by Actility. you can define a sensor inside your model depending on this table.

> Our ontology is based on [oBIX protocol](http://docs.oasis-open.org/obix/obix/v1.1/csprd01/obix-v1.1-csprd01.pdf) which provides an extensive database of predefined units that are represented in seven main dimensions. These seven dimensions are represented in SI respectively as kilogram (kg), meter (m), second (sec), Kelvin (K), ampere (A), mole (mol), and candela (cd).

| Unit                                   | unitId    | type   | symbol              | fields                                          |
|----------------------------------------|-----------|--------|---------------------|-------------------------------------------------|
| GPS                                    | GPS       | object | GPS                 | location                                        |
| Ampere                                 | A         | double | A                   | current                                         |
| Ampere hour                            | Ah        | double | Ah                  | charge                                          |
| Bar                                    | bar       | double | bar                 | pressure                                        |
| Becquerel                              | Bq        | double | Bq                  | radioactivity                                   |
| Bel                                    | Bspl      | double | bel                 | intensity, snr                                  |
| Bit                                    | bit       | double | bit                 | data, storage                                   |
| Bit per second                         | bit/s     | double | bit/s               | dataSpeed                                       |
| Candela                                | cd        | double | cd                  | intensity                                       |
| Candela per square meter               | cd/m2     | double | cd/m&#178;          | brightness                                      |
| Celsius                                | Cel       | double | &#176;C             | temperature                                     |
| Centimeter                             | cm        | double | cm                  | distance, accuracy, range, altitude             |
| Coulomb                                | C         | double | C                   | electricCharge                                  |
| Count per second                       | count/s   | double | count/s             | eventRate, rate                                 |
| Count per minute                       | count/min | double | count/min           | eventRate, rate                                 |
| Cubic meter                            | m3        | double | m&#179;             | volume                                          |
| Cubic meter per hour                   | m3/h      | double | m&#179;/h           | flowRate                                        |
| Cubic meter per second                 | m3/s      | double | m&#179;/s           | flowRate                                        |
| Decibel                                | dB        | double | dB                  | intensity, snr                                  |
| Decibel relative to 1mW                | dBm       | double | dBm                 | rssi                                            |
| Decibel relative to 1W                 | dBW       | double | dBW                 | powerLevel                                      |
| Degree                                 | deg       | double | &#176;              | angle                                           |
| Degrees per second                     | dps       | double | dps                 | angularVelocity                                 |
| Dillution of precision                 | dop       | double | dop                 | navigation                                      |
| Euro                                   | euro      | double | &#8364;             | price                                           |
| Euro per watthour                      | euro/Wh   | double | &#8364;/Wh          | energyPrice                                     |
| Fahrenheit                             | Far       | double | &#176;F             | temperature                                     |
| Farad                                  | F         | double | F                   | capacitance                                     |
| Gigawatt                               | GW        | double | GW                  | power                                           |
| Gram                                   | g         | double | g                   | mass, weight                                    |
| Acceleration compared to earth gravity | gravity   | double | G                   | acceleration, vibration                         |
| Gray                                   | Gy        | double | Gy                  | radiation                                       |
| Hectopascal                            | hPa       | double | hPa                 | pressure                                        |
| Henry                                  | H         | double | H                   | inductance                                      |
| Hertz                                  | hertz     | double | Hz                  | frequency, sound                                |
| Hour                                   | hour      | double | h                   | time, duration, interval, age                   |
| Joule                                  | J         | double | J                   | energy                                          |
| Katal                                  | kat       | double | kat                 | catalyticActivity                               |
| Kelvin                                 | K         | double | K                   | temperature                                     |
| Kilogram                               | kg        | double | kg                  | mass, weight                                    |
| Kilometer                              | km        | double | km                  | distance, accuracy, range, altitude             |
| Kilometer per hour                     | km/h      | double | km/h                | velocity, speed                                 |
| Kilopascal                             | kPa       | double | kPa                 | pressure                                        |
| Kilowatt                               | kW        | double | kW                  | power                                           |
| Kilowatthour                           | kWh       | double | kWh                 | energy                                          |
| Liter                                  | l         | double | l                   | volume, capacity                                |
| Liter per second                       | l/s       | double | l/s                 | flowRate                                        |
| Lumen                                  | lm        | double | lm                  | flux, illuminance, light                        |
| Lux                                    | lx        | double | lx                  | flux, illuminance                               |
| Megawatt                               | MW        | double | MW                  | power                                           |
| Megawatthour                           | MWh       | double | MWh                 | energy                                          |
| Megawatt per minute                    | MW/m      | double | MW/m                | powerRate                                       |
| Meter                                  | m         | double | m                   | distance, accuracy, range, altitude             |
| Meter per second                       | m/s       | double | m/s                 | velocity, speed                                 |
| Meter per square second                | m/s2      | double | m/s&#178;           | acceleration, vibration                         |
| Microgram                              | ug        | double | &#181;g             | mass, weight                                    |
| Microgram per cubic meter              | ug/m3     | double | &#181;g/m&#179;     | concentration                                   |
| Micrometer                             | um        | double | &#181;m             | distance, accuracy, range, altitude             |
| Micromole per second and square meter  | umol/m2.s | double | &#181;mol/m&#178;.s | fluxDensity, intensity                          |
| Microsiemens per centimeter            | uS/cm     | double | &#181;S/cm          | conductivity                                    |
| Microvolt                              | uV        | double | uV                  | batteryVoltage                                  |
| Milliampere                            | mA        | double | mA                  | current                                         |
| Milliampere hour                       | mAh       | double | mAh                 | charge                                          |
| Millibar                               | mbar      | double | mbar                | pressure                                        |
| Milliliter                             | ml        | double | ml                  | volume, capacity                                |
| Millimeter                             | mm        | double | mm                  | distance, accuracy, range, altitude             |
| Millimeter per second                  | mm/s      | double | mm/s                | velocity, speed                                 |
| Millimeter per hour                    | mm/h      | double | mm/h                | velocity, speed                                 |
| Millisecond                            | ms        | double | ms                  | time, duration, interval, age                   |
| Millisiemens per centimeter            | mS/cm     | double | mS/cm               | conductivity                                    |
| Millivolt                              | mV        | double | mV                  | batteryVoltage                                  |
| Minute                                 | minute    | double | min                 | time, duration, interval, age                   |
| Mole                                   | mol       | double | mol                 | amount, quantity                                |
| Newton                                 | N         | double | N                   | force                                           |
| Nephelometric turbidity                | ntu       | double | ntu                 | nephelometricTurbidity, turbidity               |
| Okta                                   | okta      | int64  | okta                | cloudCover, cover                               |
| Ohm                                    | Ohm       | double | &#8486;             | resistance                                      |
| Parts per billion                      | ppb       | double | ppb                 | amount, quantity, concentration, co2Level       |
| Parts per million                      | ppm       | double | ppm                 | amount, quantity, concentration, co2Level       |
| Pascal                                 | Pa        | double | Pa                  | pressure                                        |
| Percentage                             | %         | double | %                   | batteryLevel, percentage, per, currentUnbalance |
| Percentage relative humidity           | %RH       | double | %RH                 | humidity                                        |
| pH                                     | pH        | double | pH                  | acidity                                         |
| Pulse per hour                         | pulse/h   | double | pulse/h             | frequency, sound                                |
| Radian                                 | rad       | double | rad                 | angle                                           |
| Rate                                   | /         | double | rate                | rate, powerFactor                               |
| Rotations per minute                   | rpm       | double | rpm                 | angularVelocity                                 |
| Second                                 | s         | double | s                   | time, duration, interval, age                   |
| Siemens                                | S         | double | S                   | conductance                                     |
| Siemens per meter                      | S/m       | double | S/m                 | conductivity                                    |
| Sievert                                | Sv        | double | Sv                  | radiationEffect                                 |
| Square meter                           | m2        | double | m&#178;             | area                                            |
| Steradian                              | sr        | double | sr                  | solidAngle                                      |
| Tesla                                  | T         | double | T                   | magneticDensity                                 |
| Volt-Ampere                            | VA        | double | VA                  | apparentPower                                   |
| Volt-Ampere hour                       | VAh       | double | VAh                 | apparentEnergy                                  |
| Volt-Ampere reactive                   | var       | double | var                 | reactivePower                                   |
| Volt-Ampere reactive hour              | varh      | double | varh                | reactiveEnergy                                  |
| Volt                                   | V         | double | V                   | batteryVoltage, rmsVoltage, volatge             |
| Watt                                   | W         | double | W                   | power, activePower                              |
| Watt per hour                          | W/h       | double | W/h                 | powerRate                                       |
| Watt per second                        | W/s       | double | W/s                 | powerRate                                       |
| Watt per square meter                  | W/m2      | double | W/m&#178;           | irradiance, solarRadiation                      |
| Watthour                               | Wh        | double | Wh                  | energy                                          |
| Weber                                  | Wb        | double | Wb                  | magneticFlux                                    |


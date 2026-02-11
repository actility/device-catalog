# Ontology

This is the ontology supported by Actility. You can define a sensor inside your model depending on this table.

> Our ontology is based on [oBIX protocol](http://docs.oasis-open.org/obix/obix/v1.1/csprd01/obix-v1.1-csprd01.pdf) which provides an extensive database of predefined units that are represented in seven main dimensions. These seven dimensions are represented in SI respectively as kilogram (kg), meter (m), second (sec), Kelvin (K), ampere (A), mole (mol), and candela (cd).

| Unit | unitId | type | symbol | fields |
|------|--------|------|--------|--------|
| acceleration compared to earth gravity | gravity | double | g | acceleration, vibration |
| ampere | A | double | A | current |
| ampere-hour | Ah | double | Ah | charge |
| bar | bar | double | bar | pressure |
| becquerel | Bq | double | Bq | radioactivity |
| bel | Bspl | double | bel | intensity, snr, sound |
| bit | bit | double | bit | data, storage |
| bit per second | bit/s | double | bit/s | dataSpeed |
| candela | cd | double | cd | intensity |
| candela per square meter | cd/m2 | double | cd/m&#178; | brightness |
| celsius | Cel | double | &#176;C | temperature |
| centimeter | cm | double | cm | distance, accuracy, range, altitude, height |
| coulomb | C | double | C | electricCharge |
| count per minute | count/min | double | count/min | eventRate, count |
| count per second | count/s | double | count/s | eventRate, count |
| counter | count | int64 | occ. | counter, amount, quantity |
| cubic meter | m3 | double | m&#179; | volume |
| cubic meter per hour | m3/h | double | m&#179;/h | flowRate |
| cubic meter per second | m3/s | double | m&#179;/s | flowRate |
| day | day | double | day | time, duration, interval, age, period |
| decibel | dB | double | dB | intensity, snr, sound |
| decibel relative to 1 mW | dBm | double | dBm | rssi |
| decibel relative to 1 W | dBW | double | dBW | powerLevel |
| degree | deg | double | &#176; | angle |
| degrees per second | dps | double | dps | angularVelocity |
| dilution of precision | dop | double | dop | navigation |
| euro | euro | double | &#8364; | price |
| euro per watt-hour | euro/Wh | double | &#8364;/Wh | energyPrice |
| fahrenheit | Far | double | &#176;F | temperature |
| farad | F | double | F | capacitance |
| gigawatt | GW | double | GW | power, activePower |
| GPS | GPS | object | GPS | location |
| gram | g | double | g | mass, weight |
| gray | Gy | double | Gy | radiation |
| hectopascal | hPa | double | hPa | pressure |
| henry | H | double | H | inductance |
| hertz | hertz | double | Hz | frequency, sound |
| hour | h | double | h | time, duration, interval, age, period |
| index | index | int64 | index | uv |
| joule | J | double | J | energy |
| katal | kat | double | kat | catalyticActivity |
| kelvin | K | double | K | temperature |
| kilogram | kg | double | kg | mass, weight |
| kilometer | km | double | km | distance, accuracy, range, altitude, height |
| kilometer per hour | km/h | double | km/h | velocity, speed |
| kilopascal | kPa | double | kPa | pressure |
| kilowatt | kW | double | kW | power, activePower |
| kilowatt-hour | kWh | double | kWh | energy |
| liter | l | double | l | volume, capacity |
| liter per second | l/s | double | l/s | flowRate |
| lumen | lm | double | lm | flux, light |
| lux | lx | double | lx | flux, light, illuminance |
| mac | IEEE-802 | string | mac | mac |
| megawatt | MW | double | MW | power, activePower |
| megawatt per minute | MW/m | double | MW/m | powerRate |
| megawatt-hour | MWh | double | MWh | energy |
| meter | m | double | m | distance, accuracy, range, altitude, height |
| meter per second | m/s | double | m/s | velocity, speed |
| meter per square second | m/s2 | double | m/s&#178; | acceleration, vibration |
| micro-gravity | ugravity | double | &#181;g | acceleration, vibration |
| microgram | ug | double | &#181;g | mass, weight |
| microgram per cubic meter | ug/m3 | double | &#181;g/m&#179; | concentration |
| micrometer | um | double | &#181;m | distance, accuracy, range, altitude, height |
| micromole per second and square meter | umol/m2.s | double | &#181;mol/m&#178;.s | fluxDensity, intensity |
| microsiemens per centimeter | uS/cm | double | &#181;S/cm | conductivity |
| microvolt | uV | double | &#181;V | batteryVoltage, rmsVoltage, voltage |
| milli-gravity | mgravity | double | mg | acceleration, vibration |
| milliampere | mA | double | mA | current |
| milliampere-hour | mAh | double | mAh | charge |
| millibar | mbar | double | mbar | pressure |
| millileter | ml | double | ml | volume, capacity |
| millimeter | mm | double | mm | distance, accuracy, range, altitude, height |
| millimeter per hour | mm/h | double | mm/h | velocity, speed |
| millimeter per second | mm/s | double | mm/s | velocity, speed |
| millisecond | ms | double | ms | time, duration, interval, age, period |
| millisiemens per centimeter | mS/cm | double | mS/cm | conductivity |
| millivolt | mV | double | mV | batteryVoltage, rmsVoltage, voltage |
| minute | minute | double | min | time, duration, interval, age, period |
| mole | mol | double | mol | amount, quantity |
| month | month | double | month | time, duration, interval, age, period |
| nephelometric turbidity | ntu | double | ntu | nephelometricTurbidity, turbidity |
| newton | N | double | N | force |
| ohm | Ohm | double | &#8486; | resistance |
| okta | okta | int64 | okta | cloudCover, cover |
| parts per billion | ppb | double | ppb | amount, quantity, concentration, co2Level |
| parts per million | ppm | double | ppm | amount, quantity, concentration, co2Level |
| pascal | Pa | double | Pa | pressure |
| per cubic centimeter | #/cm3 | double | #/cm3 | density |
| percentage | % | double | % | batteryLevel, percentage, per, currentUnbalance, luminosityLevel, occupancyLevel, leakLevel, fillLevel |
| percentage relative humidity | %RH | double | %RH | humidity |
| pH | pH | double | pH | acidity |
| pulse per hour | pulse/h | double | pulse/h | frequency, sound |
| radian | rad | double | rad | angle |
| rate | / | double | rate | rate, powerFactor |
| rotations per minute | rpm | double | rpm | angularVelocity |
| second | s | double | s | time, duration, interval, age, period |
| siemens | S | double | S | conductance |
| siemens per meter | S/m | double | S/m | conductivity |
| sievert | Sv | double | Sv | radiationEffect |
| square meter | m2 | double | m&#178; | area |
| state | state | boolean | bool | leak, presence, status |
| steradian | sr | double | sr | solidAngle |
| tesla | T | double | T | magneticDensity |
| volt | V | double | V | batteryVoltage, rmsVoltage, voltage |
| volt-ampere | VA | double | VA | apparentPower |
| volt-ampere hour | VAh | double | VAh | apparentEnergy |
| volt-ampere reactive | var | double | var | reactivePower |
| volt-ampere reactive hour | varh | double | varh | reactiveEnergy |
| watt | W | double | W | power, activePower |
| watt per hour | W/h | double | W/h | powerRate |
| watt per second | W/s | double | W/s | powerRate |
| watt per square meter | W/m2 | double | W/m&#178; | irradiance, solarRadiation |
| watt-hour | Wh | double | Wh | energy |
| weber | Wb | double | Wb | magneticFlux |
| year | year | double | year | time, duration, interval, age, period |

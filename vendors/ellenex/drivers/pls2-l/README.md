# ellenex PLS2-L Device Driver

This is a simple driver that can decode uplink messages sent from ellenex PLS2-L and encode downlink messages.
The generic guide below demonstrates how to send downlink message using JSON script to your Ellenex device.

## Change sampling rate
You can use downlink messages to change the sampling rate in minutes or seconds. Currently, the minimum sampling rate is 60 seconds (i.e. one minute). Please contact our support via [support@ellenex.com](mailto:support@ellenex.com) if sampling rate below 60 seconds is required.
### Change sampling rate in minutes
The following script changes the sampling rate to 180 minutes (i.e. 3 hours). Change the value in the "time" field to set a different sampling rate.
```json
{
  "command": 1,
  "data": {
    "unit": "minute",
    "time": 180
  }
}
```
### Change sampling rate in seconds
The following script changes the sampling rate to 180 seconds (i.e. 3 minutes). Change the value in the "time" field to set a different sampling rate.
```json
{
  "command": 1,
  "data": {
    "unit": "second",
    "time": 180
  }
}
```
 
## Enable/disable confirmation
You can use downlink messages to switch on/off the confirmation.
### Enable confirmation
Use the following script to enable confirmation.
```json
{
  "command": 2,
  "data": {
    "confirmation": true
  }
}
```
### Disable confirmation
Use the following script to disable confirmation.
```json
{
  "command": 2,
  "data": {
    "confirmation": false
  }
}
```
## Reset device
You can use downlink messages to reset the device. Use the following script to reset the device.
```json
{
  "command": 3,
  "data": {
    "reset": true
  }
}
```
## Change periodic auto-reset settings
This downlink message forces the device to reset itself after sending N samples.
### Disable auto-reset
Use the following script to disable auto-reset.
```json
{
  "command": 4,
  "data": {
    "count": 0
  }
}
```
### Change auto-reset interval
The following script forces the device to reset itself after sending 3000 samples. Change the value in the "count" field to set a different auto-reset interval. Changing the value to 0 will disable auto-reset.
 
Please note that:
- In OTA devices, this will initiate the joining process after reset.
- In ABP devices, this will reset the frame counter.
- If the requested value is less than the current auto-reset interval, this will result in immediate reset.
 
```json
{
  "command": 4,
  "data": {
    "count": 3000
  }
}
```

function Decode(fPort, bytes, variables) {
  var data = {};
  var i = 0;
  while( i < bytes.length )
  {
      switch (bytes[i])
      {
       /*__________________________________________________________________________________________________
                                                  STATUS
       ____________________________________________________________________________________________________*/
       case 0x10:
          channel = bytes[i+1]; // get the channel
          switch (channel) {
              case 0x01 : // battery
                  data.battery = (bytes[i+2] << 8) + bytes[i+3];// battery data of two bytes
                  i += 4;
                  break;
              case 0x02 : // battery 9v
                  data.battery_9V = (bytes[i+2] << 8) + bytes[i+3];// battery 9v data of two bytes
                  i += 4;
                  break;
              case 0xF0: //  state
                  data.rfu_value    = bytes[i+2]; // rfu data of one bytes
                  data.states = bytes[i+3]; // state of one byte (liebearth app will convert to binary)
                  i += 4;
                  break;
              default :
                  break;
          }
          break;

       /*__________________________________________________________________________________________________
                                                  MOISTURE
       ____________________________________________________________________________________________________*/
       case 0x20:
          channel = bytes[i+1]; // get the channel of one byte
          switch(channel) {
              case 0x01: // moisture_1 data  of two bytes
                  data.moisture_1 = (bytes[i+2] << 8) + bytes[i+3];
                  i += 4;
                  break;

              case 0x02: // moisture_2 data  of two bytes
                  data.moisture_2 = (bytes[i+2] << 8) + bytes[i+3];
                  i += 4;
                  break;

              default:
                  break;
          }
          break;




       /*__________________________________________________________________________________________________
                                                  TEMPERATURE
       ____________________________________________________________________________________________________*/
       case 0x30:
          break;




       /*__________________________________________________________________________________________________
                                                     FLOW
       ____________________________________________________________________________________________________*/
       case 0x40:
          break;




       /*__________________________________________________________________________________________________
                                                     PIR
       ____________________________________________________________________________________________________*/
       case 0x50:
          break;


       /*__________________________________________________________________________________________________
                                                     HOUR/MIN
       ____________________________________________________________________________________________________*/
       case 0x91:
          break;





       /*__________________________________________________________________________________________________
                                                        HUPLINK PERIOD
       ____________________________________________________________________________________________________*/
       case 0xA0:
          break;





       /*__________________________________________________________________________________________________
                                                        ONLINE WHEN
       ____________________________________________________________________________________________________*/
       case 0xB0:
          break;




       /*__________________________________________________________________________________________________
                                                        ONLINE DURATION
       ____________________________________________________________________________________________________*/
       case 0xB2:
          break;





       /*__________________________________________________________________________________________________
                                                        OFFLINE WHEN
       ____________________________________________________________________________________________________*/
       case 0xB8:
          break;




       /*__________________________________________________________________________________________________
                                                        OFFLINE DURATION
       ____________________________________________________________________________________________________*/
       case 0xB9:
          break;

       /*__________________________________________________________________________________________________
                                                        DEFAULT
       ____________________________________________________________________________________________________*/
       default:
          data = {};
          i = len;
          break;
    }

 }
 return data;
}


function Encode(fPort, obj, variables)
{
   var bytes_array = [];
   /*__________________________________________________________________________________________________
                                           SOLENOID VALVE COMMAND
   ____________________________________________________________________________________________________*/
  if(keyExistInObject(obj, 'command'))
  {
      var command_array  = obj.command;
      for (var i = 0; i < command_array.length; i++ )
     {
         cmd = command_array[i]
         if (cmd.open === true)
         { // open
            bytes_array = array_push(bytes_array, toHex(parseInt(0xF1)));
            bytes_array = array_push(bytes_array, toHex(cmd.port))

            if(keyExistInObject(cmd, 'duration'))
            {// open for x duration
               bytes_array = array_push(bytes_array, toHex(cmd.duration, 4));
            }
            else
            {// open permanently
               bytes_array = array_push(bytes_array, toHex(0, 4));
            }
         }
         else
         { // close
            bytes_array = array_push(bytes_array, toHex(parseInt(0xF0)));
            bytes_array = array_push(bytes_array, toHex(cmd.port));
         }
      }
  }


  /*__________________________________________________________________________________________________
                                                 PING
  ____________________________________________________________________________________________________*/
  if(keyExistInObject(obj, 'ping'))
  {
      bytes_array = array_push(bytes_array, toHex(parseInt(0x90)));
      bytes_array = array_push(bytes_array, toHex(parseInt(0x00)));
  }
  return bytes_array;
}



function array_push(original, toAdd)
{
    for(var i = 0; i < toAdd.length; i++){
        original[original.length] = toAdd[i];
    }
    return original;
}



function keyExistInObject(object, key)
{
   return (key in object);
}


function toHex(value, len)
{
   len = typeof len !== 'undefined' ? len : 2;
   hex_number = value.toString(16);
   if(hex_number.length % 2 !== 0)
   {
      hex_number = "0" + hex_number;
   }
   while (hex_number.length < len ) {
      hex_number = "0" + hex_number;
   }
   byte_array = [];
   for (var i=0; i < hex_number.length; i++) {
      if(i % 2  === 0)
      {
         byte_array.push(hex_number.substring(i, i+2));
      }
   }
   return byte_array;
}


exports.Decode = Decode;
exports.Encode = Encode;
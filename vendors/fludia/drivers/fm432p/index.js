const PAYLOAD_TYPE = {
  T1_AP  :  {header: 0x6b, size_min: 8/*in bytes*/, size_max: 46/*in bytes*/, name: "T1_AP"},
  T2_AP  :  {header: 0x6c, size: 11/*in bytes*/, name: "T2_AP"},
  START  :  {header: 0x01, size: 3/*in bytes*/,  name: "START"}
}

function decodeUplink(input){
  var decoded = {
    data: {
      index : null,
      message_type : null,
      increments : [],
      indexes : [],
      time_step: null,
      meter_type : "Pulse",
      firmware_version: null,
      number_of_values: null,
      redundancy: null
    },
    warnings: [],
    errors: []
  }
  //Conversion in byte array
  const buf = Buffer.from(input.bytes, 'hex');
  input.bytes = Array.from(buf);
  //Find message type
  decoded.data.message_type = find_message_type(input.bytes);
  if(decoded.data.message_type == null){
    decoded.errors.push("Invalid payload")
    return decoded
  }
  if(decoded.data.message_type == PAYLOAD_TYPE.T1_AP.name){
    var data = decode_T1_AP(input.bytes, input.recvTime);
    decoded.data.time_step = data.time_step;
    decoded.data.index = data.index;
    decoded.data.increments = data.increments;
    decoded.data.indexes = data.indexes;
  }else if(decoded.data.message_type == PAYLOAD_TYPE.T2_AP.name){
    var data = decode_T2_AP(input.bytes);
    decoded.data.index = data.index;
    decoded.data.firmware_version = data.firmware_version;
    decoded.data.time_step = data.time_step;
    decoded.data.number_of_values = data.number_of_values;
    decoded.data.redundancy = data.redundancy;
  }
  return decoded
}

//Find message type - return null if nothing found
function find_message_type(payload){
  switch(payload[0]){
    case PAYLOAD_TYPE.T1_AP.header:
      if(payload.length >= PAYLOAD_TYPE.T1_AP.size_min && payload.length <= PAYLOAD_TYPE.T1_AP.size_max) return PAYLOAD_TYPE.T1_AP.name
      break;
    case PAYLOAD_TYPE.T2_AP.header:
      if(payload.length == PAYLOAD_TYPE.T2_AP.size) return PAYLOAD_TYPE.T2_AP.name
      break;
    case PAYLOAD_TYPE.START.header:
      if(payload.length == PAYLOAD_TYPE.START.size) return PAYLOAD_TYPE.START.name
      break;
  }
  return null
}

function decode_T1_AP(payload, recvTime){
  var data = {};
  data.time_step = payload[1];
  data.index  = (payload[2] & 0xFF) << 24 | (payload[3] & 0xFF) << 16 | (payload[4] & 0xFF) << 8 | (payload[5] & 0xFF);
  data.increments = []
  data.indexes = []
  var nb_values_in_payload = (payload.length-6)/2
  for(var i=0;i<nb_values_in_payload;i++){
    if(recvTime != null){
      var d = new Date(recvTime)
      d.setSeconds(d.getSeconds() - ((nb_values_in_payload-i)*data.time_step*60));
      data.increments.push([d.toISOString(),(payload[6+2*i] & 0xFF) << 8 | (payload[7+2*i] & 0xFF)])
    }else data.increments.push((payload[6+2*i] & 0xFF) << 8 | (payload[7+2*i] & 0xFF))
  }
  var idx = data.index
  for(var i=nb_values_in_payload;i>=0;i--){
    if(recvTime != null){
      var d = new Date(recvTime)
      d.setSeconds(d.getSeconds() - ((nb_values_in_payload-i)*data.time_step*60));
      data.indexes.unshift([d.toISOString(),idx])
      if(i!=0) idx -= data.increments[i-1][1]
    }else{
      data.indexes.unshift(idx)
      if(i!=0) idx -= data.increments[i-1]
    }
  }
  return data
}

function decode_T2_AP(payload){
  var data = {};
  data.firmware_version = payload[1]+"."+payload[2]+"."+payload[3];
  data.index = (payload[4] & 0xFF) << 24 | (payload[5] & 0xFF) << 16 | (payload[6] & 0xFF) << 8 | (payload[7] & 0xFF);
  data.time_step = payload[8];
  data.number_of_values = payload[9];
  data.redundancy = payload[10];
  return data;
}

exports.decodeUplink = decodeUplink;

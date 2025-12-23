const PAYLOAD_TYPE = {
  T1       :  {header: 0x6d, size_min: 8/*in bytes*/, size_max: 46/*in bytes*/, name: "T1"},
  T2       :  {header: 0x6e, size: 15/*in bytes*/, name: "T2"},
  TT1      :  {header: 0x2e, size: 22/*in bytes*/, name: "TT1"},
  TT6      :  {header: 0x2f, size: 42/*in bytes*/, name: "TT6"},
  START    :  {header: 0x01, size: 3/*in bytes*/,  name: "START"}
}

function decodeUplink(input){
  var decoded = {
    data: {
      index : null,
      message_type : null,
      increments : [],
      indexes: [],
      time_step: null,
      meter_type : "Gas",
      firmware_version: null,
      number_of_starts : null,
      param_id: null,
      redundancy: null,
      number_of_values: null
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
  //Decode message
  if(decoded.data.message_type == PAYLOAD_TYPE.T1.name){
    var data = decode_T1(input.bytes, input.recvTime);
    decoded.data.time_step = data.time_step;
    decoded.data.index = data.index;
    decoded.data.increments = data.increments;
    decoded.data.indexes = data.indexes;
  }else if(decoded.data.message_type == PAYLOAD_TYPE.T2.name){
    var data = decode_T2(input.bytes);
    decoded.data.index = data.index;
    decoded.data.firmware_version = data.firmware_version;
    decoded.data.number_of_starts = data.number_of_starts;
    decoded.data.param_id = data.param_id;
    decoded.data.time_step = data.time_step;
    decoded.data.redundancy = data.redundancy;
    decoded.data.number_of_values = data.number_of_values;
  }
  return decoded
}

//Find message type - return null if nothing found
function find_message_type(payload){
  switch(payload[0]){
    case PAYLOAD_TYPE.T1.header:
      if(payload.length >= PAYLOAD_TYPE.T1.size_min && payload.length <= PAYLOAD_TYPE.T1.size_max) return PAYLOAD_TYPE.T1.name
      break;
    case PAYLOAD_TYPE.TT1.header:
      if(payload.length == PAYLOAD_TYPE.TT1.size) return PAYLOAD_TYPE.TT1.name
      break;
    case PAYLOAD_TYPE.TT6.header:
      if(payload.length == PAYLOAD_TYPE.TT6.size) return PAYLOAD_TYPE.TT6.name
      break;
    case PAYLOAD_TYPE.T2.header:
      if(payload.length == PAYLOAD_TYPE.T2.size) return PAYLOAD_TYPE.T2.name
      break;
    case PAYLOAD_TYPE.START.header:
      if(payload.length == PAYLOAD_TYPE.START.size) return PAYLOAD_TYPE.START.name
      break;
  }
  return null
}

function decode_T1(payload, recvTime){
  var data = {};
  data.time_step = payload[1];
  data.index  = ((payload[2] & 0xFF) << 24 | (payload[3] & 0xFF) << 16 | (payload[4] & 0xFF) << 8 | (payload[5] & 0xFF))/10;
  data.increments = []
  data.indexes = []
  var nb_values_in_payload = (payload.length-6)/2
  for(var i=0;i<nb_values_in_payload;i++){
    if(recvTime != null){
      var d = new Date(recvTime)
      d.setSeconds(d.getSeconds() - ((nb_values_in_payload-i)*data.time_step*60));
      data.increments.push([d.toISOString(),((payload[6+2*i] & 0xFF) << 8 | (payload[7+2*i] & 0xFF))/10])
    }else data.increments.push(((payload[6+2*i] & 0xFF) << 8 | (payload[7+2*i] & 0xFF))/10)
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

function decode_T2(payload){
  var data = {};
  data.number_of_starts = payload[1];
  data.param_id = payload[4];
  data.firmware_version = payload[5];
  data.index = ((payload[8] & 0xFF) << 24 | (payload[9] & 0xFF) << 16 | (payload[10] & 0xFF) << 8 | (payload[11] & 0xFF))/10;
  data.time_step = payload[12];
  data.number_of_values = payload[13];
  data.redundancy = payload[14];
  return data;
}

exports.decodeUplink = decodeUplink;

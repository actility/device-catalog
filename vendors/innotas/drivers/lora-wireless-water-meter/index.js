function Decode(fPort, bytes, variables) 
{
  var data={};
  var value = 0;
  var index = 0;
  switch (fPort)
  {
    case 1:
        value = bytes[index++] << 24;
    	value |= bytes[index++]<< 16;
    	value |= bytes[index++]<< 8;
    	value |= bytes[index++];  
      	data.ZS = value;
    break;
    case 2:
        value = bytes[index++] << 24;
    	value |= bytes[index++]<< 16;
    	value |= bytes[index++]<< 8;
    	value |= bytes[index++];  
      	data.ZS = value;
        value = bytes[index++] << 24;
    	value |= bytes[index++]<< 16;
    	value |= bytes[index++]<< 8;
    	value |= bytes[index++];  
      	data.STZS = value;
      break;
	case 3:
    	value = bytes[index++] << 24;
    	value |= bytes[index++]<< 16;
    	value |= bytes[index++]<< 8;
    	value |= bytes[index++];    
    	data.ZS = value;
    	
    	value = bytes[index++]<< 8;
    	value |= bytes[index++];   		
		data.Max_DF_L_pro_h = value;
		
		value = bytes[index++];   		
		data.Still_proz_pro_Tag = value/(2.0);
		
    	value = bytes[index++]<< 8;
    	value |= bytes[index++];   		
		data.Max_Start_Tag = value;
		
    	value = bytes[index++]<< 8;
    	value |= bytes[index++];   		
		data.Min_DF_L_pro_h = value;		
	break;	
	case 4:
		value = bytes[index++] << 24;
    	value |= bytes[index++]<< 16;
    	value |= bytes[index++]<< 8;
    	value |= bytes[index++];    
    	data.ZS = value;	
		
		value = bytes[index++]<< 8;
    	value |= bytes[index++];   		
		data.DF_L_h1 = value;

		value = bytes[index++]<< 8;
    	value |= bytes[index++];   		
		data.DF_L_h2 = value;

		value = bytes[index++]<< 8;
    	value |= bytes[index++];   		
		data.DF_L_h3 = value;

		value = bytes[index++]<< 8;
    	value |= bytes[index++];   		
		data.DF_L_h4 = value;

	break;	
    case 9:
		value = bytes[index++] << 24;
    	value |= bytes[index++]<< 16;
    	value |= bytes[index++]<< 8;
    	value |= bytes[index++];    
    	data.SF7 = value;			
		value = bytes[index++] << 24;
    	value |= bytes[index++]<< 16;
    	value |= bytes[index++]<< 8;
    	value |= bytes[index++];    
    	data.SF8 = value;			
		value = bytes[index++] << 24;
    	value |= bytes[index++]<< 16;
    	value |= bytes[index++]<< 8;
    	value |= bytes[index++];    
    	data.SF9 = value;			
		value = bytes[index++] << 24;
    	value |=bytes[index++]<< 16;
    	value |=bytes[index++]<< 8;
    	value |=bytes[index++];    
    	data.SF10 = value;			
		value = bytes[index++] << 24;
    	value |=bytes[index++]<< 16;
    	value |=bytes[index++]<< 8;
    	value |=bytes[index++];    
    	data.SF11 = value;			
		value = bytes[index++] << 24;
    	value |= bytes[index++]<< 16;
    	value |= bytes[index++]<< 8;
    	value |= bytes[index++];    
    	data.SF12 = value;			      
    break;
    case 10:
    	if (typeof(data.STATUS) == "undefined") 
    	{
      		data.STATUS = {};
    	}  
      	value = bytes[index++]<< 8;
    	value |= bytes[index++];    
    	data.STATUS.ERROR_RESET = bytes[index] & 32;
      	data.STATUS.ERROR_RF = bytes[index] & 16;
      	data.STATUS.ERROR_CS = bytes[index] & 8;
      	data.STATUS.ERROR_BATT = bytes[index] & 4;
      	data.STATUS.ERROR_SABOT = bytes[index] & 2;
      	data.STATUS.ERROR_MESS = bytes[index] & 1;
      	index++;
      	
      	data.STATUS.ST = bytes[index] & 8;
      	if (bytes[index] & 4) data.STATUS.INTERVALL= "2min";
      	else
        if ((bytes[index] & 3)==3) data.STATUS.INTERVALL= "14tägl";
      	else
        if ((bytes[index] & 3)==2) data.STATUS.INTERVALL= "7tägl";
      	else
        if ((bytes[index] & 3)==1) data.STATUS.INTERVALL= "1tägl";  
      	else data.STATUS.INTERVALL= "norm";
    break;
  }    
  return data;
}

exports.Decode = Decode;
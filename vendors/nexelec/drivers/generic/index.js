///////////////////////////////////////////////////////////////////////////////////
// NEXELEC
// THIS SOFTWARE IS PROVIDED BY NEXELEC ``AS IS'' AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL NEXELEC BE LIABLE FOR ANY
// DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
///////////////////////////////////////////////////////////////////////////////////

function Decoder(input)
{
//var hex2=[];
var decode=[];
var string_bin=""
var tab_bin=[];
var string_bin_elements=""; 
var buffer=[];
var buffer2=[];
var i=0;
var j=0;
var str=0
var compte=0;
var product_type=0;

// On passe d'un chaine de caractÃ¨re Ã  un tableau d'hexa
// On crÃ©e un tableau d'hexa (buffer2) 

for(i=0; i<input.length;i++)
{
   str=parseInt(input[i], 16);
   buffer2.push(str);
}

// on viens lire chaque Ã©lement du tableau buffer2 pour les convertir en binaire en un seul string.

for(i=0;i<input.length;i++){ 
     string_bin_elements=buffer2[i].toString(2);
     if(string_bin_elements.length<8)
     { // PadStart 
       var nb_zeros=4-string_bin_elements.length;
       for (j=0;j<nb_zeros;j++)
       {
         string_bin_elements="0"+string_bin_elements;
       }
     }
     string_bin=string_bin+string_bin_elements;
 }
 
 for(i=0;i<input.length;i++){
     buffer[i]=""
    for( j=0;j<4;j++)
    { // tableau contenant un hexa de la payload par adresse
        buffer[i]=buffer[i]+string_bin.charAt(compte);
        compte++;
    }
    buffer[i]=parseInt(buffer[i],2);
}

product_type = (buffer[0] << 4) + buffer[1];

const ATMO_LoRa=0xA3; 
const SENSE_LoRa=0xA4; 
const AERO_LoRa=0xA5; 
const PMI_LoRa=0xA6; 
const Aero_CO2_LoRa=0xA7; 

switch(product_type){

	case  ATMO_LoRa:
        decode[0]={"Type_of_Product":"ATMO_LoRa"};	
		break;
	case  SENSE_LoRa:
        decode[0]={"Type_of_Product":"SENSE_LoRa"};	
		break;	
	case  Aero_CO2_LoRa:
        decode[0]={"Type_of_Product":"Aero_CO2_LoRa"};	
		break;		
    case  AERO_LoRa:
        decode[0]={"Type_of_Product":"AERO_LoRa"};	
		break;
	case  PMI_LoRa:
        decode[0]={"Type_of_Product":"PMI_LoRa"};	
		break;
}
    
tab_adjectif_level=["Very Good","Good","Average","Warning","Bad","Erreur"];
tab_adjectif_SRC=["All","Dryness Indicator","Mould Indicator","Dust Mites Indicator","CO","CO2","VOC","Formaldehyde","PM1.0", "PM2.5","PM10","Erreur"];


if (product_type== ATMO_LoRa || product_type== SENSE_LoRa || product_type== AERO_LoRa || product_type== PMI_LoRa || product_type== Aero_CO2_LoRa)
{
        var tab_decodage_ATMO_Real_Time=[8,8,11,11,11,10,8,14,14,10,3,4,3,3,3,3,3,3,3,8,7,7,8,10,16,8,8,3,4,3,3,3,3,3,5];
    	var tab_decodage_Atmo_Product_Status_Message=[8,8,8,8,10,10,1,2,2,2,2,2,2,2,2,2,2,1,8,6,4,5,5,6,4];
    	var tab_decodage_Atmo_Product_Configuration_Message=[8,8,2,2,1,2,1,1,1,2,1,3,8,8,8,8,8,10,10,10,2,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8];
    	var tab_decodage_Atmo_Keepalive_Message=[8,8];
    	var tab_decodage_Atmo_Button_Frame_Message=[8,8];
    
    	// On initialise les diffÃ©rents type de message 
    	var Type_ATMO_Real_Time=0x01;
    	var Type_Atmo_Product_Status_Message=0x02;
    	var Type_Atmo_Product_Configuration_Message=0x03;
    	var Type_Atmo_Keepalive_Message=0x04;
    	var Type_Atmo_Button_Frame=0x05;
        
        message_type = (buffer[2] << 4) + buffer[3];
        switch(message_type){
            case Type_ATMO_Real_Time:
				 tab_decode(tab_decodage_ATMO_Real_Time);
				 decode[1]={"Type_of_message":"Real_Time"};
				 decode[2]={"Concentration_PM_1":tab_bin[2]};
				 decode[3]={"Concentration_PM_2.5":tab_bin[3]};
				 decode[4]={"Concentration_PM_10":tab_bin[4]};
				 decode[5]={"Temperature(Â°C)": temp_PM(tab_bin[5])};
				 decode[6]={"Relative_Humidity_(%RH)": RH(tab_bin[6])};
				 decode[7]={"Total_CO2(ppm)": tab_bin[7]};
				 decode[8]={"Total_COV(ppm)": tab_bin[8]};
				 decode[9]={"Formaldehydes(ppb)": tab_bin[9]};
				 decode[10]={"IZIAIR_Level": get_iaq(tab_bin[10])};
				 decode[11]={"IZIAIR_Source": get_iaq_SRC(tab_bin[11])};
				 decode[12]={"IAQ_CO2": get_iaq(tab_bin[12])};
				 decode[13]={"IAQ_VOCs": get_iaq(tab_bin[13])};
				 decode[14]={"IAQ_Formaldehyde": get_iaq(tab_bin[14])};
				 decode[15]={"IAQ_PM1.0": get_iaq(tab_bin[15])};
				 decode[16]={"IAQ_PM2.5": get_iaq(tab_bin[16])};
				 decode[17]={"IAQ_PM10": get_iaq(tab_bin[17])};
				 decode[18]={"IAQ_TH": get_iaq(tab_bin[18])};
				 decode[19]={"Luminosity(lux)": 5*(tab_bin[19])};
				 decode[20]={"Average_Noise(dB)": tab_bin[20]};
				 decode[21]={"Peak_Noise(dB)": tab_bin[21]};
				 decode[22]={"Presence_counter": tab_bin[22]};
				 decode[23]={"Pressure": pressure(tab_bin[23])};
				 decode[24]={"Frame_index": tab_bin[33]};
			break;
             
            case Type_Atmo_Product_Status_Message:
                tab_decode(tab_decodage_Atmo_Product_Status_Message);
                decode[1]={"Type_of_message":"Product_Status"};
                decode[2]={"HW_Version":tab_bin[2]};
                decode[3]={"SW_Version":tab_bin[3]};
                decode[4]={"Product_HW_Status": hardware_status(tab_bin[6])};
                decode[5]={"PM_sensor_status": sensor_status(tab_bin[7])};
                decode[6]={"Temperature_sensor_status": sensor_status(tab_bin[8])};
                decode[7]={"Formaldehyde_sensor_status": sensor_status(tab_bin[9])};
                decode[8]={"CO2_sensor_status": sensor_status(tab_bin[10])};
                decode[9]={"COV_sensor_status": sensor_status(tab_bin[11])};
                decode[10]={"PIR_sensor_status": sensor_status(tab_bin[12])};
                decode[11]={"Microphone_status": sensor_status(tab_bin[13])};
                decode[12]={"Pressure Sensor Status":sensor_status(tab_bin[14])};
		    	decode[13]={"Accelerometer Sensor Status":sensor_status(tab_bin[15])};
			    decode[14]={"Luminosity Sensor Status":sensor_status(tab_bin[16])};
			    decode[15]={"Pending Join":PendingJoin(tab_bin[17])};
			    decode[16]={"Product Activation time-counter":tab_bin[18]};
			    decode[17]={"Product Date Year":tab_bin[19]};
			    decode[18]={"Product Date Month":tab_bin[20]};
			    decode[19]={"Product Date Day":tab_bin[21]};
			    decode[20]={"Product Date Hour":tab_bin[22]};
			    decode[21]={"Product Date Minute":tab_bin[23]};
			break;
                
            case Type_Atmo_Product_Configuration_Message:
    			tab_decode(tab_decodage_Atmo_Product_Configuration_Message);
    			decode[1]={"Type_of_message":"Product_Configuration_Message"};
    			decode[2]={"Reconfiguration source": reconfiguration_source(tab_bin[2])};
    			decode[3]={"Reconfiguration status": reconfiguration_status(tab_bin[3])};
    			decode[4]={"LED enable": active(tab_bin[4])};
    			decode[5]={"LED function":LED_function(tab_bin[5])};
    			decode[6]={"IAQ Medium levels indication enable": active(tab_bin[6])};
    			decode[7]={"Button enable": active(tab_bin[7])};
    			decode[8]={"Keepalive enable": active(tab_bin[8])};
    			decode[9]={"NFC_status":nfc_status(tab_bin[9])};
    			decode[11]={"LoRa Region": LoRa_Region(tab_bin[11])};
    			decode[12]={"Period between measurements (minutes)": tab_bin[12]};
    			decode[13]={"Keepalive period (hours)": tab_bin[13]};
    			decode[14]={"Altitude":50*tab_bin[14]};
    			decode[15]={"CO2 threshold 1":20*tab_bin[15]};
    			decode[16]={"CO2 threshold 2":20*tab_bin[16]};
    		break;
		    
		    case Type_Atmo_Button_Frame:
			    tab_decode(tab_decodage_Atmo_Button_Frame_Message);
			    decode[1]={"Type_of_message":"Button Frame"};
	        break;
	        
	        case Type_Atmo_Keepalive_Message:
			    tab_decode(tab_decodage_Atmo_Keepalive_Message);
			    decode[1]={"Type_of_message":"Keepalive_Message"};
	        break;
	        
        }
}

var new_msg={payload:decode};
return new_msg;  

function tab_decode (tab){ // on rentre en paramÃ¨tre la table propre Ã  chaque message 
	var compteur=0;
	for ( i=0; i<tab.length;i++){  // tab.length nousdonne donc le nombre d'information Ã  dÃ©coder pour ce message 
		tab_bin[i]="";
		for ( j=0; j<tab[i];j++){ // tab[i] nous donne le nombre de bits sur lequel est codÃ©e l'information i 
			str1=string_bin.charAt(compteur); // compteur va aller de 0 jusqu'Ã  la longueur de string_bin
			tab_bin[i]=tab_bin[i]+str1;       // A la fin de ce deuxiÃ¨me for: tab_bin[i] sera composÃ© de tab[i] bits 
			compteur++;
		}
		// ProblÃ¨me si tab[i] bits est diffÃ©rent de 4 (ou 8) bits ca ne correspond Ã  1 (ou 2) hexa donc:  ne pourra pas conrrectement convertir les binaires en hexa
		// Donc  il faut qu'on fasse un bourrage de 0 grÃ¢ce Ã  padstart
		if (tab_bin[i].length>4){ // pour les donnÃ©es de tailles supÃ©rieures Ã  4 bits et infÃ©ireures ou Ã©gales Ã  8 bits		
			tab_bin[i]=tab_bin[i].padStart(8,'0');
			tab_bin[i]=parseInt(tab_bin[i] , 2).toString(16).toUpperCase(); // Puis on convertit les binaire en hexa (en string)
			tab_bin[i]=parseInt(tab_bin[i],16) ;//puis on convertit les string en int	
		}
		else{ // pour les donnÃ©es de tailles infÃ©rieures ou Ã©gales Ã  4 bits
			tab_bin[i]=tab_bin[i].padStart(4,'0');
			tab_bin[i]=parseInt(tab_bin[i] , 2).toString(16).toUpperCase();
			tab_bin[i]=parseInt(tab_bin[i], 16);
		}
	}
 }


function battery(a){
    result="";
    switch(a){
        case 0:
            result="High";
            break
        case 1: 
            result="Medium";
            break
        case 2: 
            result="Critical";
            break
        }
    return result;
}
    

function hw_mode(a){
    result="";
    switch(a){
        case 0:
            result="Sensor OK";
            break
        case 1: 
            result="Sensor fault";
            break
        }
    return result;
}
    
function push_button(a){
    result="";
    switch(a){
        case 0: 
            result="Short Push";
            break
            
        case 1: 
            result="Long Push";
            break
            
        case 2: 
            result="Multiple Push(x3)";     
            break
            
        case 3: 
            result="Multiple Push(x6)";     
            break                
    }
    
    return result;
}

function th(a){
    result="";
    switch(a){
        case 0: 
            result="not reached";
            break
    
    
        case 1: 
            result="reached";
            break
    }
    
    return result;
}

function active(a){
    result="";
    switch(a){
        case 0: 
            result="Non-Active";
           break
        case 1: 
            result="Active";
    }
    return result;
}


function temp_PM(a){
    switch(a){
        case 1023:
            result=65535;
           break;
        default :
            result=0.1*(a-300);
    }
    return result;
}

function RH_PM(a){

    switch(a){
        case 127: 
            result=127;
           break
        default : 
            result=a;
    }
    return result;
}

function micro_PM(a){

    switch(a){
        case 65535: 
            result=a;
           break
        default : 
            result=0.1*a;
    }
    return result;
}

function pcs_PM(a){

    switch(a){
        case 65535: 
            result=65535;
           break
        default : 
            result=a;
    }
    return result;
}

function sensor_status(a){
    result="";
    switch(a){
        case 0:
            result="Sensor OK";
            break;
        case 1: 
            result="Sensor Fault";
            break;
        case 2: 
            result="Sensor not populated";
            break;
    }
    return result;
}

function hardware_status(a){
    result="";
    switch(a){
        case 0:
            result="Hardware OK";
            break;
        case 1: 
            result="Hardware Fault";
            break;
    }
    return result;
}

function temp(a){
    if(a == 255){
        return a;
    }
    
    else{
        return 0.2*a;
    }
}

function co2(a){
    if(a == 255){
        return a;
    }
    
    else{
        return 20*a;
    }
}


function RH(a){
    if(a == 255){
        return a;
    }
    else{
        return 0.5*a;
    }
}


function get_iaq (a){
    var result="";
    switch(a){
        case 0:
        result=tab_adjectif_level[0];
        break;
         
        case 1:
        result=tab_adjectif_level[1];
        break;
         
        case 2:
        result=tab_adjectif_level[2];
        break;
         
        case 3:
        result=tab_adjectif_level[3];
        break;
    
        case 4:
        result=tab_adjectif_level[4];
        break;
         
        case 7:
        result=tab_adjectif_level[5];
        break;

    }
    return result; 
}


function get_iaq_SRC(a){
    var result="";
    
    switch(a){
        case 0:
        result=tab_adjectif_SRC[0];
        break;
         
        case 1:
        result=tab_adjectif_SRC[1];
        break;
         
        case 2:
        result=tab_adjectif_SRC[2];
        break;
         
        case 3:
        result=tab_adjectif_SRC[3];
        break;
    
        case 4:
        result=tab_adjectif_SRC[4];
        break;
         
        case 5:
        result=tab_adjectif_SRC[5];
        break;
        
        case 6:
        result=tab_adjectif_SRC[6];
        break;
        
        case 7:
        result=tab_adjectif_SRC[7];
        break;
        
        case 8:
        result=tab_adjectif_SRC[8];
        break;
        
        case 15:
        result=tab_adjectif_SRC[9];
        break;
    }
    return result; 
}


function get_IAQ_HCI(a){
    var result="";
    switch(a){
        case 0:
        result=tab_adjectif_level[1];
        break;
         
        case 1:
        result=tab_adjectif_level[2];
        break;
         
        case 2:
        result=tab_adjectif_level[4];
        break;
         
        case 3:
        result=tab_adjectif_level[5];
        break;
    }
    return result; 
}

function HW_SW_Revision(a)
{
    result="";
    switch(a)
	{
        case 0:
            result="A";
            break;
        case 1: 
            result="B";
            break;
        case 2: 
            result="C";
            break;
		case 3: 
            result="D";
            break;
        case 4: 
            result="E";
            break;
        case 5: 
            result="F";
            break;
        case 6: 
            result="G";
            break;			
    }
    return result;
}

function Yes_No(a)
{
	result="";
	switch(a)
	{
		case 0:
			result="No";
			break;
		case 1:
			result="Yes";
			break;
	}
	return result;
}

function battery_level(a){
result="";
switch(a){
    case 0:
        result="High";
        break;
    case 1: 
        result="Medium";
        break;
    case 2: 
        result="Low";
        break;
	case 3: 
        result="Critical";
        break;
}
return result;
}

function temperature_9bits(a)
{
	if(a > 500)
	{
		return 511;
	}	
	else
	{
		return 0.1*a;
	}
}
	
function nfc_status(a)
{
    if (a===0){
        return "Discoverable";
    }else if(a===1){
        return "Not discoverable"
    }else {
        return "RFU"
    }
}


function LoRa_Region(a)
{
  result="";
	switch(a){
  	case 0: 
  		result="EU868";
  		break;
  	}
  	return result;
}

function reconfiguration_source(a)
{
  result="";
	switch(a){
  	case 0: 
  		result="NFC";
  	break;
  	
  	case 1:
  	 	result="Downlink"; 
   	break;
  	
  	case 2:
  	  	result="Product start-up";
  	break;
  }
  return result;
}

function reconfiguration_status(a)
{
  result="";
	switch(a){
  	case 0: 
  		result="Total success";
  	break;
  	
  	case 1:
  	 	result="Partial success"; 
  	break;
  	
  	case 2:
  	  	result="Total failure";
  	break;
  }
  return result;
}	

function PM(a)
{
	result="Error";
	
	if(a == 2047){
        return result;
    }
    
    else{
        return a;
    }
}

function CO2COV(a)
{
	result="Error";
	
	if(a == 16383){
        return result;
    }
    
    else{
        return a;
    }
}

function Formaldehyde(a)
{
	result="Error";
	
	if(a == 1047){
        return result;
    }
    
    else{
        return a;
    }
}

function Luminosity(a)
{
	result="Error";
	
	if(a == 255){
        return result;
    }
    
    else{
        return a*5;
    }
}

function Noise(a)
{
	result="Error";
	
	if(a == 127){
        return result;
    }
    
    else{
        return a;
    }
}

function Occupancy(a)
{
	result="Error";
	
	if(a == 255){
        return result;
    }
    
    else{
        return a;
    }
}

function Voltage(a)
{
	return a*1000
}

function HardwareStatus(a)
{
	result="";
    switch(a){
        case 0: 
            result="Hardware OK ";
            break;
        case 1: 
            result="Hardware fault ";
            break;
    }
    return result;
}

function pressure(a){
    switch(a){
        case 1023:
            result=65535;
           break;
        default :
            result=a+300;
    }
    return result;

}

function PendingJoin(a)
{
	result="";
    switch(a){
        case 0: 
            result="No join request scheduled";
            break;
        case 1: 
            result="Join request scheduled";
            break;
    }
    return result;
}

function LED_function(a){
    result="";
    switch(a){
        case 0: 
            result="Global Air Quality";
            break;
        case 1: 
            result="CO2 level";
            break;
    }
    return result;
}

} // fin de la fonction Decoder

console.log(
///////////////////////////////////////////////////////////////////////////////////
// NEXELEC
// THIS SOFTWARE IS PROVIDED BY NEXELEC ``AS IS'' AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL NEXELEC BE LIABLE FOR ANY
// DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
///////////////////////////////////////////////////////////////////////////////////

function Decoder(input)
{
//var hex2=[];
var decode=[];
var string_bin=""
var tab_bin=[];
var string_bin_elements=""; 
var buffer=[];
var buffer2=[];
var i=0;
var j=0;
var str=0
var compte=0;
var product_type=0;

// On passe d'un chaine de caractÃ¨re Ã  un tableau d'hexa
// On crÃ©e un tableau d'hexa (buffer2) 

for(i=0; i<input.length;i++)
{
   str=parseInt(input[i], 16);
   buffer2.push(str);
}

// on viens lire chaque Ã©lement du tableau buffer2 pour les convertir en binaire en un seul string.

for(i=0;i<input.length;i++){ 
     string_bin_elements=buffer2[i].toString(2);
     if(string_bin_elements.length<8)
     { // PadStart 
       var nb_zeros=4-string_bin_elements.length;
       for (j=0;j<nb_zeros;j++)
       {
         string_bin_elements="0"+string_bin_elements;
       }
     }
     string_bin=string_bin+string_bin_elements;
 }
 
 for(i=0;i<input.length;i++){
     buffer[i]=""
    for( j=0;j<4;j++)
    { // tableau contenant un hexa de la payload par adresse
        buffer[i]=buffer[i]+string_bin.charAt(compte);
        compte++;
    }
    buffer[i]=parseInt(buffer[i],2);
}

product_type = (buffer[0] << 4) + buffer[1];

const ATMO_LoRa=0xA3; 
const SENSE_LoRa=0xA4; 
const AERO_LoRa=0xA5; 
const PMI_LoRa=0xA6; 
const Aero_CO2_LoRa=0xA7; 

switch(product_type){

	case  ATMO_LoRa:
        decode[0]={"Type_of_Product":"ATMO_LoRa"};	
		break;
	case  SENSE_LoRa:
        decode[0]={"Type_of_Product":"SENSE_LoRa"};	
		break;	
	case  Aero_CO2_LoRa:
        decode[0]={"Type_of_Product":"Aero_CO2_LoRa"};	
		break;		
    case  AERO_LoRa:
        decode[0]={"Type_of_Product":"AERO_LoRa"};	
		break;
	case  PMI_LoRa:
        decode[0]={"Type_of_Product":"PMI_LoRa"};	
		break;
}
    
tab_adjectif_level=["Very Good","Good","Average","Warning","Bad","Erreur"];
tab_adjectif_SRC=["All","Dryness Indicator","Mould Indicator","Dust Mites Indicator","CO","CO2","VOC","Formaldehyde","PM1.0", "PM2.5","PM10","Erreur"];


if (product_type== ATMO_LoRa || product_type== SENSE_LoRa || product_type== AERO_LoRa || product_type== PMI_LoRa || product_type== Aero_CO2_LoRa)
{
        var tab_decodage_ATMO_Real_Time=[8,8,11,11,11,10,8,14,14,10,3,4,3,3,3,3,3,3,3,8,7,7,8,10,16,8,8,3,4,3,3,3,3,3,5];
    	var tab_decodage_Atmo_Product_Status_Message=[8,8,8,8,10,10,1,2,2,2,2,2,2,2,2,2,2,1,8,6,4,5,5,6,4];
    	var tab_decodage_Atmo_Product_Configuration_Message=[8,8,2,2,1,2,1,1,1,2,1,3,8,8,8,8,8,10,10,10,2,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8];
    	var tab_decodage_Atmo_Keepalive_Message=[8,8];
    	var tab_decodage_Atmo_Button_Frame_Message=[8,8];
    
    	// On initialise les diffÃ©rents type de message 
    	var Type_ATMO_Real_Time=0x01;
    	var Type_Atmo_Product_Status_Message=0x02;
    	var Type_Atmo_Product_Configuration_Message=0x03;
    	var Type_Atmo_Keepalive_Message=0x04;
    	var Type_Atmo_Button_Frame=0x05;
        
        message_type = (buffer[2] << 4) + buffer[3];
        switch(message_type){
            case Type_ATMO_Real_Time:
				 tab_decode(tab_decodage_ATMO_Real_Time);
				 decode[1]={"Type_of_message":"Real_Time"};
				 decode[2]={"Concentration_PM_1":tab_bin[2]};
				 decode[3]={"Concentration_PM_2.5":tab_bin[3]};
				 decode[4]={"Concentration_PM_10":tab_bin[4]};
				 decode[5]={"Temperature(Â°C)": temp_PM(tab_bin[5])};
				 decode[6]={"Relative_Humidity_(%RH)": RH(tab_bin[6])};
				 decode[7]={"Total_CO2(ppm)": tab_bin[7]};
				 decode[8]={"Total_COV(ppm)": tab_bin[8]};
				 decode[9]={"Formaldehydes(ppb)": tab_bin[9]};
				 decode[10]={"Luminosity(lux)": 5*(tab_bin[19])};
				 decode[11]={"Average_Noise(dB)": tab_bin[20]};
				 decode[12]={"Peak_Noise(dB)": tab_bin[21]};
				 decode[13]={"Presence_counter": tab_bin[22]};
				 decode[14]={"Pressure": pressure(tab_bin[23])};
				 decode[15]={"Frame_index": tab_bin[33]};
			break;
             
            case Type_Atmo_Product_Status_Message:
                tab_decode(tab_decodage_Atmo_Product_Status_Message);
                decode[1]={"Type_of_message":"Product_Status"};
                decode[2]={"HW_Version":tab_bin[2]};
                decode[3]={"SW_Version":tab_bin[3]};
                decode[4]={"Product_HW_Status": hardware_status(tab_bin[6])};
                decode[5]={"PM_sensor_status": sensor_status(tab_bin[7])};
                decode[6]={"Temperature_sensor_status": sensor_status(tab_bin[8])};
                decode[7]={"Formaldehyde_sensor_status": sensor_status(tab_bin[9])};
                decode[8]={"CO2_sensor_status": sensor_status(tab_bin[10])};
                decode[9]={"COV_sensor_status": sensor_status(tab_bin[11])};
                decode[10]={"PIR_sensor_status": sensor_status(tab_bin[12])};
                decode[11]={"Microphone_status": sensor_status(tab_bin[13])};
                decode[12]={"Pressure Sensor Status":sensor_status(tab_bin[14])};
		    	decode[13]={"Accelerometer Sensor Status":sensor_status(tab_bin[15])};
			    decode[14]={"Luminosity Sensor Status":sensor_status(tab_bin[16])};
			    decode[15]={"Pending Join":PendingJoin(tab_bin[17])};
			    decode[16]={"Product Activation time-counter":tab_bin[18]};
			    decode[17]={"Product Date Year":tab_bin[19]};
			    decode[18]={"Product Date Month":tab_bin[20]};
			    decode[19]={"Product Date Day":tab_bin[21]};
			    decode[20]={"Product Date Hour":tab_bin[22]};
			    decode[21]={"Product Date Minute":tab_bin[23]};
			break;
                
            case Type_Atmo_Product_Configuration_Message:
    			tab_decode(tab_decodage_Atmo_Product_Configuration_Message);
    			decode[1]={"Type_of_message":"Product_Configuration_Message"};
    			decode[2]={"Reconfiguration source": reconfiguration_source(tab_bin[2])};
    			decode[3]={"Reconfiguration status": reconfiguration_status(tab_bin[3])};
    			decode[4]={"LED enable": active(tab_bin[4])};
    			decode[5]={"LED function":LED_function(tab_bin[5])};
    			decode[6]={"IAQ Medium levels indication enable": active(tab_bin[6])};
    			decode[7]={"Button enable": active(tab_bin[7])};
    			decode[8]={"Keepalive enable": active(tab_bin[8])};
    			decode[9]={"NFC_status":nfc_status(tab_bin[9])};
    			decode[11]={"LoRa Region": LoRa_Region(tab_bin[11])};
    			decode[12]={"Period between measurements (minutes)": tab_bin[12]};
    			decode[13]={"Keepalive period (hours)": tab_bin[13]};
    			decode[14]={"CO2 threshold 1":20*tab_bin[15]};
    			decode[15]={"CO2 threshold 2":20*tab_bin[16]};
    		break;
		    
		    case Type_Atmo_Button_Frame:
			    tab_decode(tab_decodage_Atmo_Button_Frame_Message);
			    decode[1]={"Type_of_message":"Button Frame"};
	        break;
	        
	        case Type_Atmo_Keepalive_Message:
			    tab_decode(tab_decodage_Atmo_Keepalive_Message);
			    decode[1]={"Type_of_message":"Keepalive_Message"};
	        break;
	        
        }
}

var new_msg={payload:decode};
return new_msg;  

function tab_decode (tab){ // on rentre en paramÃ¨tre la table propre Ã  chaque message 
	var compteur=0;
	for ( i=0; i<tab.length;i++){  // tab.length nousdonne donc le nombre d'information Ã  dÃ©coder pour ce message 
		tab_bin[i]="";
		for ( j=0; j<tab[i];j++){ // tab[i] nous donne le nombre de bits sur lequel est codÃ©e l'information i 
			str1=string_bin.charAt(compteur); // compteur va aller de 0 jusqu'Ã  la longueur de string_bin
			tab_bin[i]=tab_bin[i]+str1;       // A la fin de ce deuxiÃ¨me for: tab_bin[i] sera composÃ© de tab[i] bits 
			compteur++;
		}
		// ProblÃ¨me si tab[i] bits est diffÃ©rent de 4 (ou 8) bits ca ne correspond Ã  1 (ou 2) hexa donc:  ne pourra pas conrrectement convertir les binaires en hexa
		// Donc  il faut qu'on fasse un bourrage de 0 grÃ¢ce Ã  padstart
		if (tab_bin[i].length>4){ // pour les donnÃ©es de tailles supÃ©rieures Ã  4 bits et infÃ©ireures ou Ã©gales Ã  8 bits		
			tab_bin[i]=tab_bin[i].padStart(8,'0');
			tab_bin[i]=parseInt(tab_bin[i] , 2).toString(16).toUpperCase(); // Puis on convertit les binaire en hexa (en string)
			tab_bin[i]=parseInt(tab_bin[i],16) ;//puis on convertit les string en int	
		}
		else{ // pour les donnÃ©es de tailles infÃ©rieures ou Ã©gales Ã  4 bits
			tab_bin[i]=tab_bin[i].padStart(4,'0');
			tab_bin[i]=parseInt(tab_bin[i] , 2).toString(16).toUpperCase();
			tab_bin[i]=parseInt(tab_bin[i], 16);
		}
	}
 }


function battery(a){
    result="";
    switch(a){
        case 0:
            result="High";
            break
        case 1: 
            result="Medium";
            break
        case 2: 
            result="Critical";
            break
        }
    return result;
}
    

function hw_mode(a){
    result="";
    switch(a){
        case 0:
            result="Sensor OK";
            break
        case 1: 
            result="Sensor fault";
            break
        }
    return result;
}
    
function push_button(a){
    result="";
    switch(a){
        case 0: 
            result="Short Push";
            break
            
        case 1: 
            result="Long Push";
            break
            
        case 2: 
            result="Multiple Push(x3)";     
            break
            
        case 3: 
            result="Multiple Push(x6)";     
            break                
    }
    
    return result;
}

function th(a){
    result="";
    switch(a){
        case 0: 
            result="not reached";
            break
    
    
        case 1: 
            result="reached";
            break
    }
    
    return result;
}

function active(a){
    result="";
    switch(a){
        case 0: 
            result="Non-Active";
           break
        case 1: 
            result="Active";
    }
    return result;
}


function temp_PM(a){
    switch(a){
        case 1023:
            result=65535;
           break;
        default :
            result=0.1*(a-300);
    }
    return result;
}

function RH_PM(a){

    switch(a){
        case 127: 
            result=127;
           break
        default : 
            result=a;
    }
    return result;
}

function micro_PM(a){

    switch(a){
        case 65535: 
            result=a;
           break
        default : 
            result=0.1*a;
    }
    return result;
}

function pcs_PM(a){

    switch(a){
        case 65535: 
            result=65535;
           break
        default : 
            result=a;
    }
    return result;
}

function sensor_status(a){
    result="";
    switch(a){
        case 0:
            result="Sensor OK";
            break;
        case 1: 
            result="Sensor Fault";
            break;
        case 2: 
            result="Sensor not populated";
            break;
    }
    return result;
}

function hardware_status(a){
    result="";
    switch(a){
        case 0:
            result="Hardware OK";
            break;
        case 1: 
            result="Hardware Fault";
            break;
    }
    return result;
}

function temp(a){
    if(a == 255){
        return a;
    }
    
    else{
        return 0.2*a;
    }
}

function co2(a){
    if(a == 255){
        return a;
    }
    
    else{
        return 20*a;
    }
}


function RH(a){
    if(a == 255){
        return a;
    }
    else{
        return 0.5*a;
    }
}


function get_iaq (a){
    var result="";
    switch(a){
        case 0:
        result=tab_adjectif_level[0];
        break;
         
        case 1:
        result=tab_adjectif_level[1];
        break;
         
        case 2:
        result=tab_adjectif_level[2];
        break;
         
        case 3:
        result=tab_adjectif_level[3];
        break;
    
        case 4:
        result=tab_adjectif_level[4];
        break;
         
        case 7:
        result=tab_adjectif_level[5];
        break;

    }
    return result; 
}


function get_iaq_SRC(a){
    var result="";
    
    switch(a){
        case 0:
        result=tab_adjectif_SRC[0];
        break;
         
        case 1:
        result=tab_adjectif_SRC[1];
        break;
         
        case 2:
        result=tab_adjectif_SRC[2];
        break;
         
        case 3:
        result=tab_adjectif_SRC[3];
        break;
    
        case 4:
        result=tab_adjectif_SRC[4];
        break;
         
        case 5:
        result=tab_adjectif_SRC[5];
        break;
        
        case 6:
        result=tab_adjectif_SRC[6];
        break;
        
        case 7:
        result=tab_adjectif_SRC[7];
        break;
        
        case 8:
        result=tab_adjectif_SRC[8];
        break;
        
        case 15:
        result=tab_adjectif_SRC[9];
        break;
    }
    return result; 
}


function get_IAQ_HCI(a){
    var result="";
    switch(a){
        case 0:
        result=tab_adjectif_level[1];
        break;
         
        case 1:
        result=tab_adjectif_level[2];
        break;
         
        case 2:
        result=tab_adjectif_level[4];
        break;
         
        case 3:
        result=tab_adjectif_level[5];
        break;
    }
    return result; 
}

function HW_SW_Revision(a)
{
    result="";
    switch(a)
	{
        case 0:
            result="A";
            break;
        case 1: 
            result="B";
            break;
        case 2: 
            result="C";
            break;
		case 3: 
            result="D";
            break;
        case 4: 
            result="E";
            break;
        case 5: 
            result="F";
            break;
        case 6: 
            result="G";
            break;			
    }
    return result;
}

function Yes_No(a)
{
	result="";
	switch(a)
	{
		case 0:
			result="No";
			break;
		case 1:
			result="Yes";
			break;
	}
	return result;
}

function battery_level(a){
result="";
switch(a){
    case 0:
        result="High";
        break;
    case 1: 
        result="Medium";
        break;
    case 2: 
        result="Low";
        break;
	case 3: 
        result="Critical";
        break;
}
return result;
}

function temperature_9bits(a)
{
	if(a > 500)
	{
		return 511;
	}	
	else
	{
		return 0.1*a;
	}
}
	
function nfc_status(a)
{
    if (a===0){
        return "Discoverable";
    }else if(a===1){
        return "Not discoverable"
    }else {
        return "RFU"
    }
}


function LoRa_Region(a)
{
  result="";
	switch(a){
  	case 0: 
  		result="EU868";
  		break;
  	}
  	return result;
}

function reconfiguration_source(a)
{
  result="";
	switch(a){
  	case 0: 
  		result="NFC";
  	break;
  	
  	case 1:
  	 	result="Downlink"; 
   	break;
  	
  	case 2:
  	  	result="Product start-up";
  	break;
  }
  return result;
}

function reconfiguration_status(a)
{
  result="";
	switch(a){
  	case 0: 
  		result="Total success";
  	break;
  	
  	case 1:
  	 	result="Partial success"; 
  	break;
  	
  	case 2:
  	  	result="Total failure";
  	break;
  }
  return result;
}	

function PM(a)
{
	result="Error";
	
	if(a == 2047){
        return result;
    }
    
    else{
        return a;
    }
}

function CO2COV(a)
{
	result="Error";
	
	if(a == 16383){
        return result;
    }
    
    else{
        return a;
    }
}

function Formaldehyde(a)
{
	result="Error";
	
	if(a == 1047){
        return result;
    }
    
    else{
        return a;
    }
}

function Luminosity(a)
{
	result="Error";
	
	if(a == 255){
        return result;
    }
    
    else{
        return a*5;
    }
}

function Noise(a)
{
	result="Error";
	
	if(a == 127){
        return result;
    }
    
    else{
        return a;
    }
}

function Occupancy(a)
{
	result="Error";
	
	if(a == 255){
        return result;
    }
    
    else{
        return a;
    }
}

function Voltage(a)
{
	return a*1000
}

function HardwareStatus(a)
{
	result="";
    switch(a){
        case 0: 
            result="Hardware OK ";
            break;
        case 1: 
            result="Hardware fault ";
            break;
    }
    return result;
}

function pressure(a){
    switch(a){
        case 1023:
            result=65535;
           break;
        default :
            result=a+300;
    }
    return result;

}

function PendingJoin(a)
{
	result="";
    switch(a){
        case 0: 
            result="No join request scheduled";
            break;
        case 1: 
            result="Join request scheduled";
            break;
    }
    return result;
}

function LED_function(a){
    result="";
    switch(a){
        case 0: 
            result="Global Air Quality";
            break;
        case 1: 
            result="CO2 level";
            break;
    }
    return result;
}

} // fin de la fonction Decoder
)

function decodeUplink(input){
    var fPort = input.fPort;
    var bytes = input.bytes;
    return Decoder(bytes);
}
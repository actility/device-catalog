
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
var string_bin="";
var tab_bin=[];
var string_bin_elements=""; 
var buffer=[];
var buffer2=[];
var i=0;
var j=0;
var str=0
var compte=0;
var product_type=0;



for(i=0; i<input.length;i++)
{
   str=parseInt(input[i], 16);
   buffer2.push(str);
}

for(i=0;i<input.length;i++){ 
     string_bin_elements=buffer2[i].toString(2);
     if(string_bin_elements.length<8)
     { 
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
    { 
        buffer[i]=buffer[i]+string_bin.charAt(compte);
        compte++;
    }
    buffer[i]=parseInt(buffer[i],2);
}

product_type = (buffer[0] << 4) + buffer[1];

const Insafe_Origin_LoRa=0xA2; 

switch(product_type){

	case Insafe_Origin_LoRa:
        decode[0]={"Type_of_Product":"Insafe_Origin_LoRa"};	
		break;
}
    
const tab_adjectif_level=["Very Good","Good","Average","Warning","Bad","Erreur"];
const tab_adjectif_SRC=["All","Dryness Indicator","Mould Indicator","Dust Mites Indicator","CO","CO2","VOC","Formaldehyde","PM1.0", "PM2.5","PM10","Erreur"];
        
    if (product_type == Insafe_Origin_LoRa) /*Origin LoRa*/
    {   
    	
    	var tab_decodage_Origin_Product_Status_Message=[8,8,8,8,8,1,1,6,8,8,2,1,5,16,6,4,5,5,6,6,8,16,8];
    	var tab_decodage_Origin_Product_General_Config_Message=[8,8,1,1,1,1,1,11,8,16,8,4,9,4,9,9,9,68];	
    	var tab_decodage_Origin_Smoke_Alarm_Status_Message = [8,8,1,1,1,1,1,1,2,8,3,5];
	    var tab_decodage_Origin_Daily_Air_Quality_Message=[8,8,3,4,1,8,8,8,8,8,8,3,5];	
	    var tab_decodage_Origin_Keepalive=[8,8];
	    var tab_decodage_Real_Time_Message=[8,8,3,4,3,3,3,9,8,3];	
	    var tab_decodage_Temperature_Datalog_Message=[8,8,8,4,1,3,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9];
	    var tab_decodage_Humidity_Datalog_Message=[8,8,8,4,1,3,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8];
	    var tab_decodage_Temperature_alerts_Message=[8,8,9,1,1,3,2];
	
	    
    	const Type_Origin_Product_Status_Message=0x00;
    	const Type_Origin_Product_General_Config_Message=0x01;	
    	const Type_Origin_Keep_Alive_Message=0x02;
    	const Type_Origin_Smoke_Alarm_Status_Message=0x03;
    	const Type_Origin_Daily_Air_Quality_Message=0x04;
	    const Type_Origin_Real_Time_Message=0x05;
	    const Type_Origin_Temperature_Datalog_Message=0x06;
	    const Type_Origin_Humidity_Datalog_Message=0x07;	
	    const Type_Origin_Temperature_Alerts_Message=0x08;	  
	    
	    const message_type = (buffer[2] << 4) + buffer[3];
         
        switch(message_type)
        {
            case Type_Origin_Product_Status_Message:
                tab_decode(tab_decodage_Origin_Product_Status_Message);
                decode[1]={"Type_of_message":"Product_Status_Message"};
		    	decode[2]={"HW_Revision":HW_SW_Revision(tab_bin[2])};
		    	decode[3]={"SW_Revision":HW_SW_Revision(tab_bin[3])};
		    	decode[4]={"Remaining_Product_lifetime_(months)":tab_bin[4]};
		    	decode[5]={"Smoke_sensor_fault_mode":hw_mode(tab_bin[5])};
		    	decode[6]={"Temperature_Humidity_sensor_fault_mode":hw_mode(tab_bin[6])};
		    	decode[7]={"Not_used":""};
		    	decode[8]={"Battery1_voltage_(mV)":(tab_bin[8]*5)+2000};
		    	decode[9]={"Battery2_voltage_(mV)":(tab_bin[9]*5)+2000};
		    	decode[10]={"Battery_level":battery_level(tab_bin[10])};
		    	decode[11]={"Pending_Join": active(tab_bin[11])};
		    	decode[12]={"Not_Used":""};				
		    	decode[13]={"Number_of_frames_sent":(tab_bin[13])*10};
		    	decode[14]={"Product_RTC_date_since_2000_(years)": tab_bin[14]};
		    	decode[15]={"Product_RTC_date_Month_of_the_year":tab_bin[15]};
		    	decode[16]={"Product_RTC_date__Day_of_the_month":tab_bin[16]};
		    	decode[17]={"Product_RTC_date_Hours_of_the_day":tab_bin[17]};
		    	decode[18]={"Product_RTC_date_Minutes_of_the_hour":tab_bin[18]};
		    	decode[19]={"Product_RTC_date_Seconds_of_the_hour":tab_bin[19]};	
		    	decode[20]={"Remaining_connectivity_duration_(months)":tab_bin[20]};
		    	decode[21]={"Reserved_Nexelec": tab_bin[21]*10};
		    	decode[22]={"Not_Used":""};	
            break;
            
            case Type_Origin_Product_General_Config_Message:
    			tab_decode(tab_decodage_Origin_Product_General_Config_Message);
    			decode[1]={"Type_of_message":"Product_General_Config_Message"};
    			decode[2]={"Temperature_Datalog_Enable":active(tab_bin[2])};
    			decode[3]={"Humidity_Datalog_Enable":active(tab_bin[3])};
    			decode[4]={"Daily_Air_Quality_Enable":active(tab_bin[4])};
    			decode[5]={"Temperature_Alert_Enable":active(tab_bin[5])};
    			decode[6]={"Keepalive_Enable":active(tab_bin[6])};
    			decode[7]={"Not_Used":""};
    			decode[8]={"Keepalive_period_(hours)":tab_bin[8]};
    			decode[9]={"Not_Used":""};
    			decode[10]={"Measuring_Period_(minutes)":tab_bin[10]};
    			decode[11]={"Temperature_Datalog_decimation_factor_(Record_only_1_on_x_samples)":tab_bin[11]};
    			decode[12]={"Not_Used":""};			
    			decode[13]={"Humidity_Datalog_decimation_factor_(Record_only_1_on_x_samples)":tab_bin[13]};
    			decode[14]={"Not_Used":""};			
    			decode[15]={"Temperature_Alert_Threshold_1_(°C)":0.1*tab_bin[15]};
    			decode[16]={"Temperature_Alert_Threshold_2_(°C)":0.1*tab_bin[16]};
    			decode[17]={"Not_Used":""};			
    			break;
			
            case Type_Origin_Smoke_Alarm_Status_Message:
                tab_decode(tab_decodage_Origin_Smoke_Alarm_Status_Message);
                decode[1]={"Type_of_message":"Smoke_Alarm_Status_Message"};
                decode[2]={"Smoke_Alarm":active(tab_bin[2])};
                decode[3]={"Smoke_Alarm_Hush":Smoke_Alarm_Hush(tab_bin[3])};
                decode[4]={"Smoke_Test":active(tab_bin[4])};
                decode[5]={"Alarm_due_to_lack_of_maintenance":Yes_No(tab_bin[5])};
                decode[6]={"Alarm_due_to_humidity_out_of_range":Yes_No(tab_bin[6])};
                decode[7]={"Alarm_due_to_temperature_out_of_range":Yes_No(tab_bin[7])};
                decode[8]={"Not_Used":""};
                decode[9]={"Time_since_last_maintenance_(weeks)":tab_bin[9]};
                decode[10]={"Frame_index":tab_bin[10]};
                decode[11]={"Not_Used":""};
                break;
			
            case Type_Origin_Daily_Air_Quality_Message:
                tab_decode(tab_decodage_Origin_Daily_Air_Quality_Message);
                decode[1]={"Type_of_message":"Daily_Air_Quality_Message"};
                decode[2]={"IAQ_GLOBAL":get_iaq(tab_bin[2])};
                decode[3]={"IAQ_SOURCE":get_iaq_SRC(tab_bin[3])};
                decode[4]={"Not_Used":""};
                decode[5]={"Temperature_min_(°C)":Math.round(temp(tab_bin[5])*10) / 10};
                decode[6]={"Temperature_max_(°C)":Math.round(temp(tab_bin[6])*10) / 10};
                decode[7]={"Temperature_averaged_(°C)":Math.round(temp(tab_bin[7])*10) / 10};
                decode[8]={"Relative_Humidity_min_(%RH)": Math.round(RH(tab_bin[8])*10)/10};
                decode[9]={"Relative_Humidity_max_(%RH)": Math.round(RH(tab_bin[9])*10)/10};
                decode[10]={"Relative_Humidity_averaged_(%RH)": Math.round(RH(tab_bin[10])*10)/10};
                decode[11]={"Frame_index":tab_bin[11]};
                decode[12]={"Not_Used":""};			
                break;
			
            case Type_Origin_Keep_Alive_Message:
                decode[1]={"Type_of_message":"Keepalive"};
                break;

            case Type_Origin_Real_Time_Message:
                tab_decode(tab_decodage_Real_Time_Message);
                decode[1]={"Type_of_message":"Real_Time_Message"};
                decode[2]={"IAQ_GLOBAL":get_iaq(tab_bin[2])};
                decode[3]={"IAQ_SOURCE":get_iaq_SRC(tab_bin[3])};
                decode[4]={"IAQ_DRY":get_iaq(tab_bin[4])};
                decode[5]={"IAQ_MOULD":get_iaq(tab_bin[5])};
                decode[6]={"IAQ_DUST_MITES":get_iaq(tab_bin[6])};
                decode[7]={"Temperature_(°C)":Math.round(temperature_9bits(tab_bin[7])*10) / 10};
                decode[8]={"Relative_Humidity_(%RH)":Math.round(RH(tab_bin[8])*10)/10};
                decode[9]={"Frame_index":tab_bin[9]};
                break;
			
            case Type_Origin_Temperature_Datalog_Message:	
                tab_decode(tab_decodage_Temperature_Datalog_Message);
                decode[1]={"Type_of_message":"Temperature_Datalog_Message"};
                decode[2]={"Number_Data":tab_bin[2]};
                decode[3]={"Time_between_measurements_(minutes)":tab_bin[3]*10};
                decode[4]={"Not_used":""};
                decode[5]={"Frame_index": tab_bin[5]};
                for(i = 6; i < (6+tab_bin[2]); i++)
                {
                decode[i]= {["Temperature_data_[n-"+(tab_bin[2]-1-(i-6))+"]"]:Math.round(temperature_9bits(tab_bin[i])*10)/10};
                }
                break;

            case Type_Origin_Humidity_Datalog_Message:
                tab_decode(tab_decodage_Humidity_Datalog_Message);
                decode[1]={"Type_of_message":"Humidity_Datalog_Message"};
                decode[2]={"Number_Data":tab_bin[2]};
                decode[3]={"Time_between_measurements_(minutes)":tab_bin[3]*10};
                decode[4]={"Not_used":""};
                decode[5]={"Frame_index": tab_bin[5]};
                for(i = 6; i < (6+tab_bin[2]); i++)
                {
                decode[i]= {["Humidity_data_[n-"+(tab_bin[2]-1-(i-6))+"]"]:Math.round(RH(tab_bin[i])*10)/10};
                }
                break;

            case Type_Origin_Temperature_Alerts_Message:
                tab_decode(tab_decodage_Temperature_alerts_Message);
                decode[1]={"Type_of_message":"Temperature_Alerts_Message"};	
                decode[2]={"Temperature_(°C)":Math.round(temperature_9bits(tab_bin[2])*10)/10};
                decode[3]={"Threshold_1_reached":Yes_No(tab_bin[3])};
                decode[4]={"Threshold_2_reached":Yes_No(tab_bin[4])};
                decode[5]={"Frame_Index": tab_bin[5]};
                break;
        }
    }


var new_msg={payload:decode};
return new_msg;  



function tab_decode (tab){ 
	var compteur=0;
	for ( i=0; i<tab.length;i++){  
		tab_bin[i]="";
		for ( j=0; j<tab[i];j++){ 
			const str1=string_bin.charAt(compteur);
			tab_bin[i]=tab_bin[i]+str1;       
			compteur++;
		}
		
		if (tab_bin[i].length>4){ 
			tab_bin[i]=tab_bin[i].padStart(8,'0');
			tab_bin[i]=parseInt(tab_bin[i] , 2).toString(16).toUpperCase(); 
			tab_bin[i]=parseInt(tab_bin[i],16) ;
		}
		else{ 
			tab_bin[i]=tab_bin[i].padStart(4,'0');
			tab_bin[i]=parseInt(tab_bin[i] , 2).toString(16).toUpperCase();
			tab_bin[i]=parseInt(tab_bin[i], 16);
		}
	}
 }


function hw_mode(a){
    let result="";
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


function active(a){
    let result="";
    switch(a){
        case 0: 
            result="Non-Active";
           break
        case 1: 
            result="Active";
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
        let result="";
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
	
	function Smoke_Alarm_Hush(a)
	{
		let result="";
		switch(a)
		{
			case 0:
				result="Alarm stopped because no smoke anymore";
				break;
			case 1:
				result="Alarm stopped following central button press";
				break;
		}
		return result;
	}
	
	function Yes_No(a)
	{
		let result="";
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
    let result="";
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

}

/*!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
!!!!!!!!!!ADDED BY ACTILITY!!!!!!!!!!
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/

function bytesToHex(bytes) {

	return Array.from(bytes, (byte) => {

		return ("0" + (byte & 0xff).toString(16)).slice(-2);

	}).join("");

}

//Adding decodeUplink wrapper function to adapt signature to lora-alliance.

function decodeUplink(input){
    let bytes = bytesToHex(input.bytes);
    
    return {
        data: Decoder(bytes),
        errors: [],
        warnings: []
    };
}

exports.decodeUplink = decodeUplink;
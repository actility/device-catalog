function AngleDetectionFlags (transition, triggerType, notificationIdentifier){
        this.transition = transition;
        this.triggerType = triggerType;
        this.notificationIdentifier = notificationIdentifier;

}

module.exports = {
  AngleDetectionFlags: AngleDetectionFlags,
  
  Transition:{
			LEARNING_TO_NORMAL: "LEARNING_TO_NORMAL",
			NORMAL_TO_LEARNING: "NORMAL_TO_LEARNING",
			NORMAL_TO_CRITICAL: "NORMAL_TO_CRITICAL",
			CRITICAL_TO_NORMAL: "CRITICAL_TO_NORMAL",
			CRITICAL_TO_LEARNING: "CRITICAL_TO_LEARNING"
		}, 
 TriggerType:
			{
			 CRITICAL_ANGLE_REPORTING: "CRITICAL_ANGLE_REPORTING",
			 ANGLE_DEVIATION_REPORTING: "ANGLE_DEVIATION_REPORTING",
			 SHOCK_TRIGGER: "SHOCK_TRIGGER",
			 RFU: "RFU"
				 
			}
	
}

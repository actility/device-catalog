function AngleDetection (flags, age, referenceGravityVector, criticalGravityVector, angle){
        this.flags = flags;
        this.age = age;
        this.referenceVector = referenceGravityVector;
        this.criticalVector = criticalGravityVector;
        this.angle =angle;
}

module.exports = {
  AngleDetection: AngleDetection
 	
}

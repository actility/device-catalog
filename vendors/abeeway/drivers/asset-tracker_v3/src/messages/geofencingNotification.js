function GeofencingNotification(geofencingFormat, geofencingType, id)
  {
            this.geofencingFormat = geofencingFormat;
            this.geofencingType = geofencingType;
            this.id = id;
  }

module.exports = {
	GeofencingNotification: GeofencingNotification,
	GeofencingType: {
        SAFE_AREA: "SAFE_AREA",
        ENTRY: "ENTRY",
        EXIT: "EXIT",
        HAZARD: "HAZARD"
    }
}
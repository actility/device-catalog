import driver from "./index.js";
import abeewayDownlinkPayload from "./messages/abeewayDownlinkPayload.js";
import abeewayUplinkPayload from "./messages/abeewayUplinkPayload.js";
import angleDetection from "./messages/angleDetection.js";
import angleDetectionFlags from "./messages/angleDetectionFlags.js";
import beaconIdInfo from "./messages/beaconIdInfo.js";
import bssidInfo from "./messages/bssidInfo.js";
import geofencingNotification from "./messages/geofencingNotification.js";
import healthStatus from "./messages/healthStatus.js";
import measuredTemperature from "./messages/measuredTemperature.js";
import proximityDailyReport from "./messages/proximityDailyReport.js";
import proximityDailyResponse from "./messages/proximityDailyResponse.js";
import proximityMessage from "./messages/proximityMessage.js";
import proximityNotification from "./messages/proximityNotification.js";
import proximityWhiteListing from "./messages/proximityWhiteListing.js";
import scanCollection from "./messages/scanCollection.js";
import sms from "./messages/sms.js";
import startupModes from "./messages/startupModes.js";
import angleDetectionControl from "./enums/angleDetectionControl.js";
import batteryStatus from "./enums/batteryStatus.js";
import bleBeaconFailure from "./enums/bleBeaconFailure.js";
import bleBondStatus from "./enums/bleBondStatus.js";
import collectionScanType from "./enums/collectionScanType.js";
import debugCommandTag from "./enums/debugCommandTag.js";
import debugCommandType from "./enums/debugCommandType.js";
import downMessageType from "./enums/downMessageType.js";
import dynamicMotionState from "./enums/dynamicMotionState.js";
import errorCode from "./enums/errorCode.js";
import eventType from "./enums/eventType.js";
import gpsFixStatus from "./enums/gpsFixStatus.js";
import melodyId from "./enums/melodyId.js";
import messageType from "./enums/messageType.js";
import miscDataTag from "./enums/miscDataTag.js";
import mode from "./enums/mode.js";
import optionalCommand from "./enums/optionalCommand.js";
import rawPositionType from "./enums/rawPositionType.js";
import resetAction from "./enums/resetAction.js";
import shutdownCause from "./enums/shutdownCause.js";
import timeoutCause from "./enums/timeoutCause.js";

export const decodeUplink = driver.decodeUplink;
export const decodeDownlink = driver.decodeDownlink;
export const encodeDownlink = driver.encodeDownlink;
export const extractPoints = driver.extractPoints;

export const AbeewayDownlinkPayload = abeewayDownlinkPayload.AbeewayDownlinkPayload;
export const AbeewayUplinkPayload = abeewayUplinkPayload.AbeewayUplinkPayload;

export const AngleDetection = angleDetection.AngleDetection;
export const AngleDetectionFlags = angleDetectionFlags.AngleDetectionFlags;
export const Transition = angleDetectionFlags.Transition;
export const TriggerType = angleDetectionFlags.TriggerType;

export const BeaconIdInfo = beaconIdInfo.BeaconIdInfo;
export const BssidInfo = bssidInfo.BssidInfo;

export const GeofencingNotification = geofencingNotification.GeofencingNotification;
export const GeofencingType = geofencingNotification.GeofencingType;

export const HealthStatus = healthStatus.HealthStatus;

export const MeasuredTemperature = measuredTemperature.MeasuredTemperature;
export const TemperatureState = measuredTemperature.TemperatureState;

export const ProximityDailyReport = proximityDailyReport.ProximityDailyReport;
export const ProximityDailyResponse = proximityDailyResponse.ProximityDailyResponse;

export const ProximityMessage = proximityMessage.ProximityMessage;
export const ProximityMessageType = proximityMessage.Type;
export const SetRecordStatus = proximityMessage.SetRecordStatus;

export const ProximityNotification = proximityNotification.ProximityNotification;
export const NotificationType = proximityNotification.NotificationType;
export const RecordAction = proximityNotification.RecordAction;

export const ProximityWhiteListing = proximityWhiteListing.ProximityWhiteListing;
export const List = proximityWhiteListing.List;
export const RecordStatus = proximityWhiteListing.RecordStatus;

export const ScanCollection = scanCollection.ScanCollection;
export const ScanType = scanCollection.ScanType;
export const DataFormat = scanCollection.DataFormat;

export const Sms = sms.Sms;
export const StartupModes = startupModes.StartupModes;

export const AngleDetectionControl = angleDetectionControl;
export const BatteryStatus = batteryStatus;
export const BleBeaconFailure = bleBeaconFailure;
export const BleBondStatus = bleBondStatus;
export const CollectionScanType = collectionScanType;
export const DebugCommandTag = debugCommandTag;
export const DebugCommandType = debugCommandType;
export const DownMessageType = downMessageType;
export const DynamicMotionState = dynamicMotionState;
export const ErrorCode = errorCode;
export const EventType = eventType;
export const GpsFixStatus = gpsFixStatus;
export const MelodyId = melodyId;
export const MessageType = messageType;
export const MiscDataTag = miscDataTag;
export const Mode = mode;
export const OptionalCommand = optionalCommand;
export const RawPositionType = rawPositionType;
export const ResetAction = resetAction;
export const ShutdownCause = shutdownCause;
export const TimeoutCause = timeoutCause;

export default driver;

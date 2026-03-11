import driver from "./index.js";
import downlinkPayload from "./messages/downlink/abeewayDownlinkPayload.js";
import command from "./messages/downlink/command.js";
import request from "./messages/downlink/requests/request.js";
import uplinkPayload from "./messages/uplink/abeewayUplinkPayload.js";
import basicHeader from "./messages/uplink/basicHeader.js";
import extendedHeader from "./messages/uplink/extendedHeader.js";
import accelerometer from "./messages/uplink/notifications/accelerometer.js";
import geozoning from "./messages/uplink/notifications/geozoning.js";
import network from "./messages/uplink/notifications/network.js";
import notification from "./messages/uplink/notifications/notification.js";
import system from "./messages/uplink/notifications/system.js";
import notificationTelemetry from "./messages/uplink/notifications/telemetry.js";
import temperature from "./messages/uplink/notifications/temperature.js";
import beaconInfo from "./messages/uplink/positions/ble/beaconInfo.js";
import blePosition from "./messages/uplink/positions/ble/blePosition.js";
import gnssFailure from "./messages/uplink/positions/gnss/gnssFailure.js";
import gnssFix from "./messages/uplink/positions/gnss/gnssFix.js";
import satelliteInfo from "./messages/uplink/positions/gnss/satelliteInfo.js";
import position from "./messages/uplink/positions/position.js";
import triggerBitMap from "./messages/uplink/positions/triggerBitMap.js";
import bssidInfo from "./messages/uplink/positions/wifi/bssidInfo.js";
import wifiPosition from "./messages/uplink/positions/wifi/wifiPosition.js";
import query from "./messages/uplink/queries/query.js";
import response from "./messages/uplink/responses/response.js";
import telemetry from "./messages/uplink/telemetry/telemetry.js";
import util from "./util.js";
import { Buffer } from "buffer";

globalThis.Buffer ??= Buffer;

export const decodeUplink = driver.decodeUplink;
export const decodeDownlink = driver.decodeDownlink;
export const encodeDownlink = driver.encodeDownlink;
export const isContextUsedInPayload = driver.isContextUsedInPayload;

export const AbeewayDownlinkPayload = downlinkPayload.AbeewayDownlinkPayload;
export const DownlinkMessageType = downlinkPayload.MessageType;
export const determineDownlinkHeader = downlinkPayload.determineDownlinkHeader;

export const Command = command.Command;
export const decodeCommand = command.decodeCommand;
export const encodeCommand = command.encodeCommand;

export const RequestType = request.RequestType;
export const encodeRequest = request.encodeRequest;
export const decodeRequest = request.decodeRequest;

export const AbeewayUplinkPayload = uplinkPayload.AbeewayUplinkPayload;
export const messageType = uplinkPayload.messageType;

export const Header = basicHeader.Header;
export const determineHeader = basicHeader.determineHeader;

export const ExtendedHeader = extendedHeader.ExtendedHeader;
export const determineExtendedHeader = extendedHeader.determineExtendedHeader;

export const Accelerometer = accelerometer.Accelerometer;
export const determineAccelerationVector = accelerometer.determineAccelerationVector;
export const determineGaddIndex = accelerometer.determineGaddIndex;
export const determineNumberShocks = accelerometer.determineNumberShocks;
export const determineMotion = accelerometer.determineMotion;
export const AcceleroType = accelerometer.AcceleroType;

export const GeozoningType = geozoning.GeozoningType;

export const Network = network.Network;
export const determineNetworkInfo = network.determineNetworkInfo;
export const NetworkType = network.NetworkType;

export const Notification = notification.Notification;
export const determineNotification = notification.determineNotification;
export const NotificationClass = notification.Class;

export const System = system.System;
export const determineStatus = system.determineStatus;
export const determineLowBattery = system.determineLowBattery;
export const determineBleStatus = system.determineBleStatus;
export const determineTamperDetection = system.determineTamperDetection;
export const determineHeartbeat = system.determineHeartbeat;
export const determineShutdownCause = system.determineShutdownCause;
export const determineDataBuffering = system.determineDataBuffering;
export const determineFuota = system.determineFuota;
export const SystemType = system.SystemType;

export const TelemetryType = notificationTelemetry.TelemetryType;
export const determineTelemetryMeasurements = notificationTelemetry.determineTelemetryMeasurements;

export const determineTemperature = temperature.determineTemperature;
export const TempType = temperature.TempType;

export const BeaconIdInfo = beaconInfo.BeaconIdInfo;
export const BeaconMacInfo = beaconInfo.BeaconMacInfo;

export const determineBleMacPositionMessage = blePosition.determineBleMacPositionMessage;
export const determineBleIdShortPositionMessage = blePosition.determineBleIdShortPositionMessage;
export const determineBleIdLongPositionMessage = blePosition.determineBleIdLongPositionMessage;

export const GnssFailure = gnssFailure.GnssFailure;
export const determineGnssFailure = gnssFailure.determineGnssFailure;

export const GnssFix = gnssFix.GnssFix;
export const determineGnssFix = gnssFix.determineGnssFix;

export const SatelliteInfo = satelliteInfo.SatelliteInfo;
export const Constellation = satelliteInfo.Constellation;
export const CN = satelliteInfo.CN;

export const Position = position.Position;
export const determinePosition = position.determinePosition;

export const TriggerBitMap = triggerBitMap.TriggerBitMap;

export const BssidInfo = bssidInfo.BssidInfo;

export const determineWifiPositionMessage = wifiPosition.determineWifiPositionMessage;

export const Query = query.Query;
export const determineQuery = query.determineQuery;

export const Response = response.Response;
export const ResponseType = response.ResponseType;
export const determineResponse = response.determineResponse;
export const determineConfiguration = response.determineConfiguration;
export const parametersByGroupIdAndLocalId = response.parametersByGroupIdAndLocalId;
export const getParameterByGroupIdAndLocalId = response.getParameterByGroupIdAndLocalId;
export const determineGroupType = response.determineGroupType;
export const GroupType = response.GroupType;

export const decodeTelemetry = telemetry.decodeTelemetry;

export const convertToByteArray = util.convertToByteArray;
export const camelToSnake = util.camelToSnake;
export const convertBytesToString = util.convertBytesToString;
export const convertByteToString = util.convertByteToString;
export const decodeCondensed = util.decodeCondensed;
export const convertNegativeInt = util.convertNegativeInt;
export const twoComplement = util.twoComplement;
export const isValueInRange = util.isValueInRange;
export const hexStringToInt = util.hexStringToInt;
export const checkParamValueRange = util.checkParamValueRange;
export const hasNegativeNumber = util.hasNegativeNumber;
export const lengthToHex = util.lengthToHex;

export default driver;

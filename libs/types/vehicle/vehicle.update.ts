import { VehicleBrand, VehicleFuel, VehicleStatus, VehicleTransmission } from '../../enums/vehicle.enum';

export interface VehicleUpdate {
	_id: string;
	vehicleBrand?: VehicleBrand;
	vehicleModel?: string;
	vehicleTrim?: string;
	vehicleYear?: number;
	vehicleFuel?: VehicleFuel;
	vehicleTransmission?: VehicleTransmission;
	vehicleColor?: string;
	vehiclePrice?: number;
	vehicleLocation?: string;
	vehicleStockQuantity?: number;
	vehicleImages?: string[];
	vehicleDesc?: string;
	vehicleBodyType?: string;
	vehicleMileage?: number;
	vehicleStatus?: VehicleStatus;
	soldAt?: Date;
	deletedAt?: Date;
}

export type PropertyUpdate = VehicleUpdate;

import { VehicleBrand, VehicleFuel, VehicleStatus, VehicleTransmission } from '../../enums/vehicle.enum';
import { Direction } from '../../enums/common.enum';

export interface VehicleInput {
	vehicleBrand: VehicleBrand;
	vehicleModel: string;
	vehicleTrim: string;
	vehicleYear: number;
	vehicleFuel: VehicleFuel;
	vehicleTransmission: VehicleTransmission;
	vehicleColor: string;
	vehiclePrice: number;
	vehicleLocation: string;
	vehicleStockQuantity: number;
	vehicleImages: string[];
	vehicleDesc?: string;
	vehicleBodyType?: string;
	vehicleMileage?: number;
	memberId?: string;
}

interface VehicleSearch {
	memberId?: string;
	brandList?: VehicleBrand[];
	modelList?: string[];
	fuelList?: VehicleFuel[];
	transmissionList?: VehicleTransmission[];
	locationList?: string[];
	pricesRange?: Range;
	yearsRange?: Range;
	periodsRange?: PeriodsRange;
	text?: string;
}

export interface VehiclesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: VehicleSearch;
}

interface DealerVehicleSearch {
	vehicleStatus?: VehicleStatus;
}

export interface DealerVehiclesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: DealerVehicleSearch;
}

interface AllVehicleSearch {
	vehicleStatus?: VehicleStatus;
	vehicleBrandList?: VehicleBrand[];
	vehicleLocationList?: string[];
}

export interface AllVehiclesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: AllVehicleSearch;
}

export type PropertyInput = VehicleInput;
export type PropertiesInquiry = VehiclesInquiry;
export type AgentPropertiesInquiry = DealerVehiclesInquiry;
export type AllPropertiesInquiry = AllVehiclesInquiry;

interface Range {
	start: number;
	end: number;
}

interface PeriodsRange {
	start: Date | number;
	end: Date | number;
}

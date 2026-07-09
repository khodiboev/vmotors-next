import { VehicleBrand, VehicleFuel, VehicleStatus, VehicleTransmission } from '../../enums/vehicle.enum';
import { Member } from '../member/member';

export interface MeLiked {
	memberId: string;
	likeRefId: string;
	myFavorite: boolean;
}

export interface TotalCounter {
	total: number;
}

export interface Vehicle {
	_id: string;
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
	vehicleStatus: VehicleStatus;
	vehicleViews: number;
	vehicleLikes: number;
	vehicleComments: number;
	vehicleRank: number;
	memberId: string;
	soldAt?: Date;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	meLiked?: MeLiked[];
	memberData?: Member;
}

export interface Vehicles {
	list: Vehicle[];
	metaCounter: TotalCounter[];
}

export type Property = Vehicle;
export type Properties = Vehicles;

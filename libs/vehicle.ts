import { Vehicle } from './types/vehicle/vehicle';

export const vehicleTitle = (vehicle?: Partial<Vehicle> | null) => {
	if (!vehicle) return '';
	return [vehicle.vehicleBrand, vehicle.vehicleModel, vehicle.vehicleTrim].filter(Boolean).join(' ');
};

export const vehicleSpecs = (vehicle?: Partial<Vehicle> | null) => {
	if (!vehicle) return [];
	return [
		vehicle.vehicleYear ? `${vehicle.vehicleYear}` : '',
		vehicle.vehicleFuel ?? '',
		vehicle.vehicleTransmission ?? '',
		vehicle.vehicleColor ?? '',
	].filter(Boolean);
};

export const vehicleStockLabel = (vehicle?: Partial<Vehicle> | null) => {
	if (!vehicle?.vehicleStockQuantity) return 'Out of stock';
	return `${vehicle.vehicleStockQuantity} in stock`;
};

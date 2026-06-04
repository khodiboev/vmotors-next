import React from 'react';
import VehicleCard from '../property/PropertyCard';
import { Vehicle } from '../../types/vehicle/vehicle';

interface PopularPropertyCardProps {
	property: Vehicle;
	likePropertyHandler?: any;
}

const PopularPropertyCard = ({ property, likePropertyHandler }: PopularPropertyCardProps) => {
	return <VehicleCard property={property} likePropertyHandler={likePropertyHandler} />;
};

export default PopularPropertyCard;

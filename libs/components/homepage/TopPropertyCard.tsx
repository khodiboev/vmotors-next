import React from 'react';
import VehicleCard from '../property/PropertyCard';
import { Vehicle } from '../../types/vehicle/vehicle';

interface TopPropertyCardProps {
	property: Vehicle;
	likePropertyHandler?: any;
}

const TopPropertyCard = ({ property, likePropertyHandler }: TopPropertyCardProps) => {
	return <VehicleCard property={property} likePropertyHandler={likePropertyHandler} />;
};

export default TopPropertyCard;

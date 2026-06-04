import React from 'react';
import VehicleCard from '../property/PropertyCard';
import { Vehicle } from '../../types/vehicle/vehicle';

interface TrendPropertyCardProps {
	property: Vehicle;
	likePropertyHandler?: any;
}

const TrendPropertyCard = ({ property, likePropertyHandler }: TrendPropertyCardProps) => {
	return <VehicleCard property={property} likePropertyHandler={likePropertyHandler} />;
};

export default TrendPropertyCard;

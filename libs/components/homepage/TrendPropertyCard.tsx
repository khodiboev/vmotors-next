import React from 'react';
import { Vehicle } from '../../types/vehicle/vehicle';
import HomepageVehicleCard from './HomepageVehicleCard';

interface TrendPropertyCardProps {
	property: Vehicle;
	likePropertyHandler?: any;
}

const TrendPropertyCard = ({ property, likePropertyHandler }: TrendPropertyCardProps) => {
	return <HomepageVehicleCard property={property} likePropertyHandler={likePropertyHandler} />;
};

export default TrendPropertyCard;

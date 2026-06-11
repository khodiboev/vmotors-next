import React from 'react';
import { Vehicle } from '../../types/vehicle/vehicle';
import HomepageVehicleCard from './HomepageVehicleCard';

interface TopPropertyCardProps {
	property: Vehicle;
	likePropertyHandler?: any;
}

const TopPropertyCard = ({ property, likePropertyHandler }: TopPropertyCardProps) => {
	return <HomepageVehicleCard property={property} likePropertyHandler={likePropertyHandler} />;
};

export default TopPropertyCard;

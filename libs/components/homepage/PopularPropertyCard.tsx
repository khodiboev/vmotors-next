import React from 'react';
import { Vehicle } from '../../types/vehicle/vehicle';
import HomepageVehicleCard from './HomepageVehicleCard';

interface PopularPropertyCardProps {
	property: Vehicle;
	likePropertyHandler?: any;
}

const PopularPropertyCard = ({ property, likePropertyHandler }: PopularPropertyCardProps) => {
	return <HomepageVehicleCard property={property} likePropertyHandler={likePropertyHandler} />;
};

export default PopularPropertyCard;

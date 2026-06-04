import React from 'react';
import { Box, Menu, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Vehicle } from '../../../types/vehicle/vehicle';
import { VehicleStatus } from '../../../enums/vehicle.enum';
import { VehicleUpdate } from '../../../types/vehicle/vehicle.update';
import { REACT_APP_API_URL } from '../../../config';
import { formatterStr } from '../../../utils';
import { vehicleTitle } from '../../../vehicle';

interface VehiclePanelListProps {
	properties: Vehicle[];
	anchorEl: Array<HTMLElement | undefined>;
	menuIconClickHandler: (e: any, index: number) => void;
	menuIconCloseHandler: () => void;
	updatePropertyHandler: (input: VehicleUpdate) => void;
	removePropertyHandler: (id: string) => void;
}

export const PropertyPanelList = ({
	properties,
	anchorEl,
	menuIconClickHandler,
	menuIconCloseHandler,
	updatePropertyHandler,
	removePropertyHandler,
}: VehiclePanelListProps) => {
	return (
		<Table>
			<TableHead>
				<TableRow>
					<TableCell>Vehicle</TableCell>
					<TableCell>Brand</TableCell>
					<TableCell>Year</TableCell>
					<TableCell>Fuel</TableCell>
					<TableCell>Transmission</TableCell>
					<TableCell>Location</TableCell>
					<TableCell>Stock</TableCell>
					<TableCell>Price</TableCell>
					<TableCell>Status</TableCell>
					<TableCell>Dealer</TableCell>
					<TableCell align="right">Actions</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{properties.map((vehicle, index) => {
					const image = vehicle.vehicleImages?.[0] ? `${REACT_APP_API_URL}/${vehicle.vehicleImages[0]}` : '/img/banner/header1.svg';
					return (
						<TableRow key={vehicle._id}>
							<TableCell>
								<Stack direction="row" alignItems="center" gap={1}>
									<img src={image} alt="" style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 4 }} />
										<div>
											<Typography>{vehicleTitle(vehicle)}</Typography>
											<Typography variant="caption">{vehicle.vehicleColor}</Typography>
										</div>
								</Stack>
							</TableCell>
							<TableCell>{vehicle.vehicleBrand}</TableCell>
							<TableCell>{vehicle.vehicleYear}</TableCell>
							<TableCell>{vehicle.vehicleFuel}</TableCell>
							<TableCell>{vehicle.vehicleTransmission}</TableCell>
							<TableCell>{vehicle.vehicleLocation}</TableCell>
							<TableCell>{vehicle.vehicleStockQuantity}</TableCell>
							<TableCell>${formatterStr(vehicle.vehiclePrice)}</TableCell>
							<TableCell>{vehicle.vehicleStatus}</TableCell>
							<TableCell>{vehicle.memberData?.memberNick ?? vehicle.memberData?.memberFullName ?? '-'}</TableCell>
							<TableCell align="right">
								<IconButton onClick={(e) => menuIconClickHandler(e, index)}>
									<MoreVertIcon />
								</IconButton>
								<Menu anchorEl={anchorEl[index]} open={Boolean(anchorEl[index])} onClose={menuIconCloseHandler}>
									{Object.values(VehicleStatus).map((status) => (
										<MenuItem
											key={status}
											disabled={vehicle.vehicleStatus === status}
											onClick={() => updatePropertyHandler({ _id: vehicle._id, vehicleStatus: status })}
										>
											Mark {status}
										</MenuItem>
									))}
									<MenuItem onClick={() => removePropertyHandler(vehicle._id)}>Remove</MenuItem>
								</Menu>
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
};

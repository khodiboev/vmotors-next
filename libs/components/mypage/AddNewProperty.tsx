import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Stack, Typography } from '@mui/material';
import axios from 'axios';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { getJwtToken } from '../../auth';
import { REACT_APP_API_URL } from '../../config';
import { userVar } from '../../../apollo/store';
import { CREATE_VEHICLE, UPDATE_VEHICLE } from '../../../apollo/user/mutation';
import { GET_VEHICLE } from '../../../apollo/user/query';
import { VehicleBrand, VehicleFuel, VehicleTransmission } from '../../enums/vehicle.enum';
import { VehicleInput } from '../../types/vehicle/vehicle.input';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';

const AddProperty = ({ initialValues }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const inputRef = useRef<any>(null);
	const [insertVehicleData, setInsertVehicleData] = useState<VehicleInput>(initialValues);
	const token = getJwtToken();
	const user = useReactiveVar(userVar);
	const vehicleId = (router.query.vehicleId ?? router.query.propertyId) as string | undefined;

	const [createVehicle] = useMutation(CREATE_VEHICLE);
	const [updateVehicle] = useMutation(UPDATE_VEHICLE);

	const { data: getVehicleData } = useQuery(GET_VEHICLE, {
		fetchPolicy: 'network-only',
		skip: !vehicleId,
		variables: { input: vehicleId },
	});

	useEffect(() => {
		const vehicle = getVehicleData?.getVehicle;
		if (!vehicle) return;
		setInsertVehicleData({
			vehicleBrand: vehicle.vehicleBrand,
			vehicleModel: vehicle.vehicleModel,
			vehicleTrim: vehicle.vehicleTrim,
			vehicleYear: vehicle.vehicleYear,
			vehicleFuel: vehicle.vehicleFuel,
			vehicleTransmission: vehicle.vehicleTransmission,
			vehicleColor: vehicle.vehicleColor,
			vehiclePrice: vehicle.vehiclePrice,
			vehicleLocation: vehicle.vehicleLocation,
			vehicleStockQuantity: vehicle.vehicleStockQuantity,
			vehicleImages: vehicle.vehicleImages,
			vehicleDesc: vehicle.vehicleDesc ?? '',
			vehicleBodyType: vehicle.vehicleBodyType ?? undefined,
			vehicleMileage: vehicle.vehicleMileage ?? undefined,
		});
	}, [getVehicleData]);

	async function uploadImages() {
		try {
			const formData = new FormData();
			const selectedFiles = inputRef.current.files;

			if (selectedFiles.length === 0) return false;
			if (selectedFiles.length > 5) throw new Error('Cannot upload more than 5 images!');

			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) {
						imagesUploader(files: $files, target: $target)
				  }`,
					variables: {
						files: [null, null, null, null, null],
						target: 'vehicle',
					},
				}),
			);
			formData.append(
				'map',
				JSON.stringify({
					'0': ['variables.files.0'],
					'1': ['variables.files.1'],
					'2': ['variables.files.2'],
					'3': ['variables.files.3'],
					'4': ['variables.files.4'],
				}),
			);
			for (const key in selectedFiles) {
				if (/^\d+$/.test(key)) formData.append(`${key}`, selectedFiles[key]);
			}

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			setInsertVehicleData({ ...insertVehicleData, vehicleImages: response.data.data.imagesUploader });
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}

	const doDisabledCheck = () => {
		return (
			!insertVehicleData.vehicleBrand ||
			!insertVehicleData.vehicleModel ||
			!insertVehicleData.vehicleTrim ||
			!insertVehicleData.vehicleYear ||
			!insertVehicleData.vehicleFuel ||
			!insertVehicleData.vehicleTransmission ||
			!insertVehicleData.vehicleColor ||
			!insertVehicleData.vehiclePrice ||
			!insertVehicleData.vehicleLocation ||
			!insertVehicleData.vehicleStockQuantity ||
			insertVehicleData.vehicleImages.length === 0
		);
	};

	const insertVehicleHandler = useCallback(async () => {
		try {
			await createVehicle({ variables: { input: insertVehicleData } });
			await sweetMixinSuccessAlert('This vehicle has been created successfully.');
			await router.push({ pathname: '/mypage', query: { category: 'myVehicles' } });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	}, [insertVehicleData]);

	const updateVehicleHandler = useCallback(async () => {
		try {
			await updateVehicle({ variables: { input: { _id: vehicleId, ...insertVehicleData } } });
			await sweetMixinSuccessAlert('This vehicle has been updated successfully.');
			await router.push({ pathname: '/mypage', query: { category: 'myVehicles' } });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	}, [insertVehicleData, vehicleId]);

	useEffect(() => {
		if (user?._id && user?.memberType !== 'AGENT') router.replace('/mypage');
	}, [router, user?._id, user?.memberType]);

	if (!user?._id || user?.memberType !== 'AGENT') return null;
	if (device === 'mobile') return <div>ADD NEW VEHICLE MOBILE PAGE</div>;

	return (
		<div id="add-property-page">
			<Stack className="main-title-box">
				<Typography className="main-title">Add New Vehicle</Typography>
				<Typography className="sub-title">Manage new Hyundai and Kia inventory.</Typography>
			</Stack>
			<div>
				<Stack className="config">
					<Stack className="description-box">
						<Stack className="config-row">
							<Stack className="price-year-after-price">
								<Typography className="title">Brand</Typography>
								<select
									className={'select-description'}
									value={insertVehicleData.vehicleBrand || 'select'}
									onChange={({ target: { value } }) =>
										setInsertVehicleData({ ...insertVehicleData, vehicleBrand: value as VehicleBrand })
									}
								>
									<option disabled value={'select'}>Select</option>
									{Object.values(VehicleBrand).map((brand) => (
										<option value={brand} key={brand}>{brand}</option>
									))}
								</select>
							</Stack>
							<Stack className="price-year-after-price">
								<Typography className="title">Model</Typography>
								<input
									type="text"
									className="description-input"
									value={insertVehicleData.vehicleModel}
									onChange={({ target: { value } }) => setInsertVehicleData({ ...insertVehicleData, vehicleModel: value })}
								/>
							</Stack>
						</Stack>
						<Stack className="config-row">
							<Stack className="price-year-after-price">
								<Typography className="title">Trim</Typography>
								<input
									type="text"
									className="description-input"
									value={insertVehicleData.vehicleTrim}
									onChange={({ target: { value } }) => setInsertVehicleData({ ...insertVehicleData, vehicleTrim: value })}
								/>
							</Stack>
							<Stack className="price-year-after-price">
								<Typography className="title">Year</Typography>
								<input
									type="number"
									className="description-input"
									value={insertVehicleData.vehicleYear}
									onChange={({ target: { value } }) => setInsertVehicleData({ ...insertVehicleData, vehicleYear: Number(value) })}
								/>
							</Stack>
						</Stack>
						<Stack className="config-row">
							<Stack className="price-year-after-price">
								<Typography className="title">Fuel</Typography>
								<select
									className={'select-description'}
									value={insertVehicleData.vehicleFuel || 'select'}
									onChange={({ target: { value } }) =>
										setInsertVehicleData({ ...insertVehicleData, vehicleFuel: value as VehicleFuel })
									}
								>
									<option disabled value={'select'}>Select</option>
									{Object.values(VehicleFuel).map((fuel) => (
										<option value={fuel} key={fuel}>{fuel}</option>
									))}
								</select>
							</Stack>
							<Stack className="price-year-after-price">
								<Typography className="title">Transmission</Typography>
								<select
									className={'select-description'}
									value={insertVehicleData.vehicleTransmission || 'select'}
									onChange={({ target: { value } }) =>
										setInsertVehicleData({ ...insertVehicleData, vehicleTransmission: value as VehicleTransmission })
									}
								>
									<option disabled value={'select'}>Select</option>
									{Object.values(VehicleTransmission).map((transmission) => (
										<option value={transmission} key={transmission}>{transmission}</option>
									))}
								</select>
							</Stack>
						</Stack>
						<Stack className="config-row">
							<Stack className="price-year-after-price">
								<Typography className="title">Color</Typography>
								<input
									type="text"
									className="description-input"
									value={insertVehicleData.vehicleColor}
									onChange={({ target: { value } }) => setInsertVehicleData({ ...insertVehicleData, vehicleColor: value })}
								/>
							</Stack>
							<Stack className="price-year-after-price">
								<Typography className="title">Price</Typography>
								<input
									type="number"
									className="description-input"
									value={insertVehicleData.vehiclePrice}
									onChange={({ target: { value } }) => setInsertVehicleData({ ...insertVehicleData, vehiclePrice: Number(value) })}
								/>
							</Stack>
						</Stack>
						<Stack className="config-row">
							<Stack className="price-year-after-price">
								<Typography className="title">Location</Typography>
								<input
									type="text"
									className="description-input"
									value={insertVehicleData.vehicleLocation}
									onChange={({ target: { value } }) => setInsertVehicleData({ ...insertVehicleData, vehicleLocation: value })}
								/>
							</Stack>
							<Stack className="price-year-after-price">
								<Typography className="title">Stock Quantity</Typography>
								<input
									type="number"
									className="description-input"
									value={insertVehicleData.vehicleStockQuantity}
									onChange={({ target: { value } }) =>
										setInsertVehicleData({ ...insertVehicleData, vehicleStockQuantity: Number(value) })
									}
								/>
							</Stack>
						</Stack>
						<Stack className="config-row">
							<Stack className="price-year-after-price">
								<Typography className="title">Body Type (optional)</Typography>
								<input
									type="text"
									className="description-input"
									value={insertVehicleData.vehicleBodyType ?? ''}
									onChange={({ target: { value } }) =>
										setInsertVehicleData({ ...insertVehicleData, vehicleBodyType: value || undefined })
									}
								/>
							</Stack>
							<Stack className="price-year-after-price">
								<Typography className="title">Mileage (km, optional)</Typography>
								<input
									type="number"
									min={0}
									className="description-input"
									value={insertVehicleData.vehicleMileage ?? ''}
									onChange={({ target: { value } }) =>
										setInsertVehicleData({ ...insertVehicleData, vehicleMileage: value === '' ? undefined : Number(value) })
									}
								/>
							</Stack>
						</Stack>
						<Stack className="config-column">
							<Typography className="title">Description</Typography>
							<textarea
								className="description-text"
								value={insertVehicleData.vehicleDesc}
								onChange={({ target: { value } }) => setInsertVehicleData({ ...insertVehicleData, vehicleDesc: value })}
							/>
						</Stack>
					</Stack>
					<Typography className="upload-title">Upload vehicle photos</Typography>
					<Stack className="images-box">
						<Stack className="upload-box">
							<Button className="browse-button" onClick={() => inputRef.current.click()}>
								<Typography className="browse-button-text">Browse Files</Typography>
								<input
									ref={inputRef}
									type="file"
									hidden
									onChange={uploadImages}
									multiple
									accept="image/jpg, image/jpeg, image/png"
								/>
							</Button>
						</Stack>
						<Stack className="gallery-box">
							{insertVehicleData.vehicleImages.map((image) => (
								<Stack key={image} className="image-box">
									<img src={`${REACT_APP_API_URL}/${image}`} alt="" />
								</Stack>
							))}
						</Stack>
					</Stack>
					<Stack className="buttons-row">
						<Button className="next-button" disabled={doDisabledCheck()} onClick={vehicleId ? updateVehicleHandler : insertVehicleHandler}>
							<Typography className="next-button-text">Save</Typography>
						</Button>
					</Stack>
				</Stack>
			</div>
		</div>
	);
};

AddProperty.defaultProps = {
	initialValues: {
		vehicleBrand: VehicleBrand.HYUNDAI,
		vehicleModel: '',
		vehicleTrim: '',
		vehicleYear: new Date().getFullYear(),
		vehicleFuel: VehicleFuel.GASOLINE,
		vehicleTransmission: VehicleTransmission.AUTOMATIC,
		vehicleColor: '',
		vehiclePrice: 0,
		vehicleLocation: '',
		vehicleStockQuantity: 1,
		vehicleDesc: '',
		vehicleImages: [],
	},
};

export default AddProperty;

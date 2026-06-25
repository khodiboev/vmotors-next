import React, { useCallback, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Button, Stack, Typography } from '@mui/material';
import axios from 'axios';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberUpdate } from '../../types/member/member.update';
import { getJwtToken, updateStorage, updateUserInfo } from '../../auth';
import { UPDATE_MEMBER } from '../../../apollo/user/mutation';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../sweetAlert';
import { Messages, REACT_APP_API_URL } from '../../config';

const MyProfile: NextPage = ({ initialValues }: any) => {
	const token = getJwtToken();
	const user = useReactiveVar(userVar);
	const [updateData, setUpdateData] = useState<MemberUpdate>(initialValues);

	const [updateMember] = useMutation(UPDATE_MEMBER);

	useEffect(() => {
		setUpdateData((prev) => ({
			...prev,
			memberNick: user?.memberNick ?? '',
			memberPhone: user?.memberPhone ?? '',
			memberAddress: user?.memberAddress ?? '',
			memberImage: user?.memberImage ?? '',
		}));
	}, [user]);

	const uploadImage = async (e: any) => {
		try {
			const image = e.target.files[0];
			if (!image) return;

			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target)
				  }`,
					variables: {
						file: null,
						target: 'member',
					},
				}),
			);
			formData.append(
				'map',
				JSON.stringify({
					'0': ['variables.file'],
				}),
			);
			formData.append('0', image);

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const responseImage = response.data.data.imageUploader;
			setUpdateData((prev) => ({ ...prev, memberImage: responseImage }));

			return `${REACT_APP_API_URL}/${responseImage}`;
		} catch (err) {
			console.log('Error, uploadImage:', err);
		}
	};

	const updatePropertyHandler = useCallback(async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			const result = await updateMember({
				variables: {
					input: {
						...updateData,
						_id: user._id,
					},
				},
			});

			// @ts-ignore
			const jwtToken = result.data.updateMember?.accessToken;
			updateStorage({ jwtToken });
			updateUserInfo(result.data.updateMember?.accessToken);
			await sweetMixinSuccessAlert('Profile updated successfully.');
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	}, [updateData, updateMember, user]);

	const isUpdateDisabled =
		updateData.memberNick === '' ||
		updateData.memberPhone === '' ||
		updateData.memberAddress === '' ||
		updateData.memberImage === '';

	const profileImage = updateData?.memberImage ? `${REACT_APP_API_URL}/${updateData.memberImage}` : '/img/profile/defaultUser.svg';

	return (
		<div id="my-profile-page">
			<Stack className="dashboard-section-shell">
				<Stack className="dashboard-shell-header">
					<div className={'copy'}>
						<span className={'section-kicker'}>Profile settings</span>
						<Typography className="main-title">Your Santa profile</Typography>
						<Typography className="sub-title">Keep your contact details, location, and profile image ready for buyers, dealers, and community activity.</Typography>
					</div>
					<div className={'shell-badge'}>
						<SettingsOutlinedIcon />
						<span>{user?.memberType === 'AGENT' ? 'Dealer account' : 'Buyer account'}</span>
					</div>
				</Stack>

				<Stack className="profile-overview-grid">
					<article className={'overview-card'}>
						<div className={'overview-icon'}>
							<BadgeOutlinedIcon />
						</div>
						<div>
							<strong>{user?.memberNick || 'Santa member'}</strong>
							<span>Display name</span>
						</div>
					</article>
					<article className={'overview-card'}>
						<div className={'overview-icon'}>
							<LocalPhoneOutlinedIcon />
						</div>
						<div>
							<strong>{user?.memberPhone || 'Not set yet'}</strong>
							<span>Primary contact</span>
						</div>
					</article>
					<article className={'overview-card'}>
						<div className={'overview-icon'}>
							<LocationOnOutlinedIcon />
						</div>
						<div>
							<strong>{user?.memberAddress || 'Add your region'}</strong>
							<span>Marketplace location</span>
						</div>
					</article>
				</Stack>

				<Stack className="profile-editor-shell">
					<Stack className="photo-box">
						<div className={'section-title-row'}>
							<Typography className="title">Profile image</Typography>
							<Typography className="helper-copy">Use a clean photo to strengthen trust across the Santa marketplace.</Typography>
						</div>
						<Stack className="image-big-box">
							<Stack className="image-box">
								<img src={profileImage} alt={user?.memberNick || 'Santa member'} />
							</Stack>
							<Stack className="upload-big-box">
								<input type="file" hidden id="hidden-input" onChange={uploadImage} accept="image/jpg, image/jpeg, image/png" />
								<label htmlFor="hidden-input" className="labeler">
									<Typography>Upload profile image</Typography>
								</label>
								<Typography className="upload-text">JPG, JPEG, or PNG files work best for a crisp marketplace profile.</Typography>
							</Stack>
						</Stack>
					</Stack>

					<Stack className="profile-form-grid">
						<Stack className="input-box">
							<Typography className="title">Display name</Typography>
							<input
								type="text"
								placeholder="Your display name"
								value={updateData.memberNick}
								onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberNick: value })}
							/>
						</Stack>
						<Stack className="input-box">
							<Typography className="title">Phone number</Typography>
							<input
								type="text"
								placeholder="Your phone number"
								value={updateData.memberPhone}
								onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberPhone: value })}
							/>
						</Stack>
						<Stack className="input-box full-width">
							<Typography className="title">Location</Typography>
							<input
								type="text"
								placeholder="Your city or region"
								value={updateData.memberAddress}
								onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberAddress: value })}
							/>
						</Stack>
					</Stack>

					<Stack className="about-me-box">
						<Button className="update-button" onClick={updatePropertyHandler} disabled={isUpdateDisabled}>
							<Typography>Update profile</Typography>
							<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
								<g clipPath="url(#clip0_7065_6985)">
									<path
										d="M12.6389 0H4.69446C4.49486 0 4.33334 0.161518 4.33334 0.361122C4.33334 0.560727 4.49486 0.722245 4.69446 0.722245H11.7672L0.105803 12.3836C-0.0352676 12.5247 -0.0352676 12.7532 0.105803 12.8942C0.176321 12.9647 0.268743 13 0.361131 13C0.453519 13 0.545907 12.9647 0.616459 12.8942L12.2778 1.23287V8.30558C12.2778 8.50518 12.4393 8.6667 12.6389 8.6667C12.8385 8.6667 13 8.50518 13 8.30558V0.361122C13 0.161518 12.8385 0 12.6389 0Z"
										fill="white"
									/>
								</g>
								<defs>
									<clipPath id="clip0_7065_6985">
										<rect width="13" height="13" fill="white" />
									</clipPath>
								</defs>
							</svg>
						</Button>
					</Stack>
				</Stack>
			</Stack>
		</div>
	);
};

MyProfile.defaultProps = {
	initialValues: {
		_id: '',
		memberImage: '',
		memberNick: '',
		memberPhone: '',
		memberAddress: '',
	},
};

export default MyProfile;

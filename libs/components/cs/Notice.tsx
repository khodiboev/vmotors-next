import React from 'react';
import { Stack, Box } from '@mui/material';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';

const noticeData = [
	{
		no: '01',
		event: true,
		title: 'Welcome to the upgraded VMotors support center for Hyundai and Kia buyers.',
		date: '2026.06.09',
		tag: 'Featured',
	},
	{
		no: '02',
		title: 'Dealer and buyer support guidance has been refreshed to match the new VMotors marketplace experience.',
		date: '2026.06.09',
		tag: 'Update',
	},
	{
		no: '03',
		title: 'Review the latest FAQ before contacting support for account, listing, payment, or community questions.',
		date: '2026.06.09',
		tag: 'Help',
	},
];

const Notice = () => {
	return (
		<Stack className={'notice-content'}>
			<div className={'section-heading'}>
				<span className={'label'}>Platform notices</span>
				<strong>Important updates for VMotors users and dealers</strong>
				<p>Stay current on support guidance, service updates, and key marketplace notices before you buy, list, or manage your account.</p>
			</div>

			<div className={'notice-overview'}>
				<div className={'overview-card'}>
					<div className={'overview-icon'}>
						<CampaignRoundedIcon />
					</div>
					<div>
						<strong>Marketplace updates</strong>
						<p>Service notices, policy reminders, and platform improvements surfaced in one calmer support stream.</p>
					</div>
				</div>
				<div className={'overview-card'}>
					<div className={'overview-icon'}>
						<DirectionsCarFilledOutlinedIcon />
					</div>
					<div>
						<strong>Automotive-first guidance</strong>
						<p>Support language now reflects inventory, delivery, dealer, and ownership workflows instead of unrelated legacy copy.</p>
					</div>
				</div>
			</div>

			<Stack className={'main'}>
				<Box component={'div'} className={'top'}>
					<span>Type</span>
					<span>Notice</span>
					<span>Date</span>
				</Box>
				<Stack className={'bottom'}>
					{noticeData.map((ele) => (
						<div className={`notice-card ${ele?.event ? 'event' : ''}`} key={ele.title}>
							<div className={'notice-badge-wrap'}>
								{ele?.event ? <div>{ele.tag}</div> : <span className={'notice-number'}>{ele.no}</span>}
							</div>
							<span className={'notice-title'}>{ele.title}</span>
							<span className={'notice-date'}>{ele.date}</span>
						</div>
					))}
				</Stack>
			</Stack>
		</Stack>
	);
};

export default Notice;

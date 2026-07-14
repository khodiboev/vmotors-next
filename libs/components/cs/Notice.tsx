import React, { useMemo, useState } from 'react';
import { Stack, Box } from '@mui/material';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import moment from 'moment';
import { useQuery } from '@apollo/client';
import { GET_NOTICES } from '../../../apollo/user/query';
import { Notice as NoticeItem } from '../../types/notice/notice';
import { NoticeCategory } from '../../enums/notice.enum';

const fallbackNoticeData = [
	{
		no: '01',
		event: true,
		title: 'Welcome to the upgraded Santa support desk for Hyundai and Kia buyers.',
		date: '2026.06.09',
		tag: 'Featured',
	},
	{
		no: '02',
		title: 'Dealer and buyer support guidance has been refreshed to match the new Santa marketplace standard.',
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
	const [openId, setOpenId] = useState<string | null>(null);

	// Admin-managed announcements (ACTIVE only); static copy remains as fallback
	const { data: noticesData } = useQuery(GET_NOTICES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 50, search: { noticeCategory: NoticeCategory.NOTICE } } },
	});

	const liveNotices: NoticeItem[] = useMemo(() => noticesData?.getNotices?.list ?? [], [noticesData]);

	const noticeData = useMemo(() => {
		if (!liveNotices.length) return fallbackNoticeData;
		return liveNotices.map((notice, index) => ({
			no: String(index + 1).padStart(2, '0'),
			event: index === 0,
			id: notice._id,
			title: notice.noticeTitle,
			content: notice.noticeContent,
			date: moment(notice.createdAt).format('YYYY.MM.DD'),
			tag: index === 0 ? 'Latest' : 'Notice',
		}));
	}, [liveNotices]);

	return (
		<Stack className={'notice-content'}>
			<div className={'section-heading'}>
				<span className={'label'}>Platform notices</span>
				<strong>Important updates for Santa buyers and dealers</strong>
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
					{noticeData.map((ele: any) => (
						<div key={ele.id ?? ele.title}>
							<div
								className={`notice-card ${ele?.event ? 'event' : ''} ${ele.content ? 'expandable' : ''}`}
								onClick={() => ele.content && setOpenId(openId === (ele.id ?? ele.title) ? null : ele.id ?? ele.title)}
							>
								<div className={'notice-badge-wrap'}>
									{ele?.event ? <div>{ele.tag}</div> : <span className={'notice-number'}>{ele.no}</span>}
								</div>
								<span className={'notice-title'}>{ele.title}</span>
								<span className={'notice-date'}>{ele.date}</span>
								{ele.content && (
									<KeyboardArrowDownRoundedIcon
										className={`notice-caret ${openId === (ele.id ?? ele.title) ? 'open' : ''}`}
									/>
								)}
							</div>
							{ele.content && openId === (ele.id ?? ele.title) && (
								<div className={'notice-body'}>
									<p>{ele.content}</p>
								</div>
							)}
						</div>
					))}
				</Stack>
			</Stack>
		</Stack>
	);
};

export default Notice;

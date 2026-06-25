import React from 'react';
import { useRouter } from 'next/router';
import { Stack, Typography, Box, List, ListItem } from '@mui/material';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { logOut } from '../../auth';
import { sweetConfirmAlert } from '../../sweetAlert';

const MyMenu = () => {
	const router = useRouter();
	const pathname = typeof router.query.category === 'string' ? router.query.category : 'myProfile';
	const user = useReactiveVar(userVar);

	const listingItems = [
		...(user?.memberType === 'AGENT'
			? [
					{ key: 'addVehicle', label: 'Add vehicle', icon: <AddCircleOutlineRoundedIcon />, href: '/mypage?category=addVehicle' },
					{ key: 'myVehicles', label: 'My vehicles', icon: <DirectionsCarFilledOutlinedIcon />, href: '/mypage?category=myVehicles' },
			  ]
			: []),
		{ key: 'myFavorites', label: 'Saved vehicles', icon: <BookmarkBorderRoundedIcon />, href: '/mypage?category=myFavorites' },
		{ key: 'recentlyVisited', label: 'Recently viewed', icon: <HistoryRoundedIcon />, href: '/mypage?category=recentlyVisited' },
		{ key: 'followers', label: 'Followers', icon: <GroupOutlinedIcon />, href: '/mypage?category=followers' },
		{ key: 'followings', label: 'Following', icon: <PersonAddAltOutlinedIcon />, href: '/mypage?category=followings' },
	];

	const communityItems = [
		{ key: 'myArticles', label: 'Articles', icon: <ForumOutlinedIcon />, href: '/mypage?category=myArticles' },
		{ key: 'writeArticle', label: 'Write article', icon: <ArticleOutlinedIcon />, href: '/mypage?category=writeArticle' },
	];

	const accountItems = [{ key: 'myProfile', label: 'Profile settings', icon: <AccountCircleOutlinedIcon />, href: '/mypage?category=myProfile' }];

	const logoutHandler = async () => {
		try {
			if (await sweetConfirmAlert('Do you want to logout?')) logOut();
		} catch (err: any) {
			console.log('ERROR, logoutHandler:', err.message);
		}
	};

	const renderNavItems = (items: Array<{ key: string; label: string; icon: React.ReactNode; href: string }>) => {
		return (
			<List className={'sub-section'}>
				{items.map((item) => (
					<ListItem className={pathname === item.key ? 'focus' : ''} key={item.key}>
						<Link href={item.href} scroll={false}>
							<div className={'flex-box'}>
								<span className={'com-icon'}>{item.icon}</span>
								<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
									{item.label}
								</Typography>
							</div>
						</Link>
					</ListItem>
				))}
			</List>
		);
	};

	return (
		<Stack width={'100%'} className={'dashboard-menu-shell'}>
			<Stack className={'profile'}>
				<Box component={'div'} className={'profile-img'}>
					<img
						src={user?.memberImage ? `${REACT_APP_API_URL}/${user.memberImage}` : '/img/profile/defaultUser.svg'}
						alt={user?.memberNick || 'Santa member'}
					/>
				</Box>

				<Stack className={'user-info'}>
					<div className={'identity-row'}>
						<Typography className={'user-name'}>{user?.memberNick || 'Santa member'}</Typography>
						<span className={'member-badge'}>{user?.memberType || 'USER'}</span>
					</div>

					{user?.memberPhone && (
						<Box component={'div'} className={'user-meta-row'}>
							<PhoneOutlinedIcon />
							<Typography className={'meta-copy'}>{user.memberPhone}</Typography>
						</Box>
					)}

					{user?.memberAddress && (
						<Box component={'div'} className={'user-meta-row'}>
							<PlaceOutlinedIcon />
							<Typography className={'meta-copy'}>{user.memberAddress}</Typography>
						</Box>
					)}

					{user?.memberType === 'ADMIN' ? (
						<a href="/_admin/users" target={'_blank'} rel="noreferrer" className={'view-list-link'}>
							<Typography className={'view-list'}>Open admin console</Typography>
						</a>
					) : (
						<Typography className={'profile-note'}>
							{user?.memberType === 'AGENT' ? 'Dealer tools and inventory controls' : 'Buyer tools and saved vehicle tracking'}
						</Typography>
					)}
				</Stack>
			</Stack>

			<Stack className={'profile-metrics'}>
				<div>
					<strong>{user?.memberVehicles ?? 0}</strong>
					<span>Vehicles</span>
				</div>
				<div>
					<strong>{user?.memberViews ?? 0}</strong>
					<span>Profile views</span>
				</div>
				<div>
					<strong>{user?.memberArticles ?? 0}</strong>
					<span>Articles</span>
				</div>
			</Stack>

			<Stack className={'sections'}>
				<Stack className={'section'}>
					<Typography className="title" variant={'h5'}>
						Dashboard
					</Typography>
					{renderNavItems(listingItems)}
				</Stack>

				<Stack className={'section'}>
					<Typography className="title" variant={'h5'}>
						Community
					</Typography>
					{renderNavItems(communityItems)}
				</Stack>

				<Stack className={'section'}>
					<Typography className="title" variant={'h5'}>
						Account
					</Typography>
					{renderNavItems(accountItems)}
					<List className={'sub-section utility-list'}>
						<ListItem onClick={logoutHandler}>
							<div className={'flex-box'}>
								<span className={'com-icon'}>
									<LogoutRoundedIcon />
								</span>
								<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
									Logout
								</Typography>
							</div>
						</ListItem>
					</List>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default MyMenu;

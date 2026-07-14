import type { ComponentType } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { Avatar, Divider, IconButton, Menu, MenuItem } from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import AdminMenuList from '../admin/AdminMenuList';
import { getJwtToken, logOut, updateUserInfo } from '../../auth';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { MemberType } from '../../enums/member.enum';

const PAGE_TITLES: Array<{ prefix: string; title: string; desc: string }> = [
	{ prefix: '/_admin/users', title: 'Members', desc: 'Manage buyers, dealers, and admins' },
	{ prefix: '/_admin/vehicles', title: 'Vehicles', desc: 'Moderate marketplace inventory' },
	{ prefix: '/_admin/community', title: 'Community', desc: 'Moderate articles and discussions' },
	{ prefix: '/_admin/cs/faq', title: 'FAQ', desc: 'Support questions shown on the CS page' },
	{ prefix: '/_admin/cs/notice', title: 'Notices', desc: 'Announcements shown on the CS page' },
	{ prefix: '/_admin/cs', title: 'Customer Support', desc: 'Support content management' },
];

const withAdminLayout = (Component: ComponentType) => {
	return (props: object) => {
		const router = useRouter();
		const user = useReactiveVar(userVar);
		const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
		const [loading, setLoading] = useState(true);

		const pageMeta = useMemo(
			() =>
				PAGE_TITLES.find((ele) => router.pathname.startsWith(ele.prefix)) ?? {
					title: 'Dashboard',
					desc: 'Santa marketplace administration',
				},
			[router.pathname],
		);

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
			setLoading(false);
		}, []);

		useEffect(() => {
			if (!loading && user.memberType !== MemberType.ADMIN) {
				router.push('/').then();
			}
		}, [loading, user, router]);

		/** HANDLERS **/
		const logoutHandler = () => {
			logOut();
			router.push('/').then();
		};

		if (!user || user?.memberType !== MemberType.ADMIN) return null;

		return (
			<>
				<Head>
					<title>Santa Admin | {pageMeta.title}</title>
				</Head>
				<main id="pc-wrap" className="admin">
					<div className={'admin-shell'}>
						<aside className={'admin-sidebar'}>
							<Link href={'/'} className={'brand'}>
								<img src={'/img/logo/logo.svg'} alt={'Santa'} />
								<span className={'brand-tag'}>ADMIN</span>
							</Link>

							<div className={'admin-user-card'}>
								<Avatar
									src={user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'}
								/>
								<div>
									<strong>{user?.memberNick}</strong>
									<span>{user?.memberPhone}</span>
								</div>
							</div>

							<AdminMenuList />

							<div className={'sidebar-foot'}>
								<Link href={'/'} className={'foot-link site'}>
									<span className={'foot-icon'}>
										<OpenInNewRoundedIcon />
									</span>
									<span>Back to site</span>
								</Link>
								<button type={'button'} className={'foot-link logout'} onClick={logoutHandler}>
									<span className={'foot-icon'}>
										<LogoutRoundedIcon />
									</span>
									<span>Logout</span>
								</button>
							</div>
						</aside>

						<div className={'admin-main'}>
							<header className={'admin-topbar'}>
								<div className={'page-heading'}>
									<strong>{pageMeta.title}</strong>
									<span>{pageMeta.desc}</span>
								</div>
								<IconButton onClick={(e) => setAnchorElUser(e.currentTarget)} className={'topbar-avatar-btn'}>
									<Avatar
										src={user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'}
									/>
								</IconButton>
								<Menu
									sx={{ mt: '46px' }}
									className={'admin-row-menu'}
									anchorEl={anchorElUser}
									anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
									transformOrigin={{ vertical: 'top', horizontal: 'right' }}
									keepMounted
									open={Boolean(anchorElUser)}
									onClose={() => setAnchorElUser(null)}
								>
									<MenuItem onClick={() => router.push('/mypage')}>
										<PersonOutlineRoundedIcon fontSize={'small'} sx={{ mr: '10px' }} /> My Page
									</MenuItem>
									<Divider />
									<MenuItem onClick={logoutHandler}>
										<LogoutRoundedIcon fontSize={'small'} sx={{ mr: '10px' }} /> Logout
									</MenuItem>
								</Menu>
							</header>

							<div id="bunker" className={'admin-content'}>
								{/*@ts-ignore*/}
								<Component {...props} />
							</div>
						</div>
					</div>
				</main>
			</>
		);
	};
};

export default withAdminLayout;

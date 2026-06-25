import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { Stack } from '@mui/material';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import MyProperties from '../../libs/components/mypage/MyProperties';
import MyFavorites from '../../libs/components/mypage/MyFavorites';
import RecentlyVisited from '../../libs/components/mypage/RecentlyVisited';
import AddProperty from '../../libs/components/mypage/AddNewProperty';
import MyProfile from '../../libs/components/mypage/MyProfile';
import MyArticles from '../../libs/components/mypage/MyArticles';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import MyMenu from '../../libs/components/mypage/MyMenu';
import WriteArticle from '../../libs/components/mypage/WriteArticle';
import MemberFollowers from '../../libs/components/member/MemberFollowers';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import MemberFollowings from '../../libs/components/member/MemberFollowings';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Messages, REACT_APP_API_URL } from '../../libs/config';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const MyPage: NextPage = () => {
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const category = typeof router.query?.category === 'string' ? router.query.category : 'myProfile';

	const categoryMeta = useMemo(
		() => ({
			myProfile: {
				eyebrow: 'Account overview',
				title: 'Your Santa account hub',
				description: 'Manage your buyer profile, saved Hyundai and Kia vehicles, and marketplace activity in one premium workspace.',
			},
			myFavorites: {
				eyebrow: 'Saved vehicles',
				title: 'Favorites worth revisiting',
				description: 'Track the vehicles you liked most and return to the listings that still deserve a closer look.',
			},
			recentlyVisited: {
				eyebrow: 'Recently viewed',
				title: 'Continue your vehicle research',
				description: 'Pick up where you left off with Hyundai and Kia listings you viewed across the marketplace.',
			},
			myVehicles: {
				eyebrow: 'Dealer inventory',
				title: 'Manage your live inventory',
				description: 'Update availability, review engagement, and keep your dealership inventory polished for serious buyers.',
			},
			addVehicle: {
				eyebrow: 'Add inventory',
				title: 'Publish a new vehicle',
				description: 'Create a clean, buyer-ready listing that fits the premium Santa marketplace experience.',
			},
			myArticles: {
				eyebrow: 'Community activity',
				title: 'Your articles and updates',
				description: 'Review your automotive community activity and keep your editorial presence organized.',
			},
			writeArticle: {
				eyebrow: 'Community publishing',
				title: 'Share insight with the community',
				description: 'Create thoughtful articles for buyers, owners, and dealers in the Santa community.',
			},
			followers: {
				eyebrow: 'Dealer network',
				title: 'People following your activity',
				description: 'See who is tracking your updates, dealer profile, and marketplace presence.',
			},
			followings: {
				eyebrow: 'Dealer network',
				title: 'Accounts you follow',
				description: 'Keep up with the dealers, members, and marketplace voices you want to watch closely.',
			},
		}),
		[],
	);

	const activeMeta = categoryMeta[category as keyof typeof categoryMeta] ?? categoryMeta.myProfile;
	const dashboardStats = [
		{
			label: user?.memberType === 'AGENT' ? 'Live inventory' : 'Saved activity',
			value: user?.memberVehicles ?? 0,
			icon: <DirectionsCarFilledOutlinedIcon />,
		},
		{
			label: 'Profile views',
			value: user?.memberViews ?? 0,
			icon: <GroupOutlinedIcon />,
		},
		{
			label: 'Articles',
			value: user?.memberArticles ?? 0,
			icon: <ForumOutlinedIcon />,
		},
		{
			label: 'Likes',
			value: user?.memberLikes ?? 0,
			icon: <FavoriteBorderRoundedIcon />,
		},
	];

	const memberImage = user?.memberImage ? `${REACT_APP_API_URL}/${user.memberImage}` : '/img/profile/defaultUser.svg';

	/** APOLLO REQUESTS **/
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	/** LIFECYCLES **/
	useEffect(() => {
		if (!user._id) router.push('/').then();
	}, [router, user]);

	/** HANDLERS **/
	const subscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);

			await subscribe({
				variables: {
					input: id,
				},
			});
			await sweetTopSmallSuccessAlert('Subscribed!', 800);
			await refetch({ input: query });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const unsubscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);

			await unsubscribe({
				variables: {
					input: id,
				},
			});

			await sweetTopSmallSuccessAlert('Unsubscribed!', 800);
			await refetch({ input: query });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const likeMemberHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetMember({
				variables: {
					input: id,
				},
			});

			await sweetTopSmallSuccessAlert('Success!', 800);
			await refetch({ input: query });
		} catch (err: any) {
			console.log('ERROR, likeMemberHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member?memberId=${memberId}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	return (
		<div id="my-page">
			<div className="container">
				<Stack className={'my-page'}>
					<section className={'dashboard-hero'}>
						<div className={'hero-copy'}>
							<span className={'eyebrow'}>{activeMeta.eyebrow}</span>
							<h1>{activeMeta.title}</h1>
							<p>{activeMeta.description}</p>
							<div className={'hero-trust-row'}>
								<span>Buyer and dealer ready</span>
								<span>Live marketplace activity</span>
								<span>Santa account center</span>
							</div>
						</div>

						<div className={'hero-sidecard'}>
							<div className={'member-highlight'}>
								<div className={'member-avatar'}>
									<img src={memberImage} alt={user?.memberNick || 'Santa member'} />
								</div>
								<div className={'member-copy'}>
									<strong>{user?.memberNick || 'Santa member'}</strong>
									<span>{user?.memberType === 'AGENT' ? 'Trusted dealer dashboard' : 'Buyer account dashboard'}</span>
									<p>{user?.memberAddress || 'Support your Hyundai and Kia journey from one calm account center.'}</p>
								</div>
							</div>

							<div className={'stats-grid'}>
								{dashboardStats.map((item) => (
									<article className={'stat-card'} key={item.label}>
										<div className={'stat-icon'}>{item.icon}</div>
										<strong>{item.value}</strong>
										<span>{item.label}</span>
									</article>
								))}
							</div>
						</div>
					</section>

					<Stack className={'back-frame'}>
						<aside className={'left-config'}>
							<MyMenu />
						</aside>
						<main className="main-config">
							<Stack className={'list-config'}>
								{category === 'addVehicle' && <AddProperty />}
								{category === 'myVehicles' && <MyProperties />}
								{category === 'myFavorites' && <MyFavorites />}
								{category === 'recentlyVisited' && <RecentlyVisited />}
								{category === 'myArticles' && <MyArticles />}
								{category === 'writeArticle' && <WriteArticle />}
								{category === 'myProfile' && <MyProfile />}
								{category === 'followers' && (
									<MemberFollowers
										subscribeHandler={subscribeHandler}
										unsubscribeHandler={unsubscribeHandler}
										likeMemberHandler={likeMemberHandler}
										redirectToMemberPageHandler={redirectToMemberPageHandler}
									/>
								)}
								{category === 'followings' && (
									<MemberFollowings
										subscribeHandler={subscribeHandler}
										unsubscribeHandler={unsubscribeHandler}
										likeMemberHandler={likeMemberHandler}
										redirectToMemberPageHandler={redirectToMemberPageHandler}
									/>
								)}
							</Stack>
						</main>
					</Stack>
				</Stack>
			</div>
		</div>
	);
};

export default withLayoutBasic(MyPage);

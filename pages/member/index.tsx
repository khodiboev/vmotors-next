import React, { useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import MemberMenu from '../../libs/components/member/MemberMenu';
import MemberProperties from '../../libs/components/member/MemberProperties';
import { useRouter } from 'next/router';
import MemberFollowers from '../../libs/components/member/MemberFollowers';
import MemberArticles from '../../libs/components/member/MemberArticles';
import { Button } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { GET_MEMBER } from '../../apollo/user/query';
import { Messages, REACT_APP_API_URL } from '../../libs/config';
import { sweetDealerActionToast, sweetErrorHandling, sweetFollowActionToast, sweetMixinErrorAlert } from '../../libs/sweetAlert';
import MemberFollowings from '../../libs/components/member/MemberFollowings';
import { userVar } from '../../apollo/store';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Member } from '../../libs/types/member/member';
import { T } from '../../libs/types/common';
import ChatModal from '../../libs/components/common/ChatModal';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const MemberPage: NextPage = () => {
	const router = useRouter();
	const category = router.query?.category as string;
	const memberId = router.query?.memberId as string | undefined;
	const user = useReactiveVar(userVar);
	const [member, setMember] = useState<Member | null>(null);
	// Optimistic override for the hero's own follow state. The refetch that follows a
	// subscribe/unsubscribe can briefly hand back a stale meFollowed, so the hero button
	// trusts its own click over that until a genuinely different member loads.
	const [heroFollowOverride, setHeroFollowOverride] = useState<boolean | null>(null);
	const pendingFollowIds = useRef<Set<string>>(new Set());
	const [chatOpen, setChatOpen] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	// State is synced from `data` in an effect instead of onCompleted:
	// Apollo 3.5 + React 18 strict mode drops onCompleted on hard loads.
	const { data: getMemberData, refetch: getMemberRefetch } = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: memberId },
		skip: !memberId,
		notifyOnNetworkStatusChange: true,
	});

	useEffect(() => {
		setMember(getMemberData?.getMember ?? null);
	}, [getMemberData]);

	/** LIFECYCLES **/
	useEffect(() => {
		setHeroFollowOverride(null);
	}, [memberId]);

	useEffect(() => {
		if (!router.isReady) return;
		if (!category) {
			router.replace(
				{
					pathname: router.pathname,
					query: { ...router.query, category: 'vehicles' },
				},
				undefined,
				{ shallow: true },
			);
		}
	}, [category, router]);

	/** HANDLERS **/
	const subscribeHandler = async (id: string, refetch: any, query: any) => {
		if (!id || pendingFollowIds.current.has(id)) return false;
		try {
			if (!user._id) throw new Error(Messages.error2);
			pendingFollowIds.current.add(id);
			if (id === member?._id) setHeroFollowOverride(true);
			await subscribe({ variables: { input: id } });
			await refetch({ input: query });
			sweetFollowActionToast('Followed');
			return true;
		} catch (err: any) {
			if (id === member?._id) setHeroFollowOverride(null);
			sweetErrorHandling(err).then();
			return false;
		} finally {
			pendingFollowIds.current.delete(id);
		}
	};

	const unsubscribeHandler = async (id: string, refetch: any, query: any) => {
		if (!id || pendingFollowIds.current.has(id)) return false;
		try {
			if (!user._id) throw new Error(Messages.error2);
			pendingFollowIds.current.add(id);
			if (id === member?._id) setHeroFollowOverride(false);
			await unsubscribe({ variables: { input: id } });
			await refetch({ input: query });
			sweetFollowActionToast('Unfollowed');
			return true;
		} catch (err: any) {
			if (id === member?._id) setHeroFollowOverride(null);
			sweetErrorHandling(err).then();
			return false;
		} finally {
			pendingFollowIds.current.delete(id);
		}
	};

	const likeMemberHandler = async (id: string, refetch: any, query: any, message?: string) => {
		if (!id) return false;
		try {
			if (!user._id) throw new Error(Messages.error2);
			await likeTargetMember({ variables: { input: id } });
			await refetch({ input: query });
			sweetDealerActionToast(message ?? 'Member liked');
			return true;
		} catch (err: any) {
			console.log('ERROR, likeMemberHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
			return false;
		}
	};

	const openMessageHandler = async () => {
		if (!user?._id) {
			await router.push({ pathname: '/account/join', query: { referrer: router.asPath } });
			return;
		}
		setChatOpen(true);
	};

	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member?memberId=${memberId}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	const memberName = member?.memberFullName ?? member?.memberNick ?? '';
	const memberAvatar = member?.memberImage
		? `${REACT_APP_API_URL}/${member.memberImage}`
		: '/img/profile/defaultUser.svg';
	const isAgent = (member as any)?.memberType === 'AGENT';
	const isFollowing = heroFollowOverride ?? member?.meFollowed?.[0]?.myFollowing;
	const canFollow = user?._id && user._id !== member?._id;

	return (
		<div id="member-page">
			<div className="container">

				{/* ── PROFILE HERO ── */}
				<section className="member-hero">
					<div className="hero-card">
						<div className="hero-avatar-wrap">
							<img src={memberAvatar} alt={memberName} />
							{isAgent && (
								<span className="verified-badge">
									<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M8 1L10.09 5.26L14.8 5.97L11.4 9.28L12.18 14L8 11.77L3.82 14L4.6 9.28L1.2 5.97L5.91 5.26L8 1Z" fill="currentColor" />
									</svg>
									Santa Verified Dealer
								</span>
							)}
						</div>

						<div className="hero-info">
							<h1>{memberName}</h1>

							{member?.memberPhone && (
								<div className="hero-contact">
									<img src="/img/icons/call.svg" alt="" />
									<span>{member.memberPhone}</span>
								</div>
							)}

							{(member as any)?.memberAddress && (
								<div className="hero-location">
									<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M8 1C5.79 1 4 2.79 4 5C4 8 8 13 8 13C8 13 12 8 12 5C12 2.79 10.21 1 8 1ZM8 6.5C7.17 6.5 6.5 5.83 6.5 5C6.5 4.17 7.17 3.5 8 3.5C8.83 3.5 9.5 4.17 9.5 5C9.5 5.83 8.83 6.5 8 6.5Z" fill="currentColor" />
									</svg>
									<span>{(member as any).memberAddress}</span>
								</div>
							)}

							{(member as any)?.memberDesc && (
								<p className="hero-desc">{(member as any).memberDesc}</p>
							)}

							<div className="hero-stats">
								{isAgent && (
									<div className="stat">
										<strong>{(member as any)?.memberVehicles ?? 0}</strong>
										<span>Vehicles</span>
									</div>
								)}
								<div className="stat">
									<strong>{(member as any)?.memberFollowers ?? 0}</strong>
									<span>Followers</span>
								</div>
								<div className="stat">
									<strong>{(member as any)?.memberFollowings ?? 0}</strong>
									<span>Following</span>
								</div>
								<div className="stat">
									<strong>{(member as any)?.memberArticles ?? 0}</strong>
									<span>Articles</span>
								</div>
							</div>
						</div>

						{canFollow && (
							<div className="hero-actions">
								{isFollowing ? (
									<Button
										className="following-btn"
										onClick={() => unsubscribeHandler(member!._id, getMemberRefetch, memberId)}
									>
										Following
									</Button>
								) : (
									<Button
										className="follow-btn"
										onClick={() => subscribeHandler(member?._id as string, getMemberRefetch, memberId)}
									>
										Follow
									</Button>
								)}
								<Button className="message-btn" onClick={openMessageHandler}>
									Message
								</Button>
							</div>
						)}
					</div>
				</section>

				{/* ── MAIN LAYOUT ── */}
				<div className="member-layout">
					<aside className="member-sidebar">
						<MemberMenu member={member} />
					</aside>

					<div className="member-content">
						{category === 'vehicles' && <MemberProperties />}
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
						{category === 'articles' && <MemberArticles />}
					</div>
				</div>

			</div>

			{member && <ChatModal peer={member} open={chatOpen} onClose={() => setChatOpen(false)} />}
		</div>
	);
};

export default withLayoutBasic(MemberPage);

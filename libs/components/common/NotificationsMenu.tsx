import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import moment from 'moment';
import { Avatar, Badge, IconButton, Popover } from '@mui/material';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { socketVar, userVar } from '../../../apollo/store';
import { GET_MY_CONVERSATIONS, GET_MY_NOTIFICATIONS } from '../../../apollo/user/query';
import { READ_ALL_NOTIFICATIONS, READ_NOTIFICATION } from '../../../apollo/user/mutation';
import { ConversationSummary, Notification } from '../../types/notification/notification';
import { NotificationStatus, NotificationType } from '../../enums/notification.enum';
import { Member } from '../../types/member/member';
import { REACT_APP_API_URL } from '../../config';
import ChatModal from './ChatModal';

const NOTIFICATIONS_LIMIT = 20;

const NotificationsMenu = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const socket = useReactiveVar(socketVar);
	const [anchor, setAnchor] = useState<null | HTMLElement>(null);
	const [activityList, setActivityList] = useState<Notification[]>([]);
	const [conversations, setConversations] = useState<ConversationSummary[]>([]);
	const [chatPeer, setChatPeer] = useState<Member | null>(null);

	// State is synced from `data` in effects — Apollo 3.5 drops onCompleted on hard loads
	const { data: notificationsData, refetch: refetchNotifications } = useQuery(GET_MY_NOTIFICATIONS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: NOTIFICATIONS_LIMIT } },
		skip: !user?._id,
	});

	const { data: conversationsData, refetch: refetchConversations } = useQuery(GET_MY_CONVERSATIONS, {
		fetchPolicy: 'cache-and-network',
		skip: !user?._id,
	});

	const [readNotification] = useMutation(READ_NOTIFICATION);
	const [readAllNotifications] = useMutation(READ_ALL_NOTIFICATIONS);

	/** LIFECYCLES **/
	useEffect(() => {
		const list: Notification[] = notificationsData?.getMyNotifications?.list ?? [];
		setActivityList(list.filter((ele) => ele.notificationType !== NotificationType.MESSAGE));
	}, [notificationsData]);

	useEffect(() => {
		setConversations(conversationsData?.getMyConversations?.list ?? []);
	}, [conversationsData]);

	useEffect(() => {
		if (!socket) return;
		const handler = (msg: MessageEvent) => {
			try {
				const parsed = JSON.parse(msg.data);
				if (parsed.event !== 'notification' || !parsed.data) return;
				const incoming: Notification = parsed.data;
				if (incoming.notificationType === NotificationType.MESSAGE) {
					refetchConversations().catch(() => {});
				} else {
					setActivityList((prev) => [incoming, ...prev].slice(0, NOTIFICATIONS_LIMIT));
				}
			} catch (err) {
				/** non-JSON socket frames are chat traffic — ignore **/
			}
		};
		socket.addEventListener('message', handler);
		return () => socket.removeEventListener('message', handler);
	}, [socket, refetchConversations]);

	const unreadActivity = useMemo(
		() => activityList.filter((ele) => ele.notificationStatus === NotificationStatus.WAIT).length,
		[activityList],
	);
	const unreadMessages = useMemo(
		() => conversations.reduce((acc, ele) => acc + (ele.unreadCount ?? 0), 0),
		[conversations],
	);
	const unreadCount = unreadActivity + unreadMessages;

	/** HANDLERS **/
	const openConversationHandler = (conversation: ConversationSummary) => {
		if (!conversation.peerData) return;
		setAnchor(null);
		setChatPeer(conversation.peerData);
	};

	const markAllHandler = useCallback(async () => {
		setActivityList((prev) => prev.map((ele) => ({ ...ele, notificationStatus: NotificationStatus.READ })));
		setConversations((prev) => prev.map((ele) => ({ ...ele, unreadCount: 0 })));
		try {
			await readAllNotifications();
		} catch (err: any) {
			console.warn('readAllNotifications err:', err.message);
		}
	}, [readAllNotifications]);

	const openActivityHandler = async (notification: Notification) => {
		if (notification.notificationStatus === NotificationStatus.WAIT) {
			setActivityList((prev) =>
				prev.map((ele) =>
					ele._id === notification._id ? { ...ele, notificationStatus: NotificationStatus.READ } : ele,
				),
			);
			readNotification({ variables: { notificationId: notification._id } }).catch(() => {});
		}
		setAnchor(null);
		if (notification.vehicleId) {
			await router.push({ pathname: '/vehicle/detail', query: { id: notification.vehicleId } });
		} else if (notification.articleId) {
			await router.push({ pathname: '/community/detail', query: { id: notification.articleId } });
		} else if (notification.authorId) {
			await router.push({ pathname: '/member', query: { memberId: notification.authorId } });
		}
	};

	if (!user?._id) return null;

	return (
		<>
			<IconButton
				className={'notifications-bell'}
				aria-label={'Notifications'}
				onClick={(event) => {
					setAnchor(event.currentTarget);
					refetchNotifications().catch(() => {});
					refetchConversations().catch(() => {});
				}}
			>
				<Badge badgeContent={unreadCount} color={'error'} overlap={'circular'}>
					<NotificationsOutlinedIcon className={'notification-icon'} />
				</Badge>
			</IconButton>
			<Popover
				open={Boolean(anchor)}
				anchorEl={anchor}
				onClose={() => setAnchor(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				className={'notifications-popover'}
			>
				<div className={'notifications-panel'}>
					<div className={'panel-head'}>
						<strong>Notifications</strong>
						{unreadCount > 0 && (
							<button type={'button'} onClick={markAllHandler}>
								<DoneAllRoundedIcon />
								<span>Mark all read</span>
							</button>
						)}
					</div>
					<div className={'panel-list'}>
						{conversations.length === 0 && activityList.length === 0 && (
							<div className={'panel-empty'}>
								<NotificationsOutlinedIcon />
								<span>No notifications yet</span>
							</div>
						)}

						{conversations.length > 0 && <span className={'panel-section'}>Messages</span>}
						{conversations.map((conversation) => {
							const peer = conversation.peerData;
							const peerName = peer?.memberFullName || peer?.memberNick || 'Santa member';
							const peerImage = peer?.memberImage
								? `${REACT_APP_API_URL}/${peer.memberImage}`
								: '/img/profile/defaultUser.svg';
							const last = conversation.lastMessage;
							const mine = String(last?.authorId) === String(user._id);
							return (
								<div key={String(conversation.peerId)} className={`panel-item ${conversation.unreadCount ? 'unread' : ''}`}>
									<button type={'button'} className={'item-main'} onClick={() => openConversationHandler(conversation)}>
										<div className={'item-avatar'}>
											<Avatar src={peerImage} alt={peerName} />
										</div>
										<div className={'item-body'}>
											<p>
												<b>{peerName}</b>
											</p>
											<span className={'desc'}>
												{mine ? 'You: ' : ''}
												{last?.notificationDesc}
											</span>
											<span className={'time'}>{moment(last?.createdAt).fromNow()}</span>
										</div>
										{conversation.unreadCount > 0 && <em className={'unread-count'}>{conversation.unreadCount}</em>}
									</button>
								</div>
							);
						})}

						{activityList.length > 0 && <span className={'panel-section'}>Activity</span>}
						{activityList.map((notification) => {
							const author = notification.authorData;
							const authorName = author?.memberFullName || author?.memberNick || 'Santa member';
							const authorImage = author?.memberImage
								? `${REACT_APP_API_URL}/${author.memberImage}`
								: '/img/profile/defaultUser.svg';
							const unread = notification.notificationStatus === NotificationStatus.WAIT;
							return (
								<div key={notification._id} className={`panel-item ${unread ? 'unread' : ''}`}>
									<button type={'button'} className={'item-main'} onClick={() => openActivityHandler(notification)}>
										<div className={'item-avatar'}>
											<Avatar src={authorImage} alt={authorName} />
											{notification.notificationType === NotificationType.COMMENT ? (
												<ChatBubbleOutlineRoundedIcon className={'type-badge comment'} />
											) : (
												<FavoriteRoundedIcon className={'type-badge like'} />
											)}
										</div>
										<div className={'item-body'}>
											<p>
												<b>{authorName}</b> {notification.notificationTitle}
											</p>
											{notification.notificationDesc && <span className={'desc'}>{notification.notificationDesc}</span>}
											<span className={'time'}>{moment(notification.createdAt).fromNow()}</span>
										</div>
										{unread && <i className={'unread-dot'} />}
									</button>
								</div>
							);
						})}
					</div>
				</div>
			</Popover>
			{chatPeer && (
				<ChatModal
					peer={chatPeer}
					open={Boolean(chatPeer)}
					onClose={() => {
						setChatPeer(null);
						refetchConversations().catch(() => {});
					}}
					onRead={() => refetchConversations().catch(() => {})}
				/>
			)}
		</>
	);
};

export default NotificationsMenu;

import React, { useCallback, useEffect, useRef, useState } from 'react';
import moment from 'moment';
import { Avatar, Modal } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { socketVar, userVar } from '../../../apollo/store';
import { GET_CONVERSATION } from '../../../apollo/user/query';
import { READ_CONVERSATION, SEND_MESSAGE } from '../../../apollo/user/mutation';
import { Notification } from '../../types/notification/notification';
import { NotificationType } from '../../enums/notification.enum';
import { Member } from '../../types/member/member';
import { REACT_APP_API_URL } from '../../config';
import { sweetMixinErrorAlert } from '../../sweetAlert';

const CONVERSATION_LIMIT = 60;

interface ChatModalProps {
	peer: Member;
	open: boolean;
	onClose: () => void;
	onRead?: () => void;
}

const ChatModal = ({ peer, open, onClose, onRead }: ChatModalProps) => {
	const user = useReactiveVar(userVar);
	const socket = useReactiveVar(socketVar);
	const [messages, setMessages] = useState<Notification[]>([]);
	const [draft, setDraft] = useState<string>('');
	const [sending, setSending] = useState<boolean>(false);
	const feedRef = useRef<HTMLDivElement>(null);

	const { data: conversationData, refetch: refetchConversation } = useQuery(GET_CONVERSATION, {
		fetchPolicy: 'network-only',
		variables: { input: { peerId: peer._id, page: 1, limit: CONVERSATION_LIMIT } },
		skip: !open || !peer?._id || !user?._id,
	});

	const [sendMessage] = useMutation(SEND_MESSAGE);
	const [readConversation] = useMutation(READ_CONVERSATION);

	const scrollToBottom = useCallback(() => {
		requestAnimationFrame(() => {
			if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
		});
	}, []);

	/** LIFECYCLES **/
	useEffect(() => {
		if (conversationData?.getConversation) {
			setMessages(conversationData.getConversation.list ?? []);
			scrollToBottom();
		}
	}, [conversationData, scrollToBottom]);

	// Opening the thread consumes its unread messages
	useEffect(() => {
		if (!open || !peer?._id || !user?._id) return;
		readConversation({ variables: { peerId: peer._id } })
			.then(() => onRead?.())
			.catch(() => {});
	}, [open, peer?._id]);

	// Live incoming messages from this peer while the window is open
	useEffect(() => {
		if (!open || !socket) return;
		const handler = (msg: MessageEvent) => {
			try {
				const parsed = JSON.parse(msg.data);
				const incoming: Notification | undefined = parsed?.data;
				if (
					parsed.event === 'notification' &&
					incoming?.notificationType === NotificationType.MESSAGE &&
					String(incoming.authorId) === String(peer._id)
				) {
					setMessages((prev) => [...prev, incoming]);
					scrollToBottom();
					readConversation({ variables: { peerId: peer._id } })
						.then(() => onRead?.())
						.catch(() => {});
				}
			} catch (err) {
				/** non-JSON socket frames are chat traffic — ignore **/
			}
		};
		socket.addEventListener('message', handler);
		return () => socket.removeEventListener('message', handler);
	}, [open, socket, peer?._id, scrollToBottom]);

	/** HANDLERS **/
	const sendHandler = async () => {
		const text = draft.trim();
		if (!text || sending) return;
		try {
			setSending(true);
			const result = await sendMessage({
				variables: { input: { receiverId: peer._id, notificationDesc: text } },
			});
			const sent: Notification | undefined = result?.data?.sendMessage;
			if (sent) setMessages((prev) => [...prev, sent]);
			setDraft('');
			scrollToBottom();
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		} finally {
			setSending(false);
		}
	};

	const peerName = peer?.memberFullName || peer?.memberNick || 'Santa member';
	const peerImage = peer?.memberImage ? `${REACT_APP_API_URL}/${peer.memberImage}` : '/img/profile/defaultUser.svg';

	return (
		<Modal open={open} onClose={onClose} className={'chat-modal'}>
			<div className={'chat-window'}>
				<div className={'chat-head'}>
					<Avatar src={peerImage} alt={peerName} />
					<div className={'peer-copy'}>
						<strong>{peerName}</strong>
						<span>{peer?.memberType === 'AGENT' ? 'Certified dealer' : 'Santa member'}</span>
					</div>
					<button type={'button'} aria-label={'Close chat'} onClick={onClose}>
						<CloseRoundedIcon />
					</button>
				</div>
				<div className={'chat-feed'} ref={feedRef}>
					{messages.length === 0 && (
						<div className={'chat-empty'}>
							<span>No messages yet — say hello!</span>
						</div>
					)}
					{messages.map((message) => {
						const mine = String(message.authorId) === String(user?._id);
						return (
							<div key={message._id} className={`chat-bubble-row ${mine ? 'mine' : 'theirs'}`}>
								<div className={'chat-bubble'}>
									<p>{message.notificationDesc}</p>
									<span>{moment(message.createdAt).format('MMM D, HH:mm')}</span>
								</div>
							</div>
						);
					})}
				</div>
				<div className={'chat-compose'}>
					<input
						type={'text'}
						placeholder={`Message ${peerName}`}
						value={draft}
						maxLength={500}
						onChange={(e) => setDraft(e.target.value)}
						onKeyDown={(event) => {
							if (event.key === 'Enter') sendHandler();
						}}
					/>
					<button type={'button'} aria-label={'Send message'} disabled={!draft.trim() || sending} onClick={sendHandler}>
						<SendRoundedIcon />
					</button>
				</div>
			</div>
		</Modal>
	);
};

export default ChatModal;

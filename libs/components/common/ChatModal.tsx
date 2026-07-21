import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import moment from 'moment';
import { Avatar, Menu, MenuItem, Modal } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { socketVar, userVar } from '../../../apollo/store';
import { GET_CONVERSATION } from '../../../apollo/user/query';
import { READ_CONVERSATION, SEND_MESSAGE, UPDATE_MESSAGE } from '../../../apollo/user/mutation';
import { Notification } from '../../types/notification/notification';
import { NotificationStatus, NotificationType } from '../../enums/notification.enum';
import { Member } from '../../types/member/member';
import { REACT_APP_API_URL } from '../../config';
import { sweetConfirmAlert, sweetMixinErrorAlert } from '../../sweetAlert';

const CONVERSATION_LIMIT = 60;

interface ChatModalProps {
	peer: Member;
	open: boolean;
	onClose: () => void;
	onRead?: () => void;
}

const ChatModal = ({ peer, open, onClose, onRead }: ChatModalProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const socket = useReactiveVar(socketVar);
	const [messages, setMessages] = useState<Notification[]>([]);
	const [draft, setDraft] = useState<string>('');
	const [sending, setSending] = useState<boolean>(false);
	const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number; message: Notification } | null>(null);
	const [editingId, setEditingId] = useState<string>('');
	const [editValue, setEditValue] = useState<string>('');
	const feedRef = useRef<HTMLDivElement>(null);

	const { data: conversationData, refetch: refetchConversation } = useQuery(GET_CONVERSATION, {
		fetchPolicy: 'network-only',
		variables: { input: { peerId: peer._id, page: 1, limit: CONVERSATION_LIMIT } },
		skip: !open || !peer?._id || !user?._id,
	});

	const [sendMessage] = useMutation(SEND_MESSAGE);
	const [readConversation] = useMutation(READ_CONVERSATION);
	const [updateMessage] = useMutation(UPDATE_MESSAGE);

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

	const goToPeerProfileHandler = async () => {
		if (!peer?._id) return;
		onClose();
		if (String(peer._id) === String(user?._id)) await router.push(`/mypage?memberId=${peer._id}`);
		else await router.push(`/member?memberId=${peer._id}`);
	};

	const messageContextMenuHandler = (event: React.MouseEvent, message: Notification) => {
		if (String(message.authorId) !== String(user?._id)) return;
		event.preventDefault();
		setMenuAnchor({ x: event.clientX, y: event.clientY, message });
	};

	const closeContextMenuHandler = () => setMenuAnchor(null);

	const startEditHandler = () => {
		if (!menuAnchor) return;
		setEditingId(String(menuAnchor.message._id));
		setEditValue(menuAnchor.message.notificationDesc ?? '');
		closeContextMenuHandler();
	};

	const cancelEditHandler = () => {
		setEditingId('');
		setEditValue('');
	};

	const saveEditHandler = async (messageId: string) => {
		const text = editValue.trim();
		if (!text) return;
		try {
			const result = await updateMessage({ variables: { input: { _id: messageId, notificationDesc: text } } });
			const updated = result?.data?.updateMessage;
			setMessages((prev) =>
				prev.map((message) => (message._id === messageId ? { ...message, notificationDesc: updated?.notificationDesc ?? text } : message)),
			);
			cancelEditHandler();
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	};

	const deleteMessageHandler = async () => {
		const target = menuAnchor?.message;
		closeContextMenuHandler();
		if (!target) return;
		if (!(await sweetConfirmAlert('Delete this message?'))) return;
		try {
			await updateMessage({ variables: { input: { _id: target._id, notificationStatus: NotificationStatus.DELETE } } });
			setMessages((prev) => prev.filter((message) => message._id !== target._id));
			// The mutation response updates this message's cache entity in place (status: DELETE)
			// rather than removing it, which would otherwise resync the filtered-out bubble back
			// into view via the conversationData effect above — refetch to get the server's
			// already-filtered list instead.
			await refetchConversation({ input: { peerId: peer._id, page: 1, limit: CONVERSATION_LIMIT } });
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	};

	const peerName = peer?.memberFullName || peer?.memberNick || 'Santa member';
	const peerImage = peer?.memberImage ? `${REACT_APP_API_URL}/${peer.memberImage}` : '/img/profile/defaultUser.svg';

	return (
		<>
			<Modal open={open} onClose={onClose} className={'chat-modal'}>
				<div className={'chat-window'}>
				<div className={'chat-head'} onClick={goToPeerProfileHandler} role={'button'} tabIndex={0}>
					<Avatar src={peerImage} alt={peerName} />
					<div className={'peer-copy'}>
						<strong>{peerName}</strong>
						<span>{peer?.memberType === 'AGENT' ? 'Certified dealer' : 'Santa member'}</span>
					</div>
					<button
						type={'button'}
						aria-label={'Close chat'}
						onClick={(event) => {
							event.stopPropagation();
							onClose();
						}}
					>
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
						const isEditing = editingId === String(message._id);
						return (
							<div key={message._id} className={`chat-bubble-row ${mine ? 'mine' : 'theirs'}`}>
								<div
									className={`chat-bubble ${mine ? 'editable' : ''}`}
									onContextMenu={(event) => messageContextMenuHandler(event, message)}
								>
									{isEditing ? (
										<div className={'chat-bubble-edit'}>
											<input
												autoFocus
												type={'text'}
												value={editValue}
												maxLength={500}
												onChange={(e) => setEditValue(e.target.value)}
												onKeyDown={(event) => {
													if (event.key === 'Enter') saveEditHandler(String(message._id));
													if (event.key === 'Escape') cancelEditHandler();
												}}
											/>
											<div className={'chat-bubble-edit-actions'}>
												<button type={'button'} onClick={cancelEditHandler}>
													Cancel
												</button>
												<button type={'button'} onClick={() => saveEditHandler(String(message._id))}>
													Save
												</button>
											</div>
										</div>
									) : (
										<>
											<p>{message.notificationDesc}</p>
											<span>{moment(message.createdAt).format('MMM D, HH:mm')}</span>
										</>
									)}
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

			<Menu
				open={Boolean(menuAnchor)}
				onClose={closeContextMenuHandler}
				anchorReference={'anchorPosition'}
				anchorPosition={menuAnchor ? { top: menuAnchor.y, left: menuAnchor.x } : undefined}
				className={'chat-message-menu'}
			>
				<MenuItem onClick={startEditHandler}>
					<EditRoundedIcon fontSize={'small'} />
					<span>Edit</span>
				</MenuItem>
				<MenuItem onClick={deleteMessageHandler}>
					<DeleteOutlineRoundedIcon fontSize={'small'} />
					<span>Delete</span>
				</MenuItem>
			</Menu>
		</>
	);
};

export default ChatModal;

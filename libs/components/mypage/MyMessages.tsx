import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import moment from 'moment';
import axios from 'axios';
import { Avatar, Menu, MenuItem } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { socketVar, userVar } from '../../../apollo/store';
import { GET_CONVERSATION, GET_MY_CONVERSATIONS } from '../../../apollo/user/query';
import { READ_CONVERSATION, SEND_MESSAGE, UPDATE_MESSAGE } from '../../../apollo/user/mutation';
import { ConversationSummary, Notification } from '../../types/notification/notification';
import { NotificationStatus, NotificationType } from '../../enums/notification.enum';
import { Member } from '../../types/member/member';
import { REACT_APP_API_URL } from '../../config';
import { getJwtToken } from '../../auth';
import { sweetConfirmAlert, sweetMixinErrorAlert } from '../../sweetAlert';

const CONVERSATION_LIMIT = 60;
// Mirrors the backend's global graphqlUploadExpress({ maxFileSize: 15000000 }) in main.ts —
// checking client-side first gives an instant error instead of a failed upload.
const MAX_ATTACHMENT_BYTES = 15_000_000;

const formatFileSize = (bytes?: number) => {
	if (!bytes) return '';
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isImageFile = (name?: string) => !!name && /\.(png|jpe?g|webp|gif)$/i.test(name);

const MyMessages = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const socket = useReactiveVar(socketVar);

	const [conversations, setConversations] = useState<ConversationSummary[]>([]);
	const [activePeer, setActivePeer] = useState<Member | null>(null);
	const [messages, setMessages] = useState<Notification[]>([]);
	const [draft, setDraft] = useState<string>('');
	const [pendingFile, setPendingFile] = useState<File | null>(null);
	const [sending, setSending] = useState<boolean>(false);
	const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number; message: Notification } | null>(null);
	const [editingId, setEditingId] = useState<string>('');
	const [editValue, setEditValue] = useState<string>('');
	const feedRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const preselectedPeerId = typeof router.query.peer === 'string' ? router.query.peer : '';

	const { data: conversationsData, refetch: refetchConversations } = useQuery(GET_MY_CONVERSATIONS, {
		fetchPolicy: 'cache-and-network',
		skip: !user?._id,
	});

	const { data: conversationData, refetch: refetchConversation } = useQuery(GET_CONVERSATION, {
		fetchPolicy: 'network-only',
		variables: { input: { peerId: activePeer?._id, page: 1, limit: CONVERSATION_LIMIT } },
		skip: !activePeer?._id || !user?._id,
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
		setConversations(conversationsData?.getMyConversations?.list ?? []);
	}, [conversationsData]);

	// Preselect the peer from ?peer=<id> if present, otherwise the top conversation
	useEffect(() => {
		if (activePeer || conversations.length === 0) return;
		const match = preselectedPeerId
			? conversations.find((ele) => String(ele.peerId) === preselectedPeerId)
			: conversations[0];
		if (match?.peerData) setActivePeer(match.peerData);
	}, [conversations, activePeer, preselectedPeerId]);

	useEffect(() => {
		if (conversationData?.getConversation) {
			setMessages(conversationData.getConversation.list ?? []);
			scrollToBottom();
		}
	}, [conversationData, scrollToBottom]);

	// Opening a thread consumes its unread messages
	useEffect(() => {
		if (!activePeer?._id || !user?._id) return;
		readConversation({ variables: { peerId: activePeer._id } })
			.then(() => refetchConversations().catch(() => {}))
			.catch(() => {});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activePeer?._id]);

	// Live incoming messages over the shared notification socket
	useEffect(() => {
		if (!socket) return;
		const handler = (msg: MessageEvent) => {
			try {
				const parsed = JSON.parse(msg.data);
				if (parsed.event !== 'notification' || !parsed.data) return;
				const incoming: Notification = parsed.data;
				if (incoming.notificationType !== NotificationType.MESSAGE) return;

				if (activePeer?._id && String(incoming.authorId) === String(activePeer._id)) {
					setMessages((prev) => [...prev, incoming]);
					scrollToBottom();
					readConversation({ variables: { peerId: activePeer._id } }).catch(() => {});
				}
				refetchConversations().catch(() => {});
			} catch (err) {
				/** non-JSON socket frames are chat traffic — ignore **/
			}
		};
		socket.addEventListener('message', handler);
		return () => socket.removeEventListener('message', handler);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [socket, activePeer?._id, scrollToBottom]);

	/** HANDLERS **/
	const selectConversationHandler = (conversation: ConversationSummary) => {
		if (!conversation.peerData) return;
		setActivePeer(conversation.peerData);
	};

	const goToProfileHandler = async (event: React.MouseEvent, peerId?: string) => {
		event.stopPropagation();
		if (!peerId) return;
		if (String(peerId) === String(user?._id)) await router.push('/mypage');
		else await router.push(`/member?memberId=${peerId}`);
	};

	const pickFileHandler = () => fileInputRef.current?.click();

	const fileSelectedHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = '';
		if (!file) return;
		if (file.size > MAX_ATTACHMENT_BYTES) {
			sweetMixinErrorAlert('This file is larger than 15MB. Please choose a smaller file.');
			return;
		}
		setPendingFile(file);
	};

	const clearPendingFile = () => setPendingFile(null);

	const uploadPendingFile = async (): Promise<{ url: string; name: string; size: number } | null> => {
		if (!pendingFile) return null;
		const token = getJwtToken();
		const formData = new FormData();
		formData.append(
			'operations',
			JSON.stringify({
				query: `mutation FileUploader($file: Upload!) { fileUploader(file: $file) }`,
				variables: { file: null },
			}),
		);
		formData.append('map', JSON.stringify({ '0': ['variables.file'] }));
		formData.append('0', pendingFile);

		const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
				'apollo-require-preflight': true,
				Authorization: `Bearer ${token}`,
			},
		});

		if (response.data?.errors?.length) throw new Error(response.data.errors[0]?.message ?? 'Upload failed');
		return { url: response.data.data.fileUploader, name: pendingFile.name, size: pendingFile.size };
	};

	const sendHandler = async () => {
		const text = draft.trim();
		if ((!text && !pendingFile) || sending || !activePeer?._id) return;
		try {
			setSending(true);
			const attachment = pendingFile ? await uploadPendingFile() : null;

			const result = await sendMessage({
				variables: {
					input: {
						receiverId: activePeer._id,
						notificationDesc: text || undefined,
						attachmentUrl: attachment?.url,
						attachmentName: attachment?.name,
						attachmentSize: attachment?.size,
					},
				},
			});
			const sent: Notification | undefined = result?.data?.sendMessage;
			if (sent) setMessages((prev) => [...prev, sent]);
			setDraft('');
			setPendingFile(null);
			scrollToBottom();
			refetchConversations().catch(() => {});
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message ?? 'Could not send message');
		} finally {
			setSending(false);
		}
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
				prev.map((message) =>
					message._id === messageId ? { ...message, notificationDesc: updated?.notificationDesc ?? text } : message,
				),
			);
			cancelEditHandler();
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	};

	const deleteMessageHandler = async () => {
		const target = menuAnchor?.message;
		closeContextMenuHandler();
		if (!target || !activePeer?._id) return;
		if (!(await sweetConfirmAlert('Delete this message?'))) return;
		try {
			await updateMessage({ variables: { input: { _id: target._id, notificationStatus: NotificationStatus.DELETE } } });
			setMessages((prev) => prev.filter((message) => message._id !== target._id));
			await refetchConversation({ input: { peerId: activePeer._id, page: 1, limit: CONVERSATION_LIMIT } });
			refetchConversations().catch(() => {});
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	};

	const peerImageOf = (member?: Member | null) =>
		member?.memberImage ? `${REACT_APP_API_URL}/${member.memberImage}` : '/img/profile/defaultUser.svg';
	const peerNameOf = (member?: Member | null) => member?.memberFullName || member?.memberNick || 'Santa member';

	return (
		<div className={'my-messages'}>
			<aside className={'conversation-list'}>
				<div className={'list-head'}>
					<strong>Messages</strong>
				</div>
				<div className={'list-body'}>
					{conversations.length === 0 && (
						<div className={'list-empty'}>
							<ForumOutlinedIcon />
							<span>No conversations yet</span>
						</div>
					)}
					{conversations.map((conversation) => {
						const peer = conversation.peerData;
						const last = conversation.lastMessage;
						const mine = String(last?.authorId) === String(user?._id);
						const preview =
							last?.attachmentUrl && !last?.notificationDesc ? `📎 ${last.attachmentName || 'Attachment'}` : last?.notificationDesc;
						const active = String(activePeer?._id) === String(conversation.peerId);
						return (
							<div
								key={String(conversation.peerId)}
								className={`conversation-row ${active ? 'active' : ''} ${conversation.unreadCount ? 'unread' : ''}`}
							>
								<button
									type={'button'}
									className={'row-avatar-btn'}
									aria-label={`View ${peerNameOf(peer)}'s profile`}
									onClick={(event) => goToProfileHandler(event, peer?._id as string | undefined)}
								>
									<Avatar src={peerImageOf(peer)} alt={peerNameOf(peer)} />
								</button>
								<button type={'button'} className={'row-main'} onClick={() => selectConversationHandler(conversation)}>
									<div className={'row-body'}>
										<p>
											<b>{peerNameOf(peer)}</b>
										</p>
										<span className={'desc'}>
											{mine ? 'You: ' : ''}
											{preview}
										</span>
										<span className={'time'}>{moment(last?.createdAt).fromNow()}</span>
									</div>
									{conversation.unreadCount > 0 && <em className={'unread-count'}>{conversation.unreadCount}</em>}
								</button>
							</div>
						);
					})}
				</div>
			</aside>

			<section className={'thread-panel'}>
				{!activePeer ? (
					<div className={'thread-empty'}>
						<ForumOutlinedIcon />
						<span>Choose a conversation to start reading</span>
					</div>
				) : (
					<>
						<div className={'thread-head'} onClick={(event) => goToProfileHandler(event, activePeer._id)} role={'button'} tabIndex={0}>
							<Avatar src={peerImageOf(activePeer)} alt={peerNameOf(activePeer)} />
							<div className={'peer-copy'}>
								<strong>{peerNameOf(activePeer)}</strong>
								<span>{activePeer.memberType === 'AGENT' ? 'Certified dealer' : 'Santa member'}</span>
							</div>
						</div>

						<div className={'thread-feed'} ref={feedRef}>
							{messages.length === 0 && (
								<div className={'thread-feed-empty'}>
									<span>No messages yet — say hello!</span>
								</div>
							)}
							{messages.map((message) => {
								const mine = String(message.authorId) === String(user?._id);
								const isEditing = editingId === String(message._id);
								const image = isImageFile(message.attachmentName);
								return (
									<div key={message._id} className={`thread-bubble-row ${mine ? 'mine' : 'theirs'}`}>
										<div
											className={`thread-bubble ${mine ? 'editable' : ''}`}
											onContextMenu={(event) => messageContextMenuHandler(event, message)}
										>
											{isEditing ? (
												<div className={'thread-bubble-edit'}>
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
													<div className={'thread-bubble-edit-actions'}>
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
													{message.attachmentUrl &&
														(image ? (
															<a
																href={`${REACT_APP_API_URL}/${message.attachmentUrl}`}
																target={'_blank'}
																rel={'noreferrer'}
																className={'bubble-attachment image'}
															>
																<img src={`${REACT_APP_API_URL}/${message.attachmentUrl}`} alt={message.attachmentName || 'Attachment'} />
															</a>
														) : (
															<a
																href={`${REACT_APP_API_URL}/${message.attachmentUrl}`}
																target={'_blank'}
																rel={'noreferrer'}
																className={'bubble-attachment file'}
															>
																<InsertDriveFileOutlinedIcon />
																<span className={'file-name'}>{message.attachmentName || 'Attachment'}</span>
																<span className={'file-size'}>{formatFileSize(message.attachmentSize)}</span>
																<FileDownloadOutlinedIcon className={'download-icon'} />
															</a>
														))}
													{message.notificationDesc && <p>{message.notificationDesc}</p>}
													<span className={'bubble-time'}>{moment(message.createdAt).format('MMM D, HH:mm')}</span>
												</>
											)}
										</div>
									</div>
								);
							})}
						</div>

						<div className={'thread-compose'}>
							{pendingFile && (
								<div className={'compose-attachment-chip'}>
									<InsertDriveFileOutlinedIcon />
									<span>{pendingFile.name}</span>
									<button type={'button'} aria-label={'Remove attachment'} onClick={clearPendingFile}>
										<CloseRoundedIcon fontSize={'small'} />
									</button>
								</div>
							)}
							<div className={'compose-row'}>
								<input ref={fileInputRef} type={'file'} hidden onChange={fileSelectedHandler} />
								<button type={'button'} className={'attach-button'} aria-label={'Attach file'} onClick={pickFileHandler}>
									<AttachFileRoundedIcon />
								</button>
								<input
									type={'text'}
									placeholder={`Message ${peerNameOf(activePeer)}`}
									value={draft}
									maxLength={500}
									onChange={(e) => setDraft(e.target.value)}
									onKeyDown={(event) => {
										if (event.key === 'Enter') sendHandler();
									}}
								/>
								<button
									type={'button'}
									className={'send-button'}
									aria-label={'Send message'}
									disabled={(!draft.trim() && !pendingFile) || sending}
									onClick={sendHandler}
								>
									<SendRoundedIcon />
								</button>
							</div>
						</div>
					</>
				)}
			</section>

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
		</div>
	);
};

export default MyMessages;

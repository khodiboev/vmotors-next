import { NotificationGroup, NotificationStatus, NotificationType } from '../../enums/notification.enum';
import { Member } from '../member/member';
import { TotalCounter } from '../property/property';

export interface Notification {
	_id: string;
	notificationType: NotificationType;
	notificationStatus: NotificationStatus;
	notificationGroup: NotificationGroup;
	notificationTitle: string;
	notificationDesc?: string;
	authorId: string;
	receiverId: string;
	vehicleId?: string;
	articleId?: string;
	createdAt: Date;
	updatedAt: Date;
	authorData?: Member;
}

export interface Notifications {
	list: Notification[];
	metaCounter: TotalCounter[];
}

export interface MessageInput {
	receiverId: string;
	notificationDesc: string;
	vehicleId?: string;
}

export interface NotificationsInquiry {
	page: number;
	limit: number;
	notificationStatus?: NotificationStatus;
}

export interface ConversationSummary {
	peerId: string;
	unreadCount: number;
	peerData?: Member;
	lastMessage: Notification;
}

export interface Conversations {
	list: ConversationSummary[];
}

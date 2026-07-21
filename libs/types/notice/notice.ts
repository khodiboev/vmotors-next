import { NoticeCategory, NoticeStatus } from '../../enums/notice.enum';
import { Member } from '../member/member';
import { TotalCounter } from '../vehicle/vehicle';
import { Direction } from '../../enums/common.enum';

export interface Notice {
	_id: string;
	noticeCategory: NoticeCategory;
	noticeSubCategory?: string;
	noticeStatus: NoticeStatus;
	noticeTitle: string;
	noticeContent: string;
	memberId: string;
	createdAt: Date;
	updatedAt: Date;
	memberData?: Member;
}

export interface Notices {
	list: Notice[];
	metaCounter: TotalCounter[];
}

export interface NoticeInput {
	noticeCategory: NoticeCategory;
	noticeSubCategory?: string;
	noticeTitle: string;
	noticeContent: string;
	noticeStatus?: NoticeStatus;
}

export interface NoticeUpdate {
	_id: string;
	noticeCategory?: NoticeCategory;
	noticeSubCategory?: string;
	noticeStatus?: NoticeStatus;
	noticeTitle?: string;
	noticeContent?: string;
}

export interface NoticesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: {
		noticeCategory?: NoticeCategory;
		noticeSubCategory?: string;
		noticeStatus?: NoticeStatus;
		text?: string;
	};
}

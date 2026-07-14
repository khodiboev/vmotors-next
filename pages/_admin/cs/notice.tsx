import React from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import NoticeBoard from '../../../libs/components/admin/cs/NoticeBoard';
import { NoticeCategory } from '../../../libs/enums/notice.enum';

const AdminNotice: NextPage = () => {
	return (
		<NoticeBoard
			category={NoticeCategory.NOTICE}
			title={'Notice Management'}
			subtitle={'Announcements shown on the CS page — only Active entries are visible to members.'}
			itemLabel={'notice'}
		/>
	);
};

export default withAdminLayout(AdminNotice);

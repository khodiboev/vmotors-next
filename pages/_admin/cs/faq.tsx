import React from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import NoticeBoard from '../../../libs/components/admin/cs/NoticeBoard';
import { NoticeCategory } from '../../../libs/enums/notice.enum';

const FaqArticles: NextPage = () => {
	return (
		<NoticeBoard
			category={NoticeCategory.FAQ}
			title={'FAQ Management'}
			subtitle={'Questions and answers shown on the CS page — only Active entries are visible to members.'}
			itemLabel={'FAQ entry'}
		/>
	);
};

export default withAdminLayout(FaqArticles);

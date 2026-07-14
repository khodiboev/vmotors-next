import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const UPDATE_MEMBER_BY_ADMIN = gql`
	mutation UpdateMemberByAdmin($input: MemberUpdate!) {
		updateMemberByAdmin(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberVehicles
			memberRank
			memberArticles
			memberPoints
			memberLikes
			memberViews
			memberWarnings
			memberBlocks
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

/**************************
 *        VEHICLE         *
 *************************/

export const UPDATE_VEHICLE_BY_ADMIN = gql`
	mutation UpdateVehicleByAdmin($input: VehicleUpdate!) {
		updateVehicleByAdmin(input: $input) {
			_id
			vehicleBrand
			vehicleModel
			vehicleTrim
			vehicleYear
			vehicleFuel
			vehicleTransmission
			vehicleColor
			vehiclePrice
			vehicleLocation
			vehicleStockQuantity
			vehicleImages
			vehicleDesc
			vehicleStatus
			vehicleViews
			vehicleLikes
			vehicleComments
			vehicleRank
			memberId
			soldAt
			deletedAt
			createdAt
			updatedAt
		}
	}
`;

export const REMOVE_VEHICLE_BY_ADMIN = gql`
	mutation RemoveVehicleByAdmin($input: String!) {
		removeVehicleByAdmin(vehicleId: $input) {
			_id
			vehicleBrand
			vehicleModel
			vehicleTrim
			vehicleYear
			vehicleFuel
			vehicleTransmission
			vehicleColor
			vehiclePrice
			vehicleLocation
			vehicleStockQuantity
			vehicleImages
			vehicleDesc
			vehicleStatus
			vehicleViews
			vehicleLikes
			vehicleComments
			vehicleRank
			memberId
			soldAt
			deletedAt
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const UPDATE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation UpdateBoardArticleByAdmin($input: BoardArticleUpdate!) {
		updateBoardArticleByAdmin(input: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const REMOVE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation RemoveBoardArticleByAdmin($input: String!) {
		removeBoardArticleByAdmin(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const REMOVE_COMMENT_BY_ADMIN = gql`
	mutation RemoveCommentByAdmin($input: String!) {
		removeCommentByAdmin(commentId: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         NOTICE         *
 *************************/

export const CREATE_NOTICE_BY_ADMIN = gql`
	mutation CreateNoticeByAdmin($input: NoticeInput!) {
		createNoticeByAdmin(input: $input) {
			_id
			noticeCategory
			noticeSubCategory
			noticeStatus
			noticeTitle
			noticeContent
			createdAt
		}
	}
`;

export const UPDATE_NOTICE_BY_ADMIN = gql`
	mutation UpdateNoticeByAdmin($input: NoticeUpdate!) {
		updateNoticeByAdmin(input: $input) {
			_id
			noticeCategory
			noticeSubCategory
			noticeStatus
			noticeTitle
			noticeContent
			updatedAt
		}
	}
`;

export const REMOVE_NOTICE_BY_ADMIN = gql`
	mutation RemoveNoticeByAdmin($noticeId: String!) {
		removeNoticeByAdmin(noticeId: $noticeId) {
			_id
		}
	}
`;

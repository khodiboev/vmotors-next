import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const SIGN_UP = gql`
	mutation Signup($input: MemberInput!) {
		signup(input: $input) {
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
			memberWarnings
			memberBlocks
			memberVehicles
			memberRank
			memberArticles
			memberPoints
			memberLikes
			memberViews
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const LOGIN = gql`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
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
			memberWarnings
			memberBlocks
			memberVehicles
			memberRank
			memberPoints
			memberLikes
			memberViews
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

export const UPDATE_MEMBER = gql`
	mutation UpdateMember($input: MemberUpdate!) {
		updateMember(input: $input) {
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

export const LIKE_TARGET_MEMBER = gql`
	mutation LikeTargetMember($input: String!) {
		likeTargetMember(memberId: $input) {
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
			memberWarnings
			memberBlocks
			memberVehicles
			memberRank
			memberPoints
			memberLikes
			memberViews
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

export const CREATE_VEHICLE = gql`
	mutation CreateVehicle($input: VehicleInput!) {
		createVehicle(input: $input) {
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
			vehicleBodyType
			vehicleMileage
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

export const UPDATE_VEHICLE = gql`
	mutation UpdateVehicle($input: VehicleUpdate!) {
		updateVehicle(input: $input) {
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
			vehicleBodyType
			vehicleMileage
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

export const LIKE_TARGET_VEHICLE = gql`
	mutation LikeTargetVehicle($input: String!) {
		likeTargetVehicle(vehicleId: $input) {
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

export const CREATE_BOARD_ARTICLE = gql`
	mutation CreateBoardArticle($input: BoardArticleInput!) {
		createBoardArticle(input: $input) {
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

export const UPDATE_BOARD_ARTICLE = gql`
	mutation UpdateBoardArticle($input: BoardArticleUpdate!) {
		updateBoardArticle(input: $input) {
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

export const LIKE_TARGET_BOARD_ARTICLE = gql`
	mutation LikeTargetBoardArticle($input: String!) {
		likeTargetBoardArticle(articleId: $input) {
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

export const CREATE_COMMENT = gql`
	mutation CreateComment($input: CommentInput!) {
		createComment(input: $input) {
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

export const UPDATE_COMMENT = gql`
	mutation UpdateComment($input: CommentUpdate!) {
		updateComment(input: $input) {
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
 *         FOLLOW        *
 *************************/

export const SUBSCRIBE = gql`
	mutation Subscribe($input: String!) {
		subscribe(input: $input) {
			_id
			followingId
			followerId
			createdAt
			updatedAt
		}
	}
`;

export const UNSUBSCRIBE = gql`
	mutation Unsubscribe($input: String!) {
		unsubscribe(input: $input) {
			_id
			followingId
			followerId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *      NOTIFICATION      *
 *************************/

export const SEND_MESSAGE = gql`
	mutation SendMessage($input: MessageInput!) {
		sendMessage(input: $input) {
			_id
			notificationType
			notificationStatus
			notificationGroup
			notificationTitle
			notificationDesc
			authorId
			receiverId
			vehicleId
			createdAt
		}
	}
`;

export const UPDATE_MESSAGE = gql`
	mutation UpdateMessage($input: NotificationUpdate!) {
		updateMessage(input: $input) {
			_id
			notificationStatus
			notificationDesc
		}
	}
`;

export const READ_NOTIFICATION = gql`
	mutation ReadNotification($notificationId: String!) {
		readNotification(notificationId: $notificationId) {
			_id
			notificationStatus
		}
	}
`;

export const READ_ALL_NOTIFICATIONS = gql`
	mutation ReadAllNotifications {
		readAllNotifications
	}
`;

export const READ_CONVERSATION = gql`
	mutation ReadConversation($peerId: String!) {
		readConversation(peerId: $peerId)
	}
`;

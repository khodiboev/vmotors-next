import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const GET_AGENTS = gql`
	query GetAgents($input: AgentsInquiry!) {
		getAgents(input: $input) {
			list {
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
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER = gql(`
 query GetMember($input: String!) {
    getMember(memberId: $input) {
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
        memberArticles
        memberPoints
        memberLikes
        memberViews
        memberFollowings
				memberFollowers
        memberRank
        memberWarnings
        memberBlocks
        deletedAt
        createdAt
        updatedAt
        accessToken
        meFollowed {
					followingId
					followerId
					myFollowing
				}
    }
}
`);

/**************************
 *        VEHICLE         *
 *************************/

export const GET_VEHICLE = gql`
	query GetVehicle($input: String!) {
		getVehicle(vehicleId: $input) {
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
			memberData {
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
				memberComments
				memberFollowings
				memberFollowers
				deletedAt
				createdAt
				updatedAt
				accessToken
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_VEHICLES = gql`
	query GetVehicles($input: VehiclesInquiry!) {
		getVehicles(input: $input) {
			list {
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
				memberData {
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
				memberComments
				memberFollowings
				memberFollowers
				deletedAt
				createdAt
				updatedAt
				accessToken
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_DEALER_VEHICLES = gql`
	query GetDealerVehicles($input: DealerVehiclesInquiry!) {
		getDealerVehicles(input: $input) {
			list {
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
			metaCounter {
				total
			}
		}
	}
`;

export const GET_FAVORITES = gql`
	query GetFavorites($input: OrdinaryInquiry!) {
		getFavorites(input: $input) {
			list {
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
				memberData {
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
				memberComments
				memberFollowings
				memberFollowers
				deletedAt
				createdAt
				updatedAt
				accessToken
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_VISITED = gql`
	query GetVisited($input: OrdinaryInquiry!) {
		getVisited(input: $input) {
			list {
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
				memberData {
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
				memberComments
				memberFollowings
				memberFollowers
				deletedAt
				createdAt
				updatedAt
				accessToken
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const GET_BOARD_ARTICLE = gql`
	query GetBoardArticle($input: String!) {
		getBoardArticle(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			articleComments
			memberId
			createdAt
			updatedAt
			memberData {
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
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_BOARD_ARTICLES = gql`
	query GetBoardArticles($input: BoardArticlesInquiry!) {
		getBoardArticles(input: $input) {
			list {
				_id
				articleCategory
				articleStatus
				articleTitle
				articleContent
				articleImage
				articleViews
				articleLikes
				articleComments
				memberId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				memberData {
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
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const GET_COMMENTS = gql`
	query GetComments($input: CommentsInquiry!) {
		getComments(input: $input) {
			list {
				_id
				commentStatus
				commentGroup
				commentContent
				commentRefId
				memberId
				createdAt
				updatedAt
				memberData {
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
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         FOLLOW        *
 *************************/
export const GET_MEMBER_FOLLOWERS = gql`
	query GetMemberFollowers($input: FollowInquiry!) {
		getMemberFollowers(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
				followerData {
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
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER_FOLLOWINGS = gql`
	query GetMemberFollowings($input: FollowInquiry!) {
		getMemberFollowings(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				updatedAt
				followingData {
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
					memberArticles
					memberPoints
					memberLikes
					memberViews
					memberComments
					memberFollowings
					memberFollowers
					memberRank
					memberWarnings
					memberBlocks
					deletedAt
					createdAt
					updatedAt
					accessToken
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *      NOTIFICATION      *
 *************************/

export const GET_MY_NOTIFICATIONS = gql`
	query GetMyNotifications($input: NotificationsInquiry!) {
		getMyNotifications(input: $input) {
			list {
				_id
				notificationType
				notificationStatus
				notificationGroup
				notificationTitle
				notificationDesc
				authorId
				receiverId
				vehicleId
				articleId
				createdAt
				updatedAt
				authorData {
					_id
					memberNick
					memberFullName
					memberImage
					memberType
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MY_CONVERSATIONS = gql`
	query GetMyConversations {
		getMyConversations {
			list {
				peerId
				unreadCount
				peerData {
					_id
					memberNick
					memberFullName
					memberImage
					memberType
				}
				lastMessage {
					_id
					notificationDesc
					authorId
					receiverId
					notificationStatus
					createdAt
				}
			}
		}
	}
`;

export const GET_CONVERSATION = gql`
	query GetConversation($input: ConversationInquiry!) {
		getConversation(input: $input) {
			list {
				_id
				notificationDesc
				authorId
				receiverId
				notificationStatus
				vehicleId
				createdAt
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         NOTICE         *
 *************************/

export const GET_NOTICES = gql`
	query GetNotices($input: NoticesInquiry!) {
		getNotices(input: $input) {
			list {
				_id
				noticeCategory
				noticeSubCategory
				noticeStatus
				noticeTitle
				noticeContent
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

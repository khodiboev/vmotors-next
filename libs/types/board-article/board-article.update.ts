import { BoardArticleCategory, BoardArticleStatus } from '../../enums/board-article.enum';

export interface BoardArticleUpdate {
	_id: string;
	articleStatus?: BoardArticleStatus;
	articleCategory?: BoardArticleCategory;
	articleTitle?: string;
	articleContent?: string;
	articleImage?: string;
}

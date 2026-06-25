import React, { useEffect, useRef, useState } from 'react';
import {
	Box,
	Button,
	CircularProgress,
	FormControl,
	MenuItem,
	Select,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { Editor } from '@toast-ui/react-editor';
import { getJwtToken } from '../../auth';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import axios from 'axios';
import { T } from '../../types/common';
import { useLazyQuery, useMutation } from '@apollo/client';
import { CREATE_BOARD_ARTICLE, UPDATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { Message } from '../../enums/common.enum';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../sweetAlert';
import '@toast-ui/editor/dist/toastui-editor.css';
import { GET_BOARD_ARTICLE } from '../../../apollo/user/query';
import { BoardArticle } from '../../types/board-article/board-article';

const TITLE_MIN_LENGTH = 5;
const TITLE_MAX_LENGTH = 100;
const CONTENT_MIN_LENGTH = 1;
const CONTENT_MAX_LENGTH = 1000;
const MAX_IMAGE_SIZE_BYTES = 15_000_000;
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
const ALLOWED_IMAGE_ACCEPT = 'image/jpg,image/jpeg,image/png,image/webp';
const EDIT_DRAFT_STORAGE_KEY = 'santa-community-edit-draft';
const UPLOAD_FAILED_MESSAGE = 'Upload failed!';

const getEditorContentMeta = (value = '') => {
	const plainText = value
		.replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/gi, ' ')
		.replace(/[`*_>#~|-]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

	return { plainText, length: plainText.length };
};

const hasMeaningfulEditorContent = (value = '') => getEditorContentMeta(value).length > 0;

const getUploadErrorMessage = (response: any) => {
	const errors = response?.data?.errors;
	if (Array.isArray(errors) && errors.length > 0) {
		return (
			errors
				.map((item: any) => item?.message)
				.find(Boolean) || UPLOAD_FAILED_MESSAGE
		);
	}

	return '';
};

const normalizeStoredImagePath = (value = '') => {
	if (!value) return '';
	if (value.startsWith(`${REACT_APP_API_URL}/`)) {
		return value.replace(`${REACT_APP_API_URL}/`, '');
	}
	if (value.startsWith('/uploads/')) return value.slice(1);
	return value;
};

const extractFirstEmbeddedImagePath = (value = '') => {
	const markdownMatch = value.match(/!\[[^\]]*]\(([^)]+)\)/);
	const htmlMatch = value.match(/<img[^>]+src=["']([^"']+)["']/i);
	const source = markdownMatch?.[1] ?? htmlMatch?.[1] ?? '';

	if (!source) return '';
	if (source.startsWith(`${REACT_APP_API_URL}/`)) {
		return source.replace(`${REACT_APP_API_URL}/`, '');
	}
	if (source.startsWith('/uploads/')) return source.slice(1);
	if (source.startsWith('uploads/')) return source;
	return '';
};

const getPreferredArticleImagePath = (content = '', fallback = '') =>
	extractFirstEmbeddedImagePath(content) || normalizeStoredImagePath(fallback);

const getStoredDraft = (articleId: string) => {
	if (typeof window === 'undefined' || !articleId) return null;

	try {
		const raw = window.sessionStorage.getItem(EDIT_DRAFT_STORAGE_KEY);
		if (!raw) return null;

		const article = JSON.parse(raw) as BoardArticle;
		return article?._id === articleId ? article : null;
	} catch (error) {
		return null;
	}
};

const clearStoredDraft = () => {
	if (typeof window === 'undefined') return;
	window.sessionStorage.removeItem(EDIT_DRAFT_STORAGE_KEY);
};

const TuiEditor = () => {
	const editorRef = useRef<Editor>(null);
	const editorContainerRef = useRef<HTMLDivElement>(null);
	const token = getJwtToken();
	const router = useRouter();
	const articleId = typeof router.query?.articleId === 'string' ? router.query.articleId : '';
	const isEditing = Boolean(articleId);

	const [articleCategory, setArticleCategory] = useState<BoardArticleCategory>(BoardArticleCategory.FREE);
	const [articleTitle, setArticleTitle] = useState('');
	const [articleImage, setArticleImage] = useState('');
	const [editorInitialValue, setEditorInitialValue] = useState('');
	const [editorRenderKey, setEditorRenderKey] = useState(0);
	const [isArticleLoading, setIsArticleLoading] = useState(false);

	/** APOLLO REQUESTS **/
	const [createBoardArticle] = useMutation(CREATE_BOARD_ARTICLE);
	const [updateBoardArticle] = useMutation(UPDATE_BOARD_ARTICLE);
	const [getBoardArticle] = useLazyQuery(GET_BOARD_ARTICLE, {
		fetchPolicy: 'network-only',
		onCompleted: (data) => {
			const article = data?.getBoardArticle as BoardArticle | undefined;
			if (!article) return;

			setArticleCategory(article.articleCategory);
			setArticleTitle(article.articleTitle ?? '');
			setArticleImage(getPreferredArticleImagePath(article.articleContent, article.articleImage));
			setEditorInitialValue(article.articleContent ?? '');
			setEditorRenderKey((prev) => prev + 1);
			setIsArticleLoading(false);
		},
		onError: async (error) => {
			setIsArticleLoading(false);
			await sweetErrorHandling(error instanceof Error ? error : new Error(Message.NO_DATA_FOUND));
		},
	});

	useEffect(() => {
		const loadEditorState = async () => {
			if (!isEditing) {
				clearStoredDraft();
				setArticleCategory(BoardArticleCategory.FREE);
				setArticleTitle('');
				setArticleImage('');
				setEditorInitialValue('');
				setEditorRenderKey((prev) => prev + 1);
				setIsArticleLoading(false);
				return;
			}

			setIsArticleLoading(true);
			const storedDraft = getStoredDraft(articleId);

			if (storedDraft) {
				setArticleCategory(storedDraft.articleCategory);
				setArticleTitle(storedDraft.articleTitle ?? '');
				setArticleImage(getPreferredArticleImagePath(storedDraft.articleContent, storedDraft.articleImage));
				setEditorInitialValue(storedDraft.articleContent ?? '');
				setEditorRenderKey((prev) => prev + 1);
				setIsArticleLoading(false);
				return;
			}

			await getBoardArticle({ variables: { input: articleId } });
		};

		loadEditorState().then();
	}, [articleId, getBoardArticle, isEditing]);

	useEffect(() => {
		if (isArticleLoading) return;

		const fileInputs = editorContainerRef.current?.querySelectorAll<HTMLInputElement>('input[type="file"]');
		fileInputs?.forEach((input) => {
			input.setAttribute('accept', ALLOWED_IMAGE_ACCEPT);
		});
	}, [editorRenderKey, isArticleLoading]);

	/** HANDLERS **/
	const uploadImage = async (image: File) => {
		try {
			if (!image) throw new Error('Please choose an image to upload.');
			if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
				throw new Error('Please provide jpg, jpeg, png, or webp images!');
			}
			if (image.size > MAX_IMAGE_SIZE_BYTES) {
				throw new Error('Please upload an image smaller than 15 MB.');
			}

			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target)
				  }`,
					variables: {
						file: null,
						target: 'article',
					},
				}),
			);
			formData.append(
				'map',
				JSON.stringify({
					'0': ['variables.file'],
				}),
			);
			formData.append('0', image);

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const graphqlErrorMessage = getUploadErrorMessage(response);
			if (graphqlErrorMessage) throw new Error(graphqlErrorMessage);

			const responseImage = response?.data?.data?.imageUploader;
			if (!responseImage || typeof responseImage !== 'string') {
				throw new Error(UPLOAD_FAILED_MESSAGE);
			}

			setArticleImage(responseImage);
			return `${REACT_APP_API_URL}/${responseImage}`;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const graphqlErrorMessage = getUploadErrorMessage(error.response);
				const responseMessage =
					typeof (error.response?.data as any)?.message === 'string'
						? (error.response?.data as any).message
						: '';
				const axiosMessage =
					graphqlErrorMessage || responseMessage || error.message || UPLOAD_FAILED_MESSAGE;
				throw new Error(axiosMessage);
			}

			throw error instanceof Error ? error : new Error(UPLOAD_FAILED_MESSAGE);
		}
	};

	const changeCategoryHandler = (e: any) => {
		setArticleCategory(e.target.value);
	};

	const articleTitleHandler = (e: T) => {
		setArticleTitle(e.target.value);
	};

	const handleSubmitButton = async () => {
		try {
			const editorInstance = editorRef.current?.getInstance();
			const trimmedTitle = articleTitle.trim();
			const articleContent = editorInstance?.getMarkdown()?.trim() ?? '';
			const { length: meaningfulContentLength } = getEditorContentMeta(articleContent);

			if (!articleCategory || (!trimmedTitle && !hasMeaningfulEditorContent(articleContent))) {
				throw new Error(Message.INSERT_ALL_INPUTS);
			}

			if (trimmedTitle.length < TITLE_MIN_LENGTH || trimmedTitle.length > TITLE_MAX_LENGTH) {
				throw new Error(`Title must be between ${TITLE_MIN_LENGTH} and ${TITLE_MAX_LENGTH} characters.`);
			}

			if (meaningfulContentLength < CONTENT_MIN_LENGTH) {
				throw new Error(`Article content must be at least ${CONTENT_MIN_LENGTH} character.`);
			}

			if (meaningfulContentLength > CONTENT_MAX_LENGTH) {
				throw new Error(`Article content must be ${CONTENT_MAX_LENGTH} characters or fewer.`);
			}

			const resolvedArticleImage = getPreferredArticleImagePath(articleContent, articleImage);
			const input = {
				articleCategory,
				articleTitle: trimmedTitle,
				articleContent,
				...(resolvedArticleImage ? { articleImage: resolvedArticleImage } : {}),
			};

			if (isEditing) {
				await updateBoardArticle({
					variables: {
						input: {
							_id: articleId,
							...input,
						},
					},
				});

				clearStoredDraft();
				await sweetTopSuccessAlert('Article is updated successfully', 700);
			} else {
				await createBoardArticle({
					variables: {
						input,
					},
				});

				await sweetTopSuccessAlert('Article is created successfully', 700);
			}

			await router.push({
				pathname: '/mypage',
				query: {
					category: 'myArticles',
				},
			});
		} catch (err: any) {
			await sweetErrorHandling(err instanceof Error ? err : new Error(Message.SOMETHING_WENT_WRONG));
		}
	};

	return (
		<Stack>
			<Stack direction="row" style={{ margin: '40px' }} justifyContent="space-evenly">
				<Box component={'div'} className={'form_row'} style={{ width: '300px' }}>
					<Typography style={{ color: '#7f838d', margin: '10px' }} variant="h3">
						Category
					</Typography>
					<FormControl sx={{ width: '100%', background: 'white' }}>
						<Select
							value={articleCategory}
							onChange={changeCategoryHandler}
							displayEmpty
							inputProps={{ 'aria-label': 'Without label' }}
						>
							<MenuItem value={BoardArticleCategory.FREE}>
								<span>Free</span>
							</MenuItem>
							<MenuItem value={BoardArticleCategory.HUMOR}>Humor</MenuItem>
							<MenuItem value={BoardArticleCategory.NEWS}>News</MenuItem>
							<MenuItem value={BoardArticleCategory.RECOMMEND}>Recommendation</MenuItem>
						</Select>
					</FormControl>
				</Box>
				<Box component={'div'} style={{ width: '300px', flexDirection: 'column' }}>
					<Typography style={{ color: '#7f838d', margin: '10px' }} variant="h3">
						Title
					</Typography>
					<TextField
						onChange={articleTitleHandler}
						value={articleTitle}
						id="filled-basic"
						label="Type Title"
						style={{ width: '300px', background: 'white' }}
						inputProps={{ maxLength: TITLE_MAX_LENGTH }}
					/>
				</Box>
			</Stack>

			{isArticleLoading ? (
				<Stack alignItems="center" justifyContent="center" sx={{ minHeight: '320px', gap: 2 }}>
					<CircularProgress />
					<Typography>Loading article editor...</Typography>
				</Stack>
			) : (
				<div ref={editorContainerRef}>
					<Editor
						key={`${articleId || 'new'}-${editorRenderKey}`}
						initialValue={editorInitialValue}
						placeholder={'Type here'}
						previewStyle={'vertical'}
						height={'640px'}
						initialEditType={'wysiwyg'}
						toolbarItems={[
							['heading', 'bold', 'italic', 'strike'],
							['image', 'table', 'link'],
							['ul', 'ol', 'task'],
						]}
						ref={editorRef}
						hooks={{
							addImageBlobHook: (image: Blob | File, callback: (url: string, text?: string) => void) => {
								void (async () => {
									try {
										const uploadedImageURL = await uploadImage(image as File);
										callback(uploadedImageURL, (image as File)?.name || 'article-image');
									} catch (error) {
										await sweetErrorHandling(
											error instanceof Error ? error : new Error(UPLOAD_FAILED_MESSAGE),
										);
									}
								})();

								return false;
							},
						}}
					/>
				</div>
			)}

			<Stack direction="row" justifyContent="center">
				<Button
					variant="contained"
					color="primary"
					style={{ margin: '30px', width: '250px', height: '45px' }}
					onClick={handleSubmitButton}
					disabled={isArticleLoading}
				>
					{isEditing ? 'Update' : 'Register'}
				</Button>
			</Stack>
		</Stack>
	);
};

export default TuiEditor;

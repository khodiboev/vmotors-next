import React, { useEffect, useMemo, useState } from 'react';
import {
	Avatar,
	Box,
	Button,
	Dialog,
	Divider,
	Fade,
	IconButton,
	InputAdornment,
	List,
	ListItem,
	Menu,
	MenuItem,
	OutlinedInput,
	Select,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TablePagination,
	Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import moment from 'moment';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_NOTICES_BY_ADMIN } from '../../../../apollo/admin/query';
import {
	CREATE_NOTICE_BY_ADMIN,
	REMOVE_NOTICE_BY_ADMIN,
	UPDATE_NOTICE_BY_ADMIN,
} from '../../../../apollo/admin/mutation';
import { Notice, NoticesInquiry } from '../../../types/notice/notice';
import { NoticeCategory, NoticeStatus } from '../../../enums/notice.enum';
import { FAQ_SECTIONS, REACT_APP_API_URL } from '../../../config';
import { sweetConfirmAlert, sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../sweetAlert';

interface NoticeBoardProps {
	category: NoticeCategory;
	title: string;
	subtitle: string;
	itemLabel: string; // e.g. "FAQ entry" / "notice"
}

const STATUS_TABS = ['ALL', NoticeStatus.ACTIVE, NoticeStatus.HOLD, NoticeStatus.DELETE] as const;

const emptyForm = { _id: '', noticeTitle: '', noticeContent: '', noticeSubCategory: '' };

const sectionLabel = (key?: string) => FAQ_SECTIONS.find((ele) => ele.key === key)?.label ?? key ?? '—';

const NoticeBoard = ({ category, title, subtitle, itemLabel }: NoticeBoardProps) => {
	const [inquiry, setInquiry] = useState<NoticesInquiry>({
		page: 1,
		limit: 10,
		sort: 'createdAt',
		search: { noticeCategory: category },
	});
	const [notices, setNotices] = useState<Notice[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [tab, setTab] = useState<string>('ALL');
	const [searchText, setSearchText] = useState<string>('');
	const [rowMenuAnchor, setRowMenuAnchor] = useState<null | HTMLElement>(null);
	const [rowMenuTarget, setRowMenuTarget] = useState<Notice | null>(null);
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);
	const [form, setForm] = useState(emptyForm);
	const [saving, setSaving] = useState<boolean>(false);

	const [createNoticeByAdmin] = useMutation(CREATE_NOTICE_BY_ADMIN);
	const [updateNoticeByAdmin] = useMutation(UPDATE_NOTICE_BY_ADMIN);
	const [removeNoticeByAdmin] = useMutation(REMOVE_NOTICE_BY_ADMIN);

	const { data: noticesData, refetch: refetchNotices } = useQuery(GET_ALL_NOTICES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
	});

	useEffect(() => {
		if (!noticesData?.getAllNoticesByAdmin) return;
		setNotices(noticesData.getAllNoticesByAdmin.list ?? []);
		setTotal(noticesData.getAllNoticesByAdmin.metaCounter?.[0]?.total ?? 0);
	}, [noticesData]);

	const editing = useMemo(() => Boolean(form._id), [form._id]);
	const isFaq = category === NoticeCategory.FAQ;

	/** HANDLERS **/
	const tabChangeHandler = (newValue: string) => {
		setTab(newValue);
		const search: NoticesInquiry['search'] = { noticeCategory: category };
		if (searchText) search.text = searchText;
		if (newValue !== 'ALL') search.noticeStatus = newValue as NoticeStatus;
		setInquiry({ ...inquiry, page: 1, search });
	};

	const searchHandler = (text: string) => {
		const search: NoticesInquiry['search'] = { noticeCategory: category };
		if (text) search.text = text;
		if (tab !== 'ALL') search.noticeStatus = tab as NoticeStatus;
		setInquiry({ ...inquiry, page: 1, search });
	};

	const openRowMenu = (e: React.MouseEvent<HTMLElement>, notice: Notice) => {
		setRowMenuAnchor(e.currentTarget);
		setRowMenuTarget(notice);
	};

	const closeRowMenu = () => {
		setRowMenuAnchor(null);
		setRowMenuTarget(null);
	};

	const openCreateDialog = () => {
		setForm({ ...emptyForm, noticeSubCategory: isFaq ? FAQ_SECTIONS[0].key : '' });
		setDialogOpen(true);
	};

	const openEditDialog = (notice: Notice) => {
		setForm({
			_id: notice._id,
			noticeTitle: notice.noticeTitle,
			noticeContent: notice.noticeContent,
			noticeSubCategory: notice.noticeSubCategory ?? (isFaq ? FAQ_SECTIONS[0].key : ''),
		});
		closeRowMenu();
		setDialogOpen(true);
	};

	const saveHandler = async () => {
		if (!form.noticeTitle.trim() || !form.noticeContent.trim() || (isFaq && !form.noticeSubCategory) || saving) return;
		try {
			setSaving(true);
			if (editing) {
				await updateNoticeByAdmin({
					variables: {
						input: {
							_id: form._id,
							noticeTitle: form.noticeTitle,
							noticeContent: form.noticeContent,
							...(isFaq ? { noticeSubCategory: form.noticeSubCategory } : {}),
						},
					},
				});
			} else {
				await createNoticeByAdmin({
					variables: {
						input: {
							noticeCategory: category,
							noticeTitle: form.noticeTitle,
							noticeContent: form.noticeContent,
							...(isFaq ? { noticeSubCategory: form.noticeSubCategory } : {}),
						},
					},
				});
			}
			setDialogOpen(false);
			setForm(emptyForm);
			await refetchNotices({ input: inquiry });
			await sweetTopSmallSuccessAlert(editing ? 'Updated!' : 'Created!', 900);
		} catch (err: any) {
			await sweetErrorHandling(err);
		} finally {
			setSaving(false);
		}
	};

	const statusChangeHandler = async (notice: Notice, status: NoticeStatus) => {
		try {
			closeRowMenu();
			await updateNoticeByAdmin({ variables: { input: { _id: notice._id, noticeStatus: status } } });
			await refetchNotices({ input: inquiry });
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const removeHandler = async (notice: Notice) => {
		try {
			closeRowMenu();
			if (!(await sweetConfirmAlert(`Permanently delete this ${itemLabel}?`))) return;
			await removeNoticeByAdmin({ variables: { noticeId: notice._id } });
			await refetchNotices({ input: inquiry });
			await sweetTopSmallSuccessAlert('Deleted!', 900);
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<Box component={'div'} className={'content'}>
			<Box component={'div'} className={'title flex_space'}>
				<Stack>
					<Typography variant={'h2'}>{title}</Typography>
					<Typography className={'admin-page-subtitle'}>{subtitle}</Typography>
				</Stack>
				<Button className="btn_add" variant={'contained'} size={'medium'} onClick={openCreateDialog}>
					<AddRoundedIcon sx={{ mr: '8px' }} />
					New {itemLabel}
				</Button>
			</Box>

			<Box component={'div'} className={'table-wrap'}>
				<List className={'tab-menu'}>
					{STATUS_TABS.map((status) => (
						<ListItem key={status} onClick={() => tabChangeHandler(status)} className={tab === status ? 'li on' : 'li'}>
							{status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
						</ListItem>
					))}
				</List>
				<Divider />
				<Stack className={'search-area'} sx={{ m: '24px' }}>
					<OutlinedInput
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						sx={{ width: '100%' }}
						className={'search'}
						placeholder={`Search ${itemLabel} title or content`}
						onKeyDown={(event) => {
							if (event.key === 'Enter') searchHandler(searchText);
						}}
						endAdornment={
							<>
								{searchText && (
									<CancelRoundedIcon
										style={{ cursor: 'pointer' }}
										onClick={() => {
											setSearchText('');
											searchHandler('');
										}}
									/>
								)}
								<InputAdornment position="end" sx={{ cursor: 'pointer' }} onClick={() => searchHandler(searchText)}>
									<SearchRoundedIcon />
								</InputAdornment>
							</>
						}
					/>
				</Stack>
				<Divider />

				<TableContainer>
					<Table sx={{ minWidth: 750 }} size={'medium'}>
						<TableHead>
							<TableRow>
								<TableCell align="left">TITLE</TableCell>
								{isFaq && <TableCell align="center">SECTION</TableCell>}
								<TableCell align="left">CONTENT</TableCell>
								<TableCell align="center">AUTHOR</TableCell>
								<TableCell align="center">DATE</TableCell>
								<TableCell align="center">STATUS</TableCell>
								<TableCell align="center">ACTIONS</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{notices.length === 0 && (
								<TableRow>
									<TableCell align="center" colSpan={isFaq ? 7 : 6}>
										<span className={'no-data'}>No {itemLabel} found — create the first one!</span>
									</TableCell>
								</TableRow>
							)}
							{notices.map((notice) => (
								<TableRow hover key={notice._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
									<TableCell align="left" sx={{ maxWidth: 260 }}>
										<Typography className={'cell-strong'}>{notice.noticeTitle}</Typography>
									</TableCell>
									{isFaq && (
										<TableCell align="center">
											<span className={'type-chip user'}>{sectionLabel(notice.noticeSubCategory)}</span>
										</TableCell>
									)}
									<TableCell align="left" sx={{ maxWidth: 380 }}>
										<Typography className={'cell-clamp'}>{notice.noticeContent}</Typography>
									</TableCell>
									<TableCell align="center">
										<Stack direction={'row'} alignItems={'center'} justifyContent={'center'} gap={'8px'}>
											<Avatar
												sx={{ width: 28, height: 28 }}
												src={
													notice.memberData?.memberImage
														? `${REACT_APP_API_URL}/${notice.memberData.memberImage}`
														: '/img/profile/defaultUser.svg'
												}
											/>
											<span>{notice.memberData?.memberNick ?? 'Admin'}</span>
										</Stack>
									</TableCell>
									<TableCell align="center">{moment(notice.createdAt).format('YYYY.MM.DD')}</TableCell>
									<TableCell align="center">
										<span className={`status-chip ${notice.noticeStatus.toLowerCase()}`}>{notice.noticeStatus}</span>
									</TableCell>
									<TableCell align="center">
										<IconButton onClick={(e) => openRowMenu(e, notice)}>
											<MoreVertRoundedIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>

				<Menu
					anchorEl={rowMenuAnchor}
					open={Boolean(rowMenuAnchor)}
					onClose={closeRowMenu}
					TransitionComponent={Fade}
					className={'admin-row-menu'}
				>
					<MenuItem onClick={() => rowMenuTarget && openEditDialog(rowMenuTarget)}>
						<EditOutlinedIcon fontSize={'small'} sx={{ mr: '10px' }} /> Edit
					</MenuItem>
					{rowMenuTarget &&
						Object.values(NoticeStatus)
							.filter((status) => status !== rowMenuTarget.noticeStatus)
							.map((status) => (
								<MenuItem key={status} onClick={() => statusChangeHandler(rowMenuTarget, status)}>
									Mark {status.charAt(0) + status.slice(1).toLowerCase()}
								</MenuItem>
							))}
					<Divider />
					<MenuItem className={'danger'} onClick={() => rowMenuTarget && removeHandler(rowMenuTarget)}>
						<DeleteOutlineRoundedIcon fontSize={'small'} sx={{ mr: '10px' }} /> Delete permanently
					</MenuItem>
				</Menu>

				<TablePagination
					rowsPerPageOptions={[10, 20, 40]}
					component="div"
					count={total}
					rowsPerPage={inquiry.limit}
					page={Math.max(0, inquiry.page - 1)}
					onPageChange={(event, newPage) => setInquiry({ ...inquiry, page: newPage + 1 })}
					onRowsPerPageChange={(event) => setInquiry({ ...inquiry, page: 1, limit: parseInt(event.target.value, 10) })}
				/>
			</Box>

			<Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} className={'admin-form-dialog'} fullWidth>
				<div className={'dialog-inner'}>
					<div className={'dialog-head'}>
						<strong>
							{editing ? 'Edit' : 'New'} {itemLabel}
						</strong>
						<IconButton onClick={() => setDialogOpen(false)}>
							<CloseRoundedIcon />
						</IconButton>
					</div>
					{isFaq && (
						<>
							<label>Section</label>
							<Select
								fullWidth
								value={form.noticeSubCategory || FAQ_SECTIONS[0].key}
								onChange={(e) => setForm({ ...form, noticeSubCategory: e.target.value as string })}
							>
								{FAQ_SECTIONS.map((section) => (
									<MenuItem value={section.key} key={section.key}>
										{section.label}
									</MenuItem>
								))}
							</Select>
						</>
					)}
					<label>Title</label>
					<input
						type={'text'}
						value={form.noticeTitle}
						maxLength={200}
						placeholder={`${title} title`}
						onChange={(e) => setForm({ ...form, noticeTitle: e.target.value })}
					/>
					<label>Content</label>
					<textarea
						value={form.noticeContent}
						maxLength={5000}
						placeholder={'Write the content shown to members on the CS page'}
						onChange={(e) => setForm({ ...form, noticeContent: e.target.value })}
					/>
					<div className={'dialog-foot'}>
						<Button onClick={() => setDialogOpen(false)}>Cancel</Button>
						<Button
							variant={'contained'}
							className={'save-btn'}
							disabled={!form.noticeTitle.trim() || !form.noticeContent.trim() || saving}
							onClick={saveHandler}
						>
							{saving ? 'Saving…' : editing ? 'Save changes' : 'Create'}
						</Button>
					</div>
				</div>
			</Dialog>
		</Box>
	);
};

export default NoticeBoard;

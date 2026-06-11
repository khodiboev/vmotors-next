import React, { SyntheticEvent, useMemo, useState } from 'react';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import { AccordionDetails, Box, Stack, Typography } from '@mui/material';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import { styled } from '@mui/material/styles';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(
	({ theme }) => ({
		border: `1px solid ${theme.palette.divider}`,
		'&:not(:last-child)': {
			borderBottom: 0,
		},
		'&:before': {
			display: 'none',
		},
	}),
);

const AccordionSummary = styled((props: AccordionSummaryProps) => (
	<MuiAccordionSummary expandIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: '1.4rem' }} />} {...props} />
))(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : '#fff',
	'& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
		transform: 'rotate(180deg)',
	},
	'& .MuiAccordionSummary-content': {
		marginLeft: theme.spacing(1),
	},
}));

type FaqCategoryKey = 'inventory' | 'payment' | 'buyers' | 'dealers' | 'account' | 'community' | 'other';

const faqCategoryMeta: Record<FaqCategoryKey, { label: string; description: string }> = {
	inventory: {
		label: 'Inventory',
		description: 'Vehicle listing, availability, and pricing guidance.',
	},
	payment: {
		label: 'Payments',
		description: 'Payment flow, processing, and support answers.',
	},
	buyers: {
		label: 'For buyers',
		description: 'Help for shoppers comparing Hyundai and Kia inventory.',
	},
	dealers: {
		label: 'For dealers',
		description: 'Dealer onboarding, listing, and account guidance.',
	},
	account: {
		label: 'Account',
		description: 'Membership, profile, and platform access questions.',
	},
	community: {
		label: 'Community',
		description: 'Posting, reporting, and participation guidance.',
	},
	other: {
		label: 'Other',
		description: 'General VMotors help and policy questions.',
	},
};

const faqData: Record<FaqCategoryKey, Array<{ id: string; subject: string; content: string }>> = {
	inventory: [
		{
			id: 'inventory-01',
			subject: 'Are the vehicles on VMotors verified before they are listed?',
			content: 'Listings are intended to reflect active Hyundai and Kia inventory from registered dealers, but you should still confirm trim, delivery timing, and final pricing with the dealer before purchase.',
		},
		{
			id: 'inventory-02',
			subject: 'What details can I review on a vehicle listing?',
			content: 'You can review model, trim, year, fuel type, transmission, price, stock quantity, dealer context, and the listing description directly on the vehicle detail page.',
		},
		{
			id: 'inventory-03',
			subject: 'Why does a vehicle appear out of stock or reserved?',
			content: 'Dealers can update listing availability as inventory changes. Reserved or low-stock states usually indicate current demand or pending delivery allocation.',
		},
		{
			id: 'inventory-04',
			subject: 'Can I compare multiple Hyundai or Kia models on VMotors?',
			content: 'You can shortlist and browse multiple listings across the marketplace, then review each vehicle detail page to compare trim, fuel, transmission, and pricing context.',
		},
	],
	payment: [
		{
			id: 'payment-01',
			subject: 'Does VMotors process vehicle payments directly?',
			content: 'Final vehicle payment handling depends on the dealer process. VMotors helps you discover inventory and connect with trusted dealers, but you should confirm payment steps with the listing dealer.',
		},
		{
			id: 'payment-02',
			subject: 'What if I have a payment-related question before committing?',
			content: 'Review the listing details first, then contact the dealer to confirm deposits, processing timelines, or any documentation required for your purchase.',
		},
		{
			id: 'payment-03',
			subject: 'How quickly should payment confirmations be clarified?',
			content: 'Questions about payment timing should be clarified before you commit to delivery or reservation. If something feels unclear, pause and ask the dealer for written confirmation.',
		},
	],
	buyers: [
		{
			id: 'buyers-01',
			subject: 'What should buyers check first on a listing?',
			content: 'Start with model, trim, year, fuel type, transmission, location, and stock. Then review dealer details and the listing description before deciding to reach out.',
		},
		{
			id: 'buyers-02',
			subject: 'How can I tell if a listing matches my needs?',
			content: 'Use the vehicle filters to narrow by brand, fuel, and transmission, then compare detail pages to check practicality, pricing, and location fit for your situation.',
		},
		{
			id: 'buyers-03',
			subject: 'What should I ask the dealer before moving forward?',
			content: 'Ask about exact trim availability, delivery timing, final pricing, stock status, and any dealership-specific steps you need to complete to proceed.',
		},
		{
			id: 'buyers-04',
			subject: 'What if I am buying my first Hyundai or Kia through VMotors?',
			content: 'Take time to compare a few listings, review the FAQ, and use dealer profile pages to understand who you are speaking with before making a decision.',
		},
	],
	dealers: [
		{
			id: 'dealers-01',
			subject: 'How do dealers participate on VMotors?',
			content: 'Dealers use registered agent accounts to manage inventory visibility on the platform and present live Hyundai and Kia listings through their dealer profile.',
		},
		{
			id: 'dealers-02',
			subject: 'What should dealers keep accurate on each listing?',
			content: 'Listings should keep stock quantity, price, imagery, trim details, and current status aligned with real inventory so buyers can trust the marketplace experience.',
		},
		{
			id: 'dealers-03',
			subject: 'What if dealer listing information needs to be corrected?',
			content: 'Update the affected listing promptly so buyers are not comparing outdated price, availability, or trim information.',
		},
	],
	account: [
		{
			id: 'account-01',
			subject: 'Do I need an account to browse inventory or support information?',
			content: 'You can browse listings and support content without signing in, but some actions such as liking content or participating in community discussions require an account.',
		},
		{
			id: 'account-02',
			subject: 'What should I do if my account activity looks unfamiliar?',
			content: 'Review your recent actions, update your credentials if needed, and avoid sharing access with others. If something still looks wrong, stop using the account until it is checked.',
		},
		{
			id: 'account-03',
			subject: 'Can I manage my activity and saved items from VMotors?',
			content: 'Yes. Signed-in users can manage relevant personal activity through their account and use the platform’s saved or engagement features where available.',
		},
	],
	community: [
		{
			id: 'community-01',
			subject: 'How should I use the VMotors community responsibly?',
			content: 'Keep discussions relevant to Hyundai, Kia, buying, ownership, dealer experience, or platform usage, and avoid abusive or misleading posts.',
		},
		{
			id: 'community-02',
			subject: 'What should I do if I notice misinformation or abuse?',
			content: 'Do not amplify it. Report the issue or move away from the discussion while the situation is reviewed.',
		},
		{
			id: 'community-03',
			subject: 'Can I share ownership experience or dealer feedback?',
			content: 'Yes, as long as it stays constructive, relevant, and useful for other members evaluating vehicles or dealer experiences.',
		},
	],
	other: [
		{
			id: 'other-01',
			subject: 'Where should I start if I am not sure which support section applies?',
			content: 'Start with inventory or buyer guidance first, then move to dealer, account, or community help depending on where your question fits best.',
		},
		{
			id: 'other-02',
			subject: 'Does VMotors publish support updates anywhere else?',
			content: 'Important platform guidance should appear in the notices section first, with broader context available through related FAQ topics and community updates.',
		},
		{
			id: 'other-03',
			subject: 'Can VMotors help me understand the platform before I buy?',
			content: 'Yes. The support center is intended to help you understand how VMotors works before you move from browsing into active dealer conversations.',
		},
	],
};

const Faq = () => {
	const [category, setCategory] = useState<FaqCategoryKey>('inventory');
	const [expanded, setExpanded] = useState<string | false>('inventory-01');

	const changeCategoryHandler = (nextCategory: FaqCategoryKey) => {
		setCategory(nextCategory);
		setExpanded(faqData[nextCategory]?.[0]?.id ?? false);
	};

	const handleChange = (panel: string) => (event: SyntheticEvent, newExpanded: boolean) => {
		setExpanded(newExpanded ? panel : false);
	};

	const activeCategoryMeta = useMemo(() => faqCategoryMeta[category], [category]);

	return (
		<Stack className={'faq-content'}>
			<div className={'section-heading'}>
				<span className={'label'}>Automotive FAQ</span>
				<strong>Answers for inventory, buyers, dealers, and platform support</strong>
				<p>Browse practical guidance built for the VMotors marketplace so you can move from questions to confident decisions faster.</p>
			</div>

			<div className={'faq-shell'}>
				<Box className={'categories'} component={'div'}>
					{(Object.keys(faqCategoryMeta) as FaqCategoryKey[]).map((key) => (
						<button
							type="button"
							className={category === key ? 'active' : ''}
							onClick={() => {
								changeCategoryHandler(key);
							}}
							key={key}
						>
							<strong>{faqCategoryMeta[key].label}</strong>
							<span>{faqCategoryMeta[key].description}</span>
						</button>
					))}
				</Box>

				<Box className={'wrap'} component={'div'}>
					<div className={'faq-category-head'}>
						<span className={'label'}>{activeCategoryMeta.label}</span>
						<strong>{activeCategoryMeta.description}</strong>
					</div>
					{faqData[category] &&
						faqData[category].map((ele) => (
							<Accordion expanded={expanded === ele?.id} onChange={handleChange(ele?.id)} key={ele?.subject}>
								<AccordionSummary id={`${ele.id}-header`} className="question" aria-controls={`${ele.id}-content`}>
									<Typography className="badge" variant={'h4'}>
										Q
									</Typography>
									<Typography> {ele?.subject}</Typography>
								</AccordionSummary>
								<AccordionDetails>
									<Stack className={'answer flex-box'}>
										<Typography className="badge" variant={'h4'} color={'primary'}>
											A
										</Typography>
										<Typography> {ele?.content}</Typography>
									</Stack>
								</AccordionDetails>
							</Accordion>
						))}
				</Box>
			</div>
		</Stack>
	);
};

export default Faq;

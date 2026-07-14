export const REACT_APP_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3007';

export const availableOptions = ['propertyBarter', 'propertyRent'];

const thisYear = new Date().getFullYear();

export const propertyYears: any = [];

for (let i = 1970; i <= thisYear; i++) {
	propertyYears.push(String(i));
}

export const propertySquare = [0, 25, 50, 75, 100, 125, 150, 200, 300, 500];

export const Messages = {
	error1: 'Something went wrong!',
	error2: 'Please login first!',
	error3: 'Please fulfill all inputs!',
	error4: 'Message is empty!',
	error5: 'Only images with jpeg, jpg, png format allowed!',
};

export const topPropertyRank = 2;

// FAQ sections shown on /cs and used to tag FAQ entries in the admin panel.
// Keep the `key` values stable — they're stored as Notice.noticeSubCategory.
export const FAQ_SECTIONS: Array<{ key: string; label: string; description: string }> = [
	{ key: 'inventory', label: 'Inventory', description: 'Vehicle listing, availability, and pricing guidance.' },
	{ key: 'payment', label: 'Payments', description: 'Payment flow, processing, and support answers.' },
	{ key: 'buyers', label: 'For buyers', description: 'Help for shoppers comparing Hyundai and Kia inventory.' },
	{ key: 'dealers', label: 'For dealers', description: 'Dealer onboarding, listing, and account guidance.' },
	{ key: 'account', label: 'Account', description: 'Membership, profile, and platform access questions.' },
	{ key: 'community', label: 'Community', description: 'Posting, reporting, and participation guidance.' },
	{ key: 'other', label: 'Other', description: 'General Santa help and policy questions.' },
];

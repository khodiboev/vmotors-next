import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => ({
	redirect: {
		destination: '/_admin/vehicles',
		permanent: false,
	},
});

export default function AdminPropertiesRedirect() {
	return null;
}

import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ query }) => ({
	redirect: {
		destination: `/vehicle/detail${query.id ? `?id=${encodeURIComponent(query.id as string)}` : ''}`,
		permanent: false,
	},
});

export default function PropertyDetailRedirect() {
	return null;
}

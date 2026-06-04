import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ query }) => ({
	redirect: {
		destination: `/vehicle${query.input ? `?input=${encodeURIComponent(query.input as string)}` : ''}`,
		permanent: false,
	},
});

export default function PropertyRedirect() {
	return null;
}

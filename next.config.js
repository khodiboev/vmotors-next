/** @type {import('next').NextConfig} */
const nextConfig = {
	// Dev-only: strict mode's double-mount breaks this Apollo link stack
	// (upload-link + token-refresh + subscriptions-transport-ws) on hard loads —
	// initial queries never dispatch and pages stay on their loading skeletons.
	reactStrictMode: false,
	env: {
		REACT_APP_API_URL: process.env.REACT_APP_API_URL,
		REACT_APP_API_GRAPHQL_URL: process.env.REACT_APP_API_GRAPHQL_URL,
		REACT_APP_API_WS: process.env.REACT_APP_API_WS,
	},
};

const { i18n } = require('./next-i18next.config');
nextConfig.i18n = i18n;

module.exports = nextConfig;

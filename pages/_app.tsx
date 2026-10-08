import type { AppProps } from 'next/app';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { light } from '../scss/MaterialTheme';
import { ApolloProvider, useReactiveVar } from '@apollo/client';
import { ratesVar } from '../apollo/store';
import { GET_EXCHANGE_RATES } from '../apollo/user/query';
import { useApollo } from '../apollo/client';
import { appWithTranslation } from 'next-i18next';
import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';

const App = ({ Component, pageProps }: AppProps) => {
	// @ts-ignore
	const [theme, setTheme] = useState(createTheme(light));
	const client = useApollo(pageProps.initialApolloState);
	useReactiveVar(ratesVar);

	useEffect(() => {
		client
			.query({ query: GET_EXCHANGE_RATES, fetchPolicy: 'network-only' })
			.then(({ data }) => data?.getExchangeRates && ratesVar({ usd: data.getExchangeRates.usd, krw: data.getExchangeRates.krw }))
			.catch(() => {});
	}, []);

	return (
		<ApolloProvider client={client}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Component {...pageProps} />
			</ThemeProvider>
		</ApolloProvider>
	);
};

export default appWithTranslation(App);

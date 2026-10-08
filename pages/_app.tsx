import type { AppProps } from 'next/app';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import React, { useState } from 'react';
import { light } from '../scss/MaterialTheme';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../apollo/client';
import { appWithTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import moment from 'moment';
import 'moment/locale/uz-latn';
import 'moment/locale/ru';
import 'moment/locale/ko';
import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';

// dates ("Oct 8", "3 minutes ago") follow the site language
const momentLocales: Record<string, string> = { uz: 'uz-latn', en: 'en', ru: 'ru', kr: 'ko' };

const App = ({ Component, pageProps }: AppProps) => {
	const { locale } = useRouter();
	moment.locale(momentLocales[locale ?? 'uz'] ?? 'uz-latn');
	// @ts-ignore
	const [theme, setTheme] = useState(createTheme(light));
	const client = useApollo(pageProps.initialApolloState);

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

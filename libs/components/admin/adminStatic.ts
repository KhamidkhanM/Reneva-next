import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

// every admin page only needs the common namespace
export const adminStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

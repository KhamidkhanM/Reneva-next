import { NextPage } from 'next';
import { Stack } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import ShopByConcern from '../libs/components/homepage/ShopByConcern';
import TrendProducts from '../libs/components/homepage/TrendProducts';
import ForYouProducts from '../libs/components/homepage/ForYouProducts';
import Advertisement from '../libs/components/homepage/Advertisement';
import BestProducts from '../libs/components/homepage/BestProducts';
import TopBrands from '../libs/components/homepage/TopBrands';
import Events from '../libs/components/homepage/Events';
import CommunityBoards from '../libs/components/homepage/CommunityBoards';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Home: NextPage = () => {
	return (
		<Stack className={'home-page'}>
			<ShopByConcern />
			<TrendProducts />
			<ForYouProducts />
			<Advertisement />
			<BestProducts />
			<TopBrands />
			<Events />
			<CommunityBoards />
		</Stack>
	);
};

export default withLayoutMain(Home);

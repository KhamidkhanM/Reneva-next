import React from 'react';
import { NextPage } from 'next';
import withAdminLayout from '../../libs/components/layout/LayoutAdmin';
import CouponManager from '../../libs/components/mypage/CouponManager';
import { adminStaticProps } from '../../libs/components/admin/adminStatic';

export const getStaticProps = adminStaticProps;

const AdminCoupons: NextPage = () => {
	return (
		<div className={'admin-page'}>
			<CouponManager admin />
		</div>
	);
};

export default withAdminLayout(AdminCoupons);

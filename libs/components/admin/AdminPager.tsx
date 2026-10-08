import React from 'react';
import { Pagination, Stack } from '@mui/material';
import { useTranslation } from 'next-i18next';

interface AdminPagerProps {
	page: number;
	limit: number;
	total: number;
	onChange: (page: number) => void;
}

const AdminPager = ({ page, limit, total, onChange }: AdminPagerProps) => {
	const { t } = useTranslation('common');
	if (total <= limit) return null;
	return (
		<Stack className={'pagination-box'}>
			<span className={'total'}>{total} {t('total')}</span>
			<Pagination page={page} count={Math.ceil(total / limit)} onChange={(e, value) => onChange(value)} shape={'circular'} color={'primary'} />
		</Stack>
	);
};

export default AdminPager;

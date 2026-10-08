import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import moment from 'moment';
import { Accordion, AccordionDetails, AccordionSummary, Stack } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useQuery, useReactiveVar } from '@apollo/client';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { userVar } from '../../apollo/store';
import { GET_NOTICES } from '../../apollo/user/query';
import { Notice } from '../../libs/types/community';
import { NoticeCategory } from '../../libs/enums/notice.enum';
import { openAiAdvisor, openSupportChat } from '../../libs/components/chat/openChat';
import { sweetLoginConfirmAlert } from '../../libs/sweetAlert';
import { useTranslation } from 'next-i18next';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const tabs = [
	{ id: 'faq', label: 'FAQ', category: NoticeCategory.FAQ },
	{ id: 'notice', label: 'Notices', category: NoticeCategory.EVENT },
	{ id: 'terms', label: 'Terms', category: NoticeCategory.TERMS },
];

const CS: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const tab = tabs.find((ele) => ele.id === router.query.tab) ?? tabs[0];
	const [expanded, setExpanded] = useState<string | false>(false);

	/** APOLLO REQUESTS **/
	const { data } = useQuery(GET_NOTICES, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 30, search: { noticeCategory: tab.category } } },
	});
	const notices: Notice[] = data?.getNotices?.list ?? [];

	const supportHandler = async () => {
		if (user._id) return openSupportChat();
		if (await sweetLoginConfirmAlert('Log in to chat with Reneva support?')) router.push({ pathname: '/account/join', query: { referrer: '/cs' } });
	};

	return (
		<div id={'cs-page'}>
			<div className={'container'}>
				<Stack className={'cs-layout'}>
					<Stack className={'cs-main'}>
						<Stack className={'chips'}>
							{tabs.map((ele) => (
								<button
									key={ele.id}
									className={`chip ${tab.id === ele.id ? 'on' : ''}`}
									onClick={() => router.push({ pathname: '/cs', query: { tab: ele.id } }, undefined, { scroll: false })}
								>
									{t(ele.label)}
								</button>
							))}
						</Stack>
						{notices.length === 0 ? (
							<div className={'no-data'}>{t('Nothing posted here yet.')}</div>
						) : (
							<div className={'notice-list'}>
								{notices.map((notice) => (
									<Accordion
										key={notice._id}
										expanded={expanded === notice._id}
										onChange={(e, open) => setExpanded(open ? notice._id : false)}
										disableGutters
										elevation={0}
										className={'notice'}
									>
										<AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
											<span className={'q'}>{tab.id === 'faq' ? 'Q' : moment(notice.createdAt).format('MM.DD')}</span>
											<b>{notice.noticeTitle}</b>
										</AccordionSummary>
										<AccordionDetails>
											{notice.noticeContent.split('\n').map((line, index) => (
												<p key={index}>{line}</p>
											))}
										</AccordionDetails>
									</Accordion>
								))}
							</div>
						)}
					</Stack>

					<aside className={'contact-box'}>
						<img src={'/img/logo/rena-ai.svg'} alt={''} />
						<h2>{t('Still need help?')}</h2>
						<p>{t('Ask Rena first. She answers in seconds and can pass you to a person.')}</p>
						<button className={'soft-btn'} onClick={openAiAdvisor}>
							{t('Ask Rena')}
						</button>
						<div className={'contact-option'}>
							<SupportAgentRoundedIcon />
							<span>
								<b>{t('Reneva support')}</b>
								<span>{t('Reports, refunds, account or order problems. A team member replies in the chat.')}</span>
							</span>
						</div>
						<button className={'primary-btn'} onClick={supportHandler}>
							{t('Chat with support')}
						</button>
						<div className={'contact-option'}>
							<StorefrontRoundedIcon />
							<span>
								<b>{t('A store')}</b>
								<span>{t('Questions about a product? Use “Chat with store” on the product or brand page.')}</span>
							</span>
						</div>
					</aside>
				</Stack>
			</div>
		</div>
	);
};

export default withLayoutBasic(CS);

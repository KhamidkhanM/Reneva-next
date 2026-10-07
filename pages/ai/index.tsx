import React, { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import moment from 'moment';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import AiChatPanel from '../../libs/components/chat/AiChatPanel';
import { userVar } from '../../apollo/store';
import { GET_MY_AI_CHATS } from '../../apollo/user/query';
import { ARCHIVE_AI_CHAT } from '../../apollo/user/mutation';
import { AiChat } from '../../libs/types/chat';
import { AiChatStatus, AiChatType } from '../../libs/enums/ai.enum';
import { labelOf } from '../../libs/utils';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const modes = [
	{ type: AiChatType.ADVISOR, label: 'Product advice', desc: 'Routines and picks for your skin' },
	{ type: AiChatType.INGREDIENT_CHECK, label: 'Ingredient check', desc: 'What an ingredient does, what to avoid' },
	{ type: AiChatType.ORDER_HELP, label: 'Order help', desc: 'Shipping and returns, or a person from support' },
];

const AiAdvisorPage: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const analysisId = (router.query.analysisId as string) || undefined;
	const [mode, setMode] = useState<AiChatType>(AiChatType.ADVISOR);
	const [chat, setChat] = useState<AiChat | null>(null);
	const [panelKey, setPanelKey] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const { data, refetch } = useQuery(GET_MY_AI_CHATS, {
		fetchPolicy: 'network-only',
		skip: !user._id,
		variables: { input: { page: 1, limit: 12 } },
	});
	const [archiveAiChat] = useMutation(ARCHIVE_AI_CHAT);
	const chats: AiChat[] = data?.getMyAiChats?.list ?? [];

	/** HANDLERS **/
	const openChatHandler = (target: AiChat | null, nextMode?: AiChatType) => {
		setChat(target);
		if (nextMode) setMode(nextMode);
		setPanelKey((key) => key + 1);
		if (analysisId && !target) router.replace('/ai', undefined, { shallow: true });
	};

	const archiveHandler = async (id: string) => {
		await archiveAiChat({ variables: { input: id } });
		if (chat?._id === id) openChatHandler(null);
		await refetch();
	};

	return (
		<div id={'ai-page'}>
			<div className={'container'}>
				<Stack className={'ai-layout'}>
					<Stack className={'ai-main'}>
						<div className={'modes'}>
							{modes.map((ele) => (
								<button key={ele.type} className={`mode ${mode === ele.type && !chat ? 'on' : ''}`} onClick={() => openChatHandler(null, ele.type)}>
									<b>{ele.label}</b>
									<span>{ele.desc}</span>
								</button>
							))}
						</div>
						{analysisId && !chat && <div className={'context-note'}>Rena can see your latest skin analysis in this chat.</div>}
						<AiChatPanel
							key={`${panelKey}-${mode}-${analysisId ?? ''}`}
							variant={'page'}
							aiChatType={chat?.aiChatType ?? mode}
							analysisId={chat ? undefined : analysisId}
							initialChat={chat}
							startFresh={!chat && panelKey > 0}
							onChatChange={() => refetch()}
						/>
					</Stack>

					<Stack className={'ai-side'}>
						<section className={'box skin'}>
							<h2>Your skin profile</h2>
							{user.memberSkinType ? (
								<>
									<p>
										<b>{labelOf(user.memberSkinType)}</b> skin
										{user.memberSkinConcerns?.length ? ` · ${user.memberSkinConcerns.map(labelOf).join(', ')}` : ''}
									</p>
									<span>Rena uses this to choose products for you.</span>
								</>
							) : (
								<p>Not set yet. Take a skin analysis or set it in My Page so Rena can pick better.</p>
							)}
							<div className={'btns'}>
								<Link href={'/ai/skin'} className={'primary-btn'}>
									Analyze my skin
								</Link>
								<Link href={'/mypage?category=myProfile'} className={'ghost-btn'}>
									Edit
								</Link>
							</div>
						</section>

						<section className={'box'}>
							<h2>Past chats</h2>
							{!user._id && <p>Login to keep your chats.</p>}
							{user._id && chats.length === 0 && <p>No chats yet.</p>}
							<div className={'past-chats'}>
								{chats.map((ele) => (
									<div key={ele._id} className={`past ${chat?._id === ele._id ? 'on' : ''}`}>
										<button className={'open'} onClick={() => openChatHandler(ele)}>
											<b>{ele.aiChatTitle}</b>
											<span>
												{labelOf(ele.aiChatType)} · {ele.aiChatStatus === AiChatStatus.HANDOFF ? 'with support' : moment(ele.lastMessageAt ?? ele.createdAt).fromNow()}
											</span>
										</button>
										<button className={'link-btn'} onClick={() => archiveHandler(ele._id)} aria-label={`Remove chat ${ele.aiChatTitle}`}>
											Remove
										</button>
									</div>
								))}
							</div>
						</section>

						<p className={'disclaimer'}>Rena gives cosmetic advice, not medical advice. For skin problems that hurt or last, see a dermatologist.</p>
					</Stack>
				</Stack>
			</div>
		</div>
	);
};

export default withLayoutBasic(AiAdvisorPage);

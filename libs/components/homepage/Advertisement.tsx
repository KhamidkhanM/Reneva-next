import React from 'react';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import { openAiAdvisor } from '../chat/openChat';
import { useTranslation } from 'next-i18next';

// the AI advisor banner, in the place of nestar's video advertisement
const Advertisement = () => {
	const { t } = useTranslation('common');
	const router = useRouter();

	return (
		<Stack className={'advertisement'}>
			<Stack className={'container'}>
				<div className={'ai-banner'}>
					<div className={'left'}>
						<span className={'eyebrow'}>{t('AI BEAUTY ADVISOR')}</span>
						<h2>{t('Like a friend who works at the store')}</h2>
						<p>
							{t('Ask Rena about routines or ingredients. She recommends real products from Reneva and passes you to a person for anything about your order.')}
						</p>
						<div className={'btns'}>
							<button className={'lilac-btn'} onClick={openAiAdvisor}>
								{t('Chat with Rena')}
							</button>
							<button className={'outline-light-btn'} onClick={() => router.push('/ai/skin')}>
								{t('Analyze my skin')}
							</button>
						</div>
					</div>
					<div className={'right'} aria-hidden={'true'}>
						<div className={'chips'}>
							<span>{t('Night routine')}</span>
							<span>{t('Safe for sensitive skin?')}</span>
							<span>{t('Help with my order')}</span>
						</div>
						<div className={'bubble mine'}>{t('Can I use retinol and vitamin C together?')}</div>
						<div className={'bubble rena'}>
							<img src={'/img/logo/rena-ai.svg'} alt={''} />
							<span>
								{t('Better to split them: vitamin C in the morning, retinol at night. With sensitive skin, start retinol twice a week.')}
							</span>
						</div>
					</div>
				</div>
			</Stack>
		</Stack>
	);
};

export default Advertisement;

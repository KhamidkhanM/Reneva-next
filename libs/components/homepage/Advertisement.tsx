import React from 'react';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import { openAiAdvisor } from '../chat/openChat';

// the AI advisor banner, in the place of nestar's video advertisement
const Advertisement = () => {
	const router = useRouter();

	return (
		<Stack className={'advertisement'}>
			<Stack className={'container'}>
				<div className={'ai-banner'}>
					<div className={'left'}>
						<span className={'eyebrow'}>AI BEAUTY ADVISOR</span>
						<h2>Like a friend who works at the store</h2>
						<p>
							Ask Rena about routines or ingredients. She recommends real products from Reneva and passes you to a person for
							anything about your order.
						</p>
						<div className={'btns'}>
							<button className={'lilac-btn'} onClick={openAiAdvisor}>
								Chat with Rena
							</button>
							<button className={'outline-light-btn'} onClick={() => router.push('/ai/skin')}>
								Analyze my skin
							</button>
						</div>
					</div>
					<div className={'right'} aria-hidden={'true'}>
						<div className={'chips'}>
							<span>Night routine</span>
							<span>Safe for sensitive skin?</span>
							<span>Help with my order</span>
						</div>
						<div className={'bubble mine'}>Can I use retinol and vitamin C together?</div>
						<div className={'bubble rena'}>
							<img src={'/img/logo/rena-ai.svg'} alt={''} />
							<span>
								Better to split them: vitamin C in the morning, retinol at night. With sensitive skin, start retinol twice a
								week.
							</span>
						</div>
					</div>
				</div>
			</Stack>
		</Stack>
	);
};

export default Advertisement;

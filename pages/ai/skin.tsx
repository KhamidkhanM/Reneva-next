import React, { useRef, useState } from 'react';
import { NextPage } from 'next';
import moment from 'moment';
import { useRouter } from 'next/router';
import { CircularProgress, Stack } from '@mui/material';
import AddAPhotoOutlinedIcon from '@mui/icons-material/AddAPhotoOutlined';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import ProductCard from '../../libs/components/common/ProductCard';
import { userVar } from '../../apollo/store';
import { GET_MY_SKIN_ANALYSES, GET_PRODUCTS } from '../../apollo/user/query';
import { ANALYZE_SKIN, IMAGE_UPLOADER, UPDATE_MEMBER } from '../../apollo/user/mutation';
import { SkinAnalysis } from '../../libs/types/chat';
import { Product } from '../../libs/types/product';
import { AnalysisStatus } from '../../libs/enums/ai.enum';
import { updateStorage, updateUserInfo } from '../../libs/auth';
import { labelOf } from '../../libs/utils';
import { Messages } from '../../libs/config';
import { sweetLoginConfirmAlert, sweetMixinErrorAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const scoreRows: { key: 'moisture' | 'oil' | 'pores' | 'wrinkles' | 'tone'; label: string }[] = [
	{ key: 'moisture', label: 'Dryness' },
	{ key: 'oil', label: 'Oiliness' },
	{ key: 'pores', label: 'Pores' },
	{ key: 'wrinkles', label: 'Fine lines' },
	{ key: 'tone', label: 'Uneven tone' },
];

const SkinAnalysisPage: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const fileRef = useRef<HTMLInputElement>(null);
	const [preview, setPreview] = useState<string>('');
	const [result, setResult] = useState<SkinAnalysis | null>(null);
	const [working, setWorking] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const [imageUploader] = useMutation(IMAGE_UPLOADER);
	const [analyzeSkin] = useMutation(ANALYZE_SKIN);
	const [updateMember] = useMutation(UPDATE_MEMBER);
	const { data: historyData, refetch: historyRefetch } = useQuery(GET_MY_SKIN_ANALYSES, {
		fetchPolicy: 'network-only',
		skip: !user._id,
		variables: { input: { page: 1, limit: 6 } },
	});
	const history: SkinAnalysis[] = historyData?.getMySkinAnalyses?.list ?? [];
	const shown = result ?? history.find((ele) => ele.analysisStatus === AnalysisStatus.DONE) ?? null;

	const { data: productData } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		skip: !shown?.analysisSkinType,
		variables: {
			input: {
				page: 1,
				limit: 4,
				sort: 'productRating',
				direction: 'DESC',
				search: { skinTypeList: shown?.analysisSkinType ? [shown.analysisSkinType] : undefined, concernList: shown?.analysisConcerns?.length ? shown.analysisConcerns : undefined },
			},
		},
	});
	const picks: Product[] = productData?.getProducts?.list ?? [];

	/** HANDLERS **/
	const pickHandler = async () => {
		if (!user._id) {
			if (await sweetLoginConfirmAlert(Messages.error2)) await router.push('/account/join');
			return;
		}
		fileRef.current?.click();
	};

	const fileHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = '';
		if (!file) return;
		if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) return sweetMixinErrorAlert(Messages.error5);
		if (file.size > 5 * 1024 * 1024) return sweetMixinErrorAlert('Please use a photo under 5MB');

		setPreview(URL.createObjectURL(file));
		setResult(null);
		setWorking(true);
		try {
			const uploaded = await imageUploader({ variables: { file, target: 'skin' } });
			const analysis = await analyzeSkin({ variables: { input: { analysisImage: uploaded.data.imageUploader } } });
			const done: SkinAnalysis = analysis.data.analyzeSkin;
			setResult(done);
			await historyRefetch();
			// the server saved the new skin profile; ask for a fresh login token that carries it
			if (done.analysisStatus === AnalysisStatus.DONE) {
				const updated = await updateMember({
					variables: { input: { _id: user._id, memberSkinType: done.analysisSkinType, memberSkinConcerns: done.analysisConcerns } },
				});
				const jwtToken = updated.data?.updateMember?.accessToken;
				if (jwtToken) {
					updateStorage({ jwtToken });
					updateUserInfo(jwtToken);
				}
			}
		} catch (err: any) {
			console.log('ERROR, analyzeSkin:', err.message);
		} finally {
			setWorking(false);
		}
	};

	return (
		<div id={'skin-page'}>
			<div className={'container column'}>
				<Stack className={'skin-layout'}>
					<section className={'box upload'}>
						<div className={'photo'}>
							{preview ? <img src={preview} alt={'Your selfie'} /> : <img src={'/img/logo/rena-ai.svg'} alt={''} className={'placeholder'} />}
							{working && (
								<div className={'scanning'}>
									<CircularProgress size={28} />
									<span>Rena is reading your skin…</span>
								</div>
							)}
						</div>
						<h2>Take one selfie</h2>
						<ul className={'tips'}>
							<li>Face the camera in daylight, no filter</li>
							<li>No makeup gives the most accurate result</li>
							<li>Your photo stays private, only you can see it</li>
						</ul>
						<input ref={fileRef} type={'file'} accept={'image/png,image/jpeg'} capture={'user'} hidden onChange={fileHandler} />
						<button className={'primary-btn'} onClick={pickHandler} disabled={working}>
							<AddAPhotoOutlinedIcon fontSize={'small'} /> {preview ? 'Try another photo' : 'Upload a selfie'}
						</button>
					</section>

					<section className={'box result'}>
						{!shown ? (
							<div className={'empty'}>
								<h2>Your result shows here</h2>
								<p>You get a skin type, five scores and the concerns to care for first. Your skin profile updates so the shop and Rena pick for you.</p>
							</div>
						) : shown.analysisStatus === AnalysisStatus.FAILED ? (
							<div className={'empty'}>
								<h2>We could not read this photo</h2>
								<p>{shown.analysisSummary || 'Please try again with a clear photo of your face.'}</p>
							</div>
						) : (
							<>
								<span className={'eyebrow'}>RESULT · {moment(shown.createdAt).format('YYYY.MM.DD')}</span>
								<h2>
									{labelOf(shown.analysisSkinType)} skin
								</h2>
								<p className={'summary'}>{shown.analysisSummary}</p>
								<div className={'scores'}>
									{scoreRows.map((row) => {
										const value = shown.analysisScores?.[row.key] ?? 0;
										return (
											<div key={row.key} className={'score'}>
												<span>{row.label}</span>
												<div className={'track'} role={'meter'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-label={row.label}>
													<div className={`fill ${value >= 60 ? 'high' : ''}`} style={{ width: `${value}%` }}></div>
												</div>
												<b>{value}</b>
											</div>
										);
									})}
								</div>
								<p className={'scale-note'}>Higher means that area needs more care.</p>
								{shown.analysisConcerns.length > 0 && (
									<div className={'concerns'}>
										{shown.analysisConcerns.map((concern) => (
											<span key={concern} className={'chip'}>
												{labelOf(concern)}
											</span>
										))}
									</div>
								)}
								<div className={'btns'}>
									<button className={'primary-btn'} onClick={() => router.push({ pathname: '/ai', query: { analysisId: shown._id } })}>
										Ask Rena about my result
									</button>
								</div>
							</>
						)}
					</section>
				</Stack>

				{picks.length > 0 && (
					<Stack className={'skin-picks'}>
						<h2 className={'section-title'}>Picked for {labelOf(shown?.analysisSkinType).toLowerCase()} skin</h2>
						<div className={'product-grid four'}>
							{picks.map((product) => (
								<ProductCard key={product._id} product={product} />
							))}
						</div>
					</Stack>
				)}

				{history.length > 1 && (
					<Stack className={'skin-history'}>
						<h2 className={'section-title'}>Your past results</h2>
						<div className={'history-row'}>
							{history.map((ele) => (
								<button key={ele._id} className={`past ${shown?._id === ele._id ? 'on' : ''}`} onClick={() => setResult(ele)}>
									<b>{ele.analysisStatus === AnalysisStatus.DONE ? labelOf(ele.analysisSkinType) : 'Not read'}</b>
									<span>{moment(ele.createdAt).format('YYYY.MM.DD')}</span>
								</button>
							))}
						</div>
					</Stack>
				)}
			</div>
		</div>
	);
};

export default withLayoutBasic(SkinAnalysisPage);

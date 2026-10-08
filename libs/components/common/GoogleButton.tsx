import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { REACT_APP_GOOGLE_CLIENT_ID } from '../../config';

declare global {
	interface Window {
		google?: any;
	}
}

const GSI_SRC = 'https://accounts.google.com/gsi/client';

// loads Google's sign-in script once and reuses it on every page
const loadGsi = (): Promise<void> =>
	new Promise((resolve, reject) => {
		if (window.google?.accounts?.id) return resolve();
		let script = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
		if (!script) {
			script = document.createElement('script');
			script.src = GSI_SRC;
			script.async = true;
			document.head.appendChild(script);
		}
		script.addEventListener('load', () => resolve());
		script.addEventListener('error', () => reject(new Error('Could not load Google sign-in')));
	});

interface GoogleButtonProps {
	text: 'signin_with' | 'signup_with';
	onCredential: (credential: string) => void;
}

// Google's own "Sign in with Google" button; hands back the ID token the backend checks
const GoogleButton = ({ text, onCredential }: GoogleButtonProps) => {
	const router = useRouter();
	const boxRef = useRef<HTMLDivElement>(null);
	const callbackRef = useRef(onCredential);
	callbackRef.current = onCredential;

	useEffect(() => {
		if (!REACT_APP_GOOGLE_CLIENT_ID) return;
		let cancelled = false;
		loadGsi()
			.then(() => {
				if (cancelled || !boxRef.current) return;
				window.google.accounts.id.initialize({
					client_id: REACT_APP_GOOGLE_CLIENT_ID,
					callback: (response: { credential: string }) => callbackRef.current(response.credential),
				});
				boxRef.current.innerHTML = '';
				window.google.accounts.id.renderButton(boxRef.current, {
					theme: 'outline',
					size: 'large',
					shape: 'pill',
					text,
					width: boxRef.current.offsetWidth || 320,
					locale: router.locale === 'kr' ? 'ko' : router.locale,
				});
			})
			.catch((err) => console.warn(err.message));
		return () => {
			cancelled = true;
		};
	}, [text, router.locale]);

	if (!REACT_APP_GOOGLE_CLIENT_ID) return null;
	return <div ref={boxRef} className={'google-btn'} />;
};

export default GoogleButton;

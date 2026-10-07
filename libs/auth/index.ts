import decodeJWT from 'jwt-decode';
import { initializeApollo } from '../../apollo/client';
import { emptyUser, userVar } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { LOGIN, SIGN_UP } from '../../apollo/user/mutation';
import { REACT_APP_API_GRAPHQL_URL } from '../config';

export function getJwtToken(): any {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('accessToken') ?? '';
	}
}

export function setJwtToken(token: string) {
	localStorage.setItem('accessToken', token);
}

export const logIn = async (nick: string, password: string): Promise<void> => {
	try {
		const { jwtToken } = await requestJwtToken({ nick, password });

		if (jwtToken) {
			updateStorage({ jwtToken });
			updateUserInfo(jwtToken);
		}
	} catch (err: any) {
		console.warn('login err', err);
		clearUser();
		throw err;
	}
};

const requestJwtToken = async ({ nick, password }: { nick: string; password: string }): Promise<{ jwtToken: string }> => {
	const apolloClient = await initializeApollo();

	try {
		const result = await apolloClient.mutate({
			mutation: LOGIN,
			variables: { input: { memberNick: nick, memberPassword: password } },
			fetchPolicy: 'network-only',
		});

		const { accessToken } = result?.data?.login;
		return { jwtToken: accessToken };
	} catch (err: any) {
		console.log('request token err', err.graphQLErrors);
		throw new Error(authErrorMessage(err));
	}
};

export const signUp = async (nick: string, password: string, phone: string, type: string): Promise<void> => {
	try {
		const { jwtToken } = await requestSignUpJwtToken({ nick, password, phone, type });

		if (jwtToken) {
			updateStorage({ jwtToken });
			updateUserInfo(jwtToken);
		}
	} catch (err: any) {
		console.warn('signup err', err);
		clearUser();
		throw err;
	}
};

const requestSignUpJwtToken = async ({
	nick,
	password,
	phone,
	type,
}: {
	nick: string;
	password: string;
	phone: string;
	type: string;
}): Promise<{ jwtToken: string }> => {
	const apolloClient = await initializeApollo();

	try {
		const result = await apolloClient.mutate({
			mutation: SIGN_UP,
			variables: {
				input: { memberNick: nick, memberPassword: password, memberPhone: phone, memberType: type },
			},
			fetchPolicy: 'network-only',
		});

		const { accessToken } = result?.data?.signup;
		return { jwtToken: accessToken };
	} catch (err: any) {
		console.log('request token err', err.graphQLErrors);
		throw new Error(authErrorMessage(err));
	}
};

export const updateStorage = ({ jwtToken }: { jwtToken: any }) => {
	setJwtToken(jwtToken);
	window.localStorage.setItem('login', Date.now().toString());
};

export const updateUserInfo = (jwtToken: any) => {
	if (!jwtToken) return false;

	try {
		const claims = decodeJWT<CustomJwtPayload>(jwtToken);
		if (claims.exp && claims.exp * 1000 < Date.now()) {
			deleteStorage();
			userVar({ ...emptyUser });
			return false;
		}
		userVar({
			...emptyUser,
			...claims,
			memberImage: claims.memberImage ? `${claims.memberImage}` : '',
			memberSkinConcerns: claims.memberSkinConcerns ?? [],
		});
	} catch (err) {
		deleteStorage();
		userVar({ ...emptyUser });
	}
};

export const logOut = () => {
	deleteStorage();
	userVar({ ...emptyUser });
	window.location.reload();
};

// turns an Apollo error into a sentence the login page can show
const authErrorMessage = (err: any): string => {
	const serverMessage = err?.graphQLErrors?.[0]?.message;
	if (serverMessage === 'secretOrPrivateKey must have a value') return 'The server has no SECRET_TOKEN. Add it to the backend .env and restart it.';
	if (serverMessage) return serverMessage;
	if (err?.networkError) return `Cannot reach the Reneva API at ${REACT_APP_API_GRAPHQL_URL}. Is the backend running?`;
	return 'Something went wrong, please try again.';
};

// forget the current user without reloading the page (logOut reloads)
const clearUser = () => {
	deleteStorage();
	userVar({ ...emptyUser });
};

const deleteStorage = () => {
	localStorage.removeItem('accessToken');
	window.localStorage.setItem('logout', Date.now().toString());
};

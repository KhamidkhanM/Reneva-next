import { REACT_APP_API_GRAPHQL_URL } from '../config';
import decodeJWT from 'jwt-decode';
import { initializeApollo } from '../../apollo/client';
import { emptyUser, userVar } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { GOOGLE_LOGIN, LOGIN, SIGN_UP } from '../../apollo/user/mutation';

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
	} catch (err) {
		console.warn('login err', err);
		// no reload here, it would wipe the error before the user sees it
		deleteStorage();
		userVar({ ...emptyUser });
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
		throw new Error(apiErrorMessage(err));
	}
};

const apiErrorMessage = (err: any): string => {
	const serverMessage = err?.graphQLErrors?.[0]?.message;
	if (serverMessage === 'secretOrPrivateKey must have a value') return 'The server has no SECRET_TOKEN. Add it to the backend .env and restart it.';
	if (serverMessage) return serverMessage;
	if (err?.networkError) return `Cannot reach the Reneva API at ${REACT_APP_API_GRAPHQL_URL}. Is the backend running?`;
	return err?.message ?? 'Something went wrong';
};

// works for both pages: a new Google account becomes a member with the chosen type
export const googleLogIn = async (credential: string, type?: string): Promise<{ isNew: boolean }> => {
	const apolloClient = await initializeApollo();
	try {
		const result = await apolloClient.mutate({
			mutation: GOOGLE_LOGIN,
			variables: { input: { credential, memberType: type } },
			fetchPolicy: 'network-only',
		});
		const member = result?.data?.googleLogin;
		if (member?.accessToken) {
			updateStorage({ jwtToken: member.accessToken });
			updateUserInfo(member.accessToken);
		}
		// a member made just now goes on to fill in their profile (phone, skin type)
		return { isNew: !!member?.createdAt && Date.now() - new Date(member.createdAt).getTime() < 60 * 1000 };
	} catch (err: any) {
		console.warn('google login err', err);
		deleteStorage();
		userVar({ ...emptyUser });
		throw new Error(apiErrorMessage(err));
	}
};

export const signUp = async (nick: string, password: string, phone: string, type: string): Promise<void> => {
	try {
		const { jwtToken } = await requestSignUpJwtToken({ nick, password, phone, type });

		if (jwtToken) {
			updateStorage({ jwtToken });
			updateUserInfo(jwtToken);
		}
	} catch (err) {
		console.warn('signup err', err);
		// no reload here, it would wipe the error before the user sees it
		deleteStorage();
		userVar({ ...emptyUser });
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
		throw new Error(apiErrorMessage(err));
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

const deleteStorage = () => {
	localStorage.removeItem('accessToken');
	window.localStorage.setItem('logout', Date.now().toString());
};

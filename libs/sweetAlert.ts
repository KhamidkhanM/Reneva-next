import Swal from 'sweetalert2';
import 'animate.css';
import { i18n } from 'next-i18next';
import { Messages } from './config';

// every pop-up passes through the current language; unknown texts (like names) show as they are
const tr = (msg: string): string => (msg && i18n ? i18n.t(msg) : msg);

export const sweetErrorHandling = async (err: any) => {
	await Swal.fire({
		icon: 'error',
		text: tr(err.message),
		showConfirmButton: false,
	});
};

export const sweetTopSuccessAlert = async (msg: string, duration: number = 2000) => {
	await Swal.fire({
		position: 'center',
		icon: 'success',
		title: tr(msg.replace('Definer: ', '')),
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetContactAlert = async (msg: string, duration: number = 10000) => {
	await Swal.fire({
		title: tr(msg),
		showClass: {
			popup: 'animate__bounceIn',
		},
		showConfirmButton: false,
		timer: duration,
	}).then();
};

export const sweetConfirmAlert = (msg: string) => {
	return new Promise(async (resolve, reject) => {
		await Swal.fire({
			icon: 'question',
			text: tr(msg),
			showClass: {
				popup: 'animate__bounceIn',
			},
			showCancelButton: true,
			showConfirmButton: true,
			confirmButtonText: tr('Yes'),
			cancelButtonText: tr('Cancel'),
			confirmButtonColor: '#5E4C9E',
			cancelButtonColor: '#C9BDEB',
		}).then((response) => {
			if (response?.isConfirmed) resolve(true);
			else resolve(false);
		});
	});
};

export const sweetLoginConfirmAlert = (msg: string) => {
	return new Promise(async (resolve, reject) => {
		await Swal.fire({
			text: tr(msg),
			showCancelButton: true,
			showConfirmButton: true,
			color: '#212121',
			confirmButtonColor: '#5E4C9E',
			cancelButtonColor: '#C9BDEB',
			confirmButtonText: tr('Login'),
			cancelButtonText: tr('Cancel'),
		}).then((response) => {
			if (response?.isConfirmed) resolve(true);
			else resolve(false);
		});
	});
};

export const sweetErrorAlert = async (msg: string, duration: number = 3000) => {
	await Swal.fire({
		icon: 'error',
		title: tr(msg),
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetMixinErrorAlert = async (msg: string, duration: number = 3000) => {
	await Swal.fire({
		icon: 'error',
		title: tr(msg),
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetMixinSuccessAlert = async (msg: string, duration: number = 2000) => {
	await Swal.fire({
		icon: 'success',
		title: tr(msg),
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetBasicAlert = async (text: string) => {
	Swal.fire(tr(text));
};

export const sweetErrorHandlingForAdmin = async (err: any) => {
	const errorMessage = err.message ?? Messages.error1;
	await Swal.fire({
		icon: 'error',
		text: tr(errorMessage),
		showConfirmButton: false,
	});
};

export const sweetTopSmallSuccessAlert = async (
	msg: string,
	duration: number = 2000,
	enable_forward: boolean = false,
) => {
	const Toast = Swal.mixin({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: duration,
		timerProgressBar: true,
	});

	Toast.fire({
		icon: 'success',
		title: tr(msg),
	}).then((data) => {
		if (enable_forward) {
			window.location.reload();
		}
	});
};

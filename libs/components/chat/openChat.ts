import { initializeApollo } from '../../../apollo/client';
import { chatWidgetVar, userVar } from '../../../apollo/store';
import { OPEN_CHAT_ROOM } from '../../../apollo/user/mutation';
import { ChatType } from '../../enums/chat.enum';
import { Messages } from '../../config';
import { sweetLoginConfirmAlert, sweetMixinErrorAlert } from '../../sweetAlert';

const requireLogin = async (): Promise<boolean> => {
	if (userVar()._id) return true;
	const goLogin = await sweetLoginConfirmAlert(Messages.error2);
	if (goLogin) window.location.href = '/account/join';
	return false;
};

// opens (or reuses) the 1:1 room and shows it in the chat widget
const openRoom = async (input: { chatType: ChatType; productId?: string; orderId?: string }) => {
	if (!(await requireLogin())) return;
	try {
		const client = initializeApollo();
		const result = await client.mutate({ mutation: OPEN_CHAT_ROOM, variables: { input }, fetchPolicy: 'no-cache' });
		const roomId = result?.data?.openChatRoom?._id;
		if (roomId) chatWidgetVar({ open: true, tab: 'messages', roomId });
	} catch (err: any) {
		console.log('ERROR, openRoom:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};

// "Chat with store" on a product page: the room goes to the product's seller
export const openStoreChat = (productId: string) => openRoom({ chatType: ChatType.SELLER, productId });

// reports and requests go to Reneva admins
export const openSupportChat = (orderId?: string) => openRoom({ chatType: ChatType.SUPPORT, orderId });

export const openAiAdvisor = () => chatWidgetVar({ ...chatWidgetVar(), open: true, tab: 'ai' });

export const openChatRoomById = (roomId: string) => chatWidgetVar({ open: true, tab: 'messages', roomId });

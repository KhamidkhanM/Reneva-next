import { ChatStatus, ChatType, MessageStatus, MessageType } from '../enums/chat.enum';
import { AiChatStatus, AiChatType, AiMessageFeedback, AiMessageRole, AnalysisStatus, RecommendSource } from '../enums/ai.enum';
import { SkinConcern, SkinType } from '../enums/member.enum';
import { Member } from './member';
import { Product } from './product';

export interface ChatRoom {
	_id: string;
	chatType: ChatType;
	chatStatus: ChatStatus;
	customerId: string;
	agentId: string;
	productId?: string;
	orderId?: string;
	lastMessage: string;
	lastMessageAt?: Date;
	customerUnread: number;
	agentUnread: number;
	customerData?: Member;
	agentData?: Member;
	productData?: Product;
}

export interface ChatMessage {
	_id: string;
	roomId: string;
	senderId: string;
	messageType: MessageType;
	messageContent: string;
	messageImage?: string;
	messageRefId?: string;
	messageStatus: MessageStatus;
	createdAt: Date;
}

export interface SkinAnalysis {
	_id: string;
	analysisImage: string;
	analysisSkinType?: SkinType;
	analysisScores?: { moisture: number; oil: number; pores: number; wrinkles: number; tone: number };
	analysisConcerns: SkinConcern[];
	analysisSummary?: string;
	analysisStatus: AnalysisStatus;
	createdAt: Date;
}

export interface AiChat {
	_id: string;
	aiChatType: AiChatType;
	aiChatTitle: string;
	aiChatStatus: AiChatStatus;
	analysisId?: string;
	roomId?: string;
	aiChatMessages: number;
	lastMessageAt?: Date;
	createdAt: Date;
}

export interface AiMessage {
	_id: string;
	aiChatId: string;
	aiMessageRole: AiMessageRole;
	aiMessageContent: string;
	aiMessageProducts: string[];
	aiMessageFeedback: AiMessageFeedback;
	createdAt: Date;
	productsData?: Product[];
}

export interface AiRecommendation {
	_id: string;
	productId: string;
	recommendScore: number;
	recommendReason: string;
	recommendSource: RecommendSource;
	productData?: Product;
}

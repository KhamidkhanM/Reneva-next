export enum AnalysisStatus {
	PENDING = 'PENDING',
	DONE = 'DONE',
	FAILED = 'FAILED',
}

export enum AiChatType {
	ADVISOR = 'ADVISOR',
	INGREDIENT_CHECK = 'INGREDIENT_CHECK',
	ORDER_HELP = 'ORDER_HELP',
}

export enum AiChatStatus {
	ACTIVE = 'ACTIVE',
	ARCHIVE = 'ARCHIVE',
	HANDOFF = 'HANDOFF',
}

export enum AiMessageRole {
	USER = 'USER',
	ASSISTANT = 'ASSISTANT',
	SYSTEM = 'SYSTEM',
}

export enum AiMessageFeedback {
	NONE = 'NONE',
	LIKE = 'LIKE',
	DISLIKE = 'DISLIKE',
}

export enum RecommendSource {
	SKIN_PROFILE = 'SKIN_PROFILE',
	VIEW_HISTORY = 'VIEW_HISTORY',
	AI_CHAT = 'AI_CHAT',
	SIMILAR_USERS = 'SIMILAR_USERS',
}

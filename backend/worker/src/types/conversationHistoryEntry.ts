export interface ConversationHistoryEntry {
    role: "user" | "assistant";
    content: string;
}
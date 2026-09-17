export interface ConversationHistory {
    role: "user" | "assistant";
    content: string;
}
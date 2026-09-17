import type {Env} from "./env.ts";
import {ConversationHistoryEntry} from "./worker/src/types/conversationHistoryEntry.ts";

type AskKnowledgeRequest = {
  question: string;
  language?: string;
  conversationHistory?: ConversationHistoryEntry[];
};

export async function askKnowledge(
    payload: AskKnowledgeRequest,
    env: Env
): Promise<string> {
  void env;
  void payload.conversationHistory;
  return Promise.resolve("{ \"answer\": \"NO FUNCTIONALITY YET\"}");
}
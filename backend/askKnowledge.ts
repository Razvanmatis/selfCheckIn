import type {Env} from "./env.ts";

type AskKnowledgeRequest = { question: string; language?: string; };

export async function askKnowledge(
    payload: AskKnowledgeRequest,
    env: Env
): Promise<string> {
  return Promise.resolve("{ \"answer\": \"NO FUNCTIONALITY YET\"}");
}
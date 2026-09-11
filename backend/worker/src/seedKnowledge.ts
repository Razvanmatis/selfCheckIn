import type { Env } from "./types/env";
import { knowledge } from "./aiknowledge/knowledge";

export async function seedKnowledge(env: Env): Promise<void> {
    for (const entry of knowledge) {
        console.log(`Embedding für ${entry.id} starten`);
        const embedding = await env.AI.run(
            "@cf/qwen/qwen3-embedding-0.6b",
            {
                text: [entry.text]
            }
        );

        if (!embedding.data || embedding.data.length === 0) {
            throw new Error(
                `Kein Embedding für "${entry.id}" erhalten.`
            );
        }
        console.log(`Embedding für ${entry.id} erfolgreich`);

        console.log(`Vectorize upsert für ${entry.id} starten`);
        await env.APARTMENT_KNOWLEDGE.upsert([
            {
                id: entry.id,
                values: embedding.data[0],
                metadata: {
                    text: entry.text,
                    language: entry.language
                }
            }
        ]);
        console.log(`Vectorize upsert für ${entry.id} erfolgreich`);
    }
}
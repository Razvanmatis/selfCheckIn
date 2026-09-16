export interface Env {
    SMOOBU_API_KEY: string;
    SMOOBU_API_SECRET: string;
    NUKI_API_TOKEN: string;
    NUKI_SMARTLOCK_ID: string;
    ADMIN_NAME: string;
    BREVO_API_KEY: string;
    EMAIL_FROM: string;
    SMOOBU_WEBHOOK_TOKEN: string;
    WHATSAPP_API_TOKEN: string;
    WHATSAPP_PHONE_NUMBER_ID: string;
    WHATSAPP_SECRET: string;
    ASSETS: Fetcher;
    AI: Ai;
    APARTMENT_KNOWLEDGE: VectorizeIndex;
    PROMPTS: KVNamespace;
    DB: D1Database;
}
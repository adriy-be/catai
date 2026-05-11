import 'dotenv/config';

const OPENROUTER_MODEL_PREFIX = 'openrouter/';
const OPENAI_MODEL_PREFIX = 'openai/';
const ANTHROPIC_MODEL_PREFIX = 'anthropic/';
const GROQ_MODEL_PREFIX = 'groq/';

const DEFAULT_MODEL = process.env.CATAI_MODEL?.trim() || 'openrouter/deepseek/DeepSeek-V3.2';

function readEnv(name: string): string | undefined {
    const value = process.env[name]?.trim();
    return value ? value : undefined;
}

function assertConfigured(name: string, docsHint: string): void {
    const value = readEnv(name);
    if (!value || value === 'your-api-key') {
        throw new Error(`Missing ${name}. ${docsHint}`);
    }
}

function validateOpenRouterKey(): void {
    const key = readEnv('OPENROUTER_API_KEY');

    if (!key || key === 'your-api-key') {
        throw new Error('Missing OPENROUTER_API_KEY. Add a valid OpenRouter key in backend/.env.');
    }

    if (!key.startsWith('sk-or-')) {
        throw new Error(
            'OPENROUTER_API_KEY looks invalid. OpenRouter keys usually start with "sk-or-". Update backend/.env with a valid key.',
        );
    }
}

function validateModelCredentials(model: string): void {
    if (model.startsWith(OPENROUTER_MODEL_PREFIX)) {
        validateOpenRouterKey();
        return;
    }

    if (model.startsWith(OPENAI_MODEL_PREFIX)) {
        assertConfigured('OPENAI_API_KEY', 'Add a valid OpenAI key in backend/.env.');
        return;
    }

    if (model.startsWith(ANTHROPIC_MODEL_PREFIX)) {
        assertConfigured('ANTHROPIC_API_KEY', 'Add a valid Anthropic key in backend/.env.');
        return;
    }

    if (model.startsWith(GROQ_MODEL_PREFIX)) {
        assertConfigured('GROQ_API_KEY', 'Add a valid Groq key in backend/.env.');
    }
}

validateModelCredentials(DEFAULT_MODEL);

export const agentModel = DEFAULT_MODEL;

# catai-back

Welcome to your new [Mastra](https://mastra.ai/) project! We're excited to see what you'll build.

## Getting Started

Set your model provider key in `.env`.

Default setup (OpenRouter):

```shell
OPENROUTER_API_KEY=sk-or-...
CATAI_MODEL=openrouter/deepseek-ai/DeepSeek-V3.2
```

If you use a different provider, set `CATAI_MODEL` accordingly and provide the matching API key:

- `openai/...` requires `OPENAI_API_KEY`
- `anthropic/...` requires `ANTHROPIC_API_KEY`
- `groq/...` requires `GROQ_API_KEY`

If you see `401 User not found` with OpenRouter, your `OPENROUTER_API_KEY` is usually invalid/revoked or not an OpenRouter key.

Agent models can use OpenRouter directly with this format:

```ts
model: "openrouter/openai/gpt-4o-mini"
```

Start the development server:

```shell
npm run dev
```

Open [http://localhost:4111](http://localhost:4111) in your browser to access [Mastra Studio](https://mastra.ai/docs/studio/overview). It provides an interactive UI for building and testing your agents, along with a REST API that exposes your Mastra application as a local service. This lets you start building without worrying about integration right away.

You can start editing files inside the `src/mastra` directory. The development server will automatically reload whenever you make changes.

## Learn more

To learn more about Mastra, visit our [documentation](https://mastra.ai/docs/). Your bootstrapped project includes example code for [agents](https://mastra.ai/docs/agents/overview), [tools](https://mastra.ai/docs/agents/using-tools), [workflows](https://mastra.ai/docs/workflows/overview), [scorers](https://mastra.ai/docs/evals/overview), and [observability](https://mastra.ai/docs/observability/overview).

If you're new to AI agents, check out our [course](https://mastra.ai/learn) and [YouTube videos](https://youtube.com/@mastra-ai). You can also join our [Discord](https://discord.gg/BTYqqHKUrf) community to get help and share your projects.

## Deploy to the Mastra platform

The [Mastra platform](https://projects.mastra.ai) provides two products for deploying and managing AI applications built with the Mastra framework:

- **Studio**: A hosted visual environment for testing agents, running workflows, and inspecting traces
- **Server**: A production deployment target that runs your Mastra application as an API server

Learn more in the [Mastra platform documentation](https://mastra.ai/docs/mastra-platform/overview).
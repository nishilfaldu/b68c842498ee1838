# Neon Nerdsnipe

A small TypeScript agent for the NEON authentication challenge. It connects to the challenge WebSocket, reconstructs fragmented transmissions, asks an OpenAI-backed TanStack AI agent for the correct protocol response, and sends the response back as JSON.

## What It Does

- Connects to `wss://neonhealth.software/agent-puzzle/challenge`
- Reconstructs challenge messages by sorting fragments by timestamp
- Handles keypad responses and spoken text responses
- Uses TanStack AI code mode for arithmetic and helper tool calls
- Keeps transmission history so verification challenges can reference prior answers
- Supports Wikipedia summary lookups for knowledge archive prompts

## Tech Stack

- TypeScript
- TanStack AI
- OpenAI adapter for TanStack AI
- QuickJS isolate for code-mode execution
- Zod for response typing

## Setup

Install dependencies:

```bash
npm install
```

Create a local environment file with your OpenAI API key:

```bash
OPENAI_API_KEY=your_key_here
```

The project already ignores local environment files, so keep secrets in `.env.local` or another untracked `.env*` file.

## Scripts

```bash
npm run dev
```

Runs the agent directly from `src/index.ts` with `tsx` and `nodemon`.

```bash
npm run build
```

Compiles TypeScript into `dist/`.

```bash
npm start
```

Runs the compiled agent from `dist/index.js`.

## Project Structure

```text
src/
  index.ts     WebSocket connection and challenge loop
  helpers.ts   Fragment reconstruction helpers
  prompt.ts    NEON protocol system prompt and crew manifest
  tools.ts     TanStack AI tools and code-mode setup
  types.ts     Shared payload and response types
```

## Notes

The agent expects each final answer sent to NEON to be exactly one JSON object matching the requested response type:

```json
{ "type": "enter_digits", "digits": "1234" }
```

or:

```json
{ "type": "speak_text", "text": "example" }
```

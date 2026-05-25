import 'dotenv/config';
import { chat, streamToText, toolDefinition } from '@tanstack/ai';
import { openaiText } from '@tanstack/ai-openai';
import { createCodeMode } from "@tanstack/ai-code-mode";
import { createNodeIsolateDriver } from "@tanstack/ai-isolate-node";
import z from 'zod';
import { SYSTEM_PROMPT } from './prompt.js';
const knowledgeArchiveTool = toolDefinition({
    name: "knowledgeArchive",
    description: "Fetch the summary of a wikipedia page",
    inputSchema: z.object({ title: z.string() }),
    outputSchema: z.object({
        text: z.string(),
    }),
}).server(async ({ title }) => {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`);
    return res.json();
});
const { tool: codemodeTool, systemPrompt } = createCodeMode({
    driver: createNodeIsolateDriver(),
    tools: [knowledgeArchiveTool],
    timeout: 30000,
});
const socket = new WebSocket("wss://neonhealth.software/agent-puzzle/challenge");
const messagesHistory = [];
socket.onopen = () => {
    console.log("connected");
    // socket.send("hello");
};
socket.onmessage = async (event) => {
    console.log("recevied: ", JSON.parse(event.data));
    messagesHistory.push({ role: "user", content: event.data });
    const stream = chat({
        adapter: openaiText('gpt-5.4-mini'),
        systemPrompts: [
            SYSTEM_PROMPT,
            systemPrompt
        ],
        messages: messagesHistory,
        tools: [codemodeTool]
    });
    const reply = await streamToText(stream);
    console.log(reply);
    messagesHistory.push({ role: "assistant", content: reply });
    socket.send(reply);
};
socket.onerror = (error) => {
    console.log("error: ", error);
};
socket.onclose = () => {
    console.log("disconnected");
};

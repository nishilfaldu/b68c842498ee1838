import { toolDefinition } from "@tanstack/ai";
import { createCodeMode } from "@tanstack/ai-code-mode";
import { createQuickJSIsolateDriver } from "@tanstack/ai-isolate-quickjs";
import z from "zod";

const knowledgeArchiveTool = toolDefinition({
    name: "knowledgeArchive",
    description: "Fetch the summary of a wikipedia page and return the Nth word",
    inputSchema: z.object({ title: z.string(), nthWord: z.optional(z.number()) }),
    outputSchema: z.object({
        type: z.literal('speak_text'),
        text: z.string(),
    }),
  }).server(async ({ title, nthWord }) => {
    return fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`)
      .then((res) => res.json())
      .then((data) => ({
        type: 'speak_text' as const,
        text: nthWord ? data.extract.split(' ')[nthWord - 1] : data.extract,
      }));
  });

export const { tool: codemodeTool, systemPrompt } = createCodeMode({
  driver: createQuickJSIsolateDriver(),
  tools: [knowledgeArchiveTool],
  timeout: 30_000,
});
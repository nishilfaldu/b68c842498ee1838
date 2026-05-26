import z from "zod";

export type Fragment = { word: string; timestamp: number }

export type ChallengePayload = {
    type: 'challenge'
    message: Fragment[]
}

export const NeonResponseZodSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal('speak_text'),
        text: z.string()
    }),
    z.object({
        type: z.literal('enter_digits'),
        digits: z.string()
    }),
]) 

export type NeonResponse = z.infer<typeof NeonResponseZodSchema>

export type WebsocketPayload = ChallengePayload | { type: 'success' } | { type: 'error', message: string }
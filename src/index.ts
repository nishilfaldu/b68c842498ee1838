import 'dotenv/config' 
import { chat, streamToText } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { SYSTEM_PROMPT_V2 } from './prompt.js';
import { NeonResponse, WebsocketPayload } from './types.js';
import { reconstructMessage } from './helpers.js';
import { codemodeTool, getNthWordFromTransmissionHistory, systemPrompt } from './tools.js';



const socket = new WebSocket("wss://neonhealth.software/agent-puzzle/challenge");

const transmissionHistory: Array<{ challenge: string; response: NeonResponse }> = [];

socket.onopen = () => {
    console.log("connected");
}

socket.onmessage = async (event) => {
    const receivedData = JSON.parse(event.data) as WebsocketPayload
    console.log('event data ', receivedData)

    if(receivedData.type !== 'challenge' || !receivedData.message) return;

    const reconstructedMessage = reconstructMessage(receivedData.message);
    console.log('reconstructed message: ', reconstructedMessage)


    const stream = chat({
        adapter: openaiText('gpt-5.4-mini'),
        systemPrompts: [
            SYSTEM_PROMPT_V2,
            systemPrompt,
            `Previous responses you sent: ${transmissionHistory.map(
                (t, i) => `${i + 1}. Challenge: ${t.challenge}\n Response: ${JSON.stringify(t.response)}` 
            ).join('\n')}`,
        ],
        messages: [
            {
                role: "user",
                content: `Challenge: ${reconstructedMessage}`,
            }
        ],
        tools: [codemodeTool, getNthWordFromTransmissionHistory]
    })

    const reply = await streamToText(stream)

    console.log(`reply: ${reply}\n`);

    transmissionHistory.push({
        challenge: reconstructedMessage,
        response: JSON.parse(reply.trim()) as NeonResponse,
    })

    socket.send(reply.trim());
}

socket.onerror = (error) => {
    console.log("error: ", error)
}

socket.onclose = () => {
    console.log("disconnected")
}
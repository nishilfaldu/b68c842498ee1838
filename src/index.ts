import 'dotenv/config' 
import { chat, streamToText } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'

const socket = new WebSocket("wss://neonhealth.software/agent-puzzle/challenge");

const messagesHistory: Array<{ role: "user" | "assistant"; content: string }> = [];

socket.onopen = () => {
    console.log("connected");
    // socket.send("hello");
}

socket.onmessage = async (event) => {
    console.log("recevied: ", JSON.parse(event.data))

    messagesHistory.push({ role: "user", content: event.data })

    const stream = chat({
        adapter: openaiText('gpt-5.4-mini'),
        messages: messagesHistory,
    })

    const reply = await streamToText(stream)

    console.log(reply);

    messagesHistory.push({ role: "assistant", content: reply })

    socket.send(reply);
}

socket.onerror = (error) => {
    console.log("error: ", error)
}

socket.onclose = () => {
    console.log("disconnected")
}
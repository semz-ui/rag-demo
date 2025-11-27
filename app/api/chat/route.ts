import { NextRequest, NextResponse } from "next/server";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import { getPineconeClient } from "@/lib/pinecone-client";
import { getVectorStore } from "@/lib/vector-store";
import { processUserMessage } from "@/lib/langchain";
import { createUIMessageStreamResponse, streamText, UIMessage,isTextUIPart } from "ai";
import { toUIMessageStream } from '@ai-sdk/langchain';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
       const messages: UIMessage[] = body.messages ?? [];
        if (!messages.length) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }
    const currentMessage = messages[messages.length - 1] as UIMessage;
     const textParts = currentMessage.parts.filter(isTextUIPart);
    const currentQuestion = textParts.map(part => part.text).join(' ');
    const formattedPreviousMessages = messages
      .slice(0, -1)
      .map((message: UIMessage) => {
        const messageParts = message.parts.filter(isTextUIPart);
        const text = messageParts.map(part => part.text).join(' ');
        return `${message.role === "user" ? "Human" : "Assistant"}: ${text}`;
      })
      .filter(msg => msg.trim().length > 0) // Remove empty messages
      .join("\n");
    if (!currentQuestion?.trim()) {
      return NextResponse.json(
      { error: "Empty question provided" },
      { status: 400 }
      );
    }

        const model = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash-lite",
            temperature: 0,
            maxRetries: 2,
            apiKey: process.env.GEMINI_API_KEY,
            streaming: false,
        })
        const pc = await getPineconeClient();
        const vectorStore = await getVectorStore(pc);
      
        const stream = await processUserMessage({
            userPrompt: currentQuestion,
            conversationHistory: formattedPreviousMessages,
            vectorStore,
            model,
        });
        // const aiMsg = await model.invoke([
        //     [
        //         "system",
        //         "You are a helpful assistant that translates English to French. Translate the user sentence.",
        //     ],
        //     ["human", prompt],
        // ])
        console.log("AI Message:", stream);
        // return NextResponse.json({ stream });
        return createUIMessageStreamResponse({
            stream: toUIMessageStream(stream),
        });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred" },
            { status: 500 }
        );
    }
}
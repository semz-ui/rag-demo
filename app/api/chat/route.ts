import { NextRequest, NextResponse } from "next/server";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"
import { getPineconeClient } from "@/lib/pinecone-client";
import { getVectorStore } from "@/lib/vector-store";
import { processUserMessage } from "@/lib/langchain";
import { createUIMessageStreamResponse, streamText, UIMessage } from "ai";
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
    const currentQuestion = currentMessage?.parts?.[0]?.text;
    const formattedPreviousMessages = messages
      .slice(0, -1)
      .map((message: UIMessage) =>
      `${message.role === "user" ? "Human" : "Assistant"}: ${message.parts?.[0]?.text}`
      )
      .join("\n");
    if (!currentQuestion?.trim()) {
      return NextResponse.json(
      { error: "Empty question provided" },
      { status: 400 }
      );
    }

    console.log(formattedPreviousMessages)
        const model = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-pro",
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
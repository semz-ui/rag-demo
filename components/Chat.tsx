"use client";

import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { UIMessage, useChat } from "@ai-sdk/react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { scrollToBottom } from "@/lib/utils";

const Chat = () => {
  const { messages, status, sendMessage } = useChat();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [input, set_input] = React.useState("");
  const handleSbbmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage({
      text: input,
      metadata: {
        role: "user",
      },
    });
    set_input("");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        scrollToBottom(containerRef);

    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  return (
    <div className="flex flex-col justify-center items-center h-dvh w-dvw py-8">
      <div className="flex flex-col gap-8 mb-8 flex-1 overflow-scroll" ref={containerRef}>
        {messages.map((message: UIMessage, index: number) => (
          <div className="w-full px-20" key={index}>
            {message.role === "assistant" ? (
              <div className="border-b border-gray-300 pb-4">
                <ReactMarkdown>{message.parts[0].text}</ReactMarkdown>
              </div>
            ) : (
              <div className="w-full flex justify-end  ">
                <p
                  className={`text-black text-right bg-amber-50 rounded-full w-[500px] p-4`}
                >
                  {message.parts[0].text}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
      <div>
        {status === "submitted" && <p className="text-center py-2">Thinking....</p>}
        <div className="flex w-dvw justify-center gap-2">
          <Input
            type="text"
            placeholder="Ask anything"
            value={input}
            onChange={(e) => set_input(e.target.value)}
            className="border-2 py-4 rounded-2xl px-2 max-w-[400px] w-full placeholder:text-gray-500 text-gray-500"
          />
          <Button
            className="bg-blue-600 text-white rounded-full cursor-pointer"
            onClick={handleSbbmit}
            disabled={status === "submitted"}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;

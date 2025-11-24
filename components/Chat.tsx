"use client";

import React from "react";
import { UIMessage, useChat } from "@ai-sdk/react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const Chat = () => {
  const { messages, status, sendMessage } = useChat();
  const [input, set_input] = React.useState("");
  const handleSbbmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage({
      text: input,
      metadata: {
        role: "user",
      },
    });
    set_input("");
  };

  console.log(messages);

  return (
    <div className="flex flex-col justify-center items-center h-dvh w-dvw py-8">
      <div className="flex flex-col gap-8 mb-8 flex-1">
        {messages.map((message: UIMessage, index: number) => (
          <div className="w-full   px-20">
            {message.role === "assistant" ? (
              <p className={`text-black "text-left"`} dangerouslySetInnerHTML={{ __html: message.parts[0].text }} />
            ) : (
             <div className="w-full flex justify-end border-b border-gray-400 pb-4">
               <p className={`text-black text-right bg-amber-50 rounded-full w-[500px] p-4`}>
                {message.parts[0].text}
              </p>
             </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex w-dvw justify-center">
        <Input
        type="text"
        placeholder="Ask anything"
        value={input}
        onChange={(e) => set_input(e.target.value)}
        className="border-2 py-4 rounded-2xl px-2 max-w-[400px] w-full placeholder:text-gray-500 text-gray-500"
      />
      <Button className="bg-blue-600 text-white" onClick={handleSbbmit}>
        Submit
      </Button>
      </div>
    </div>
  );
};

export default Chat;

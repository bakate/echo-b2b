"use client";
import { Button } from "@workspace/ui/components/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useVapi } from "@/modules/widget/hooks/use-vapi";

export default function Page() {
  const users = useQuery(api.users.getAllUsers);
  const addUser = useMutation(api.users.addUser);
  const {
    startCall,
    endCall,
    isConnected,
    isConnecting,
    isSpeaking,
    transcript,
  } = useVapi();
  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello World from app/widget</h1>

        <Button onClick={() => startCall()}>Start Call</Button>
        <Button variant="destructive" onClick={() => endCall()}>
          End Call
        </Button>

        <p>{isConnecting ? "Connecting" : "Not Connecting"}</p>
        <p>{isConnected ? "Connected" : "Not Connected"}</p>
        <p>{isSpeaking ? "Speaking" : "Not Speaking"}</p>

        <ul>
          {transcript.map((message, index) => (
            <li key={index}>
              <span className="font-bold">{message.role}:</span> {message.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

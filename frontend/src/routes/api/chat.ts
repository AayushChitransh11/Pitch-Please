import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, type UIMessage } from "ai";

import { createResponsesCall } from "@/lib/ai/responses";

const SYSTEM_PROMPT = `You are the Presentation Coach preparation assistant. Your job is to help a student build a presentation brief through conversation.

The brief needs these fields:
- topic: what the presentation is about
- audience: who will listen
- purpose: what the audience should think, feel or do afterwards
- targetSeconds: the time limit in seconds
- requiredPoints: the 3-5 key points that must be covered
- draftText: an optional outline or notes the student already has

How to behave:
- Ask short, friendly follow-up questions to fill in anything missing. Ask at most two questions per message.
- If the student already gave context in the form beside this chat, acknowledge it and only ask about what is missing.
- Help the student sharpen their required points and suggest an outline when asked.
- When every field is known, summarize the brief back as a short bulleted list and tell the student they can press "Save brief & continue to practice".
- Keep replies concise. Use markdown lists when summarizing.`;

async function handleChat(request: Request): Promise<Response> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    return Response.json(
      { error: { code: "config", message: "The AI coach is not configured yet." } },
      { status: 500 },
    );
  }

  let body: { messages?: UIMessage[]; context?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: { code: "bad_request", message: "Invalid request body." } },
      { status: 400 },
    );
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json(
      { error: { code: "bad_request", message: "Messages are required." } },
      { status: 400 },
    );
  }

  const contextNote = body.context
    ? `\n\nContext the student already entered in the form: ${JSON.stringify(body.context)}`
    : "";

  const modelMessages = await convertToModelMessages(messages);
  const { result, response } = createResponsesCall(
    request,
    {
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      model: "openai/gpt-6-astra",
      system: SYSTEM_PROMPT + contextNote,
    },
    modelMessages,
  );

  return response();
}

export const Route = createFileRoute("/api/chat")({
  server: { handlers: { POST: ({ request }) => handleChat(request) } },
});

import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, type UIMessage } from "ai";
import { createResponsesCall } from "@/lib/ai/responses.server";

const INSTRUCTIONS = `You are Talki, a warm, encouraging assistant for parents and educators of children with autism, Down syndrome, and speech or developmental needs.
Give practical, evidence-informed tips (speech therapy activities, visual supports, pictograms, routines, sensory strategies, positive reinforcement).
Use simple, kind language and short paragraphs or bullet lists. Never diagnose; when something sounds medical or urgent, gently recommend talking with a pediatrician, speech-language pathologist, or developmental specialist.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) return new Response("AI is not configured.", { status: 500 });
        const { messages } = (await request.json()) as { messages: UIMessage[] };
        const call = createResponsesCall(
          request,
          { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, model: "openai/gpt-6-astra" },
          await convertToModelMessages(messages),
          INSTRUCTIONS,
        );
        return call.response();
      },
    },
  },
});

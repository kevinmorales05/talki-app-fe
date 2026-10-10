import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import logoAsset from "@/assets/talki-logo.png.asset.json";
const logo = logoAsset.url;
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea, type PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";

export const Route = createFileRoute("/app/chat")({
  head: () => ({
    meta: [
      { title: "Talki Chat — Ask about autism & speech" },
      { name: "description", content: "Ask Talki's AI about autism, speech therapy tips and child development." },
      { property: "og:title", content: "Talki Chat" },
      { property: "og:description", content: "Ask Talki's AI about autism, speech therapy tips and child development." },
    ],
  }),
  component: ChatPage,
});

const STARTERS = [
  "How can I use pictograms at home?",
  "Speech games for a 4-year-old",
  "How do I handle meltdowns calmly?",
  "Early signs of a speech delay?",
];

function ChatPage() {
  const [text, setText] = useState("");
  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const submit = (m: PromptInputMessage) => {
    if (!m.text?.trim()) return;
    sendMessage({ text: m.text });
    setText("");
  };
  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="mx-auto flex h-[calc(100dvh-8.5rem)] max-w-3xl flex-col px-4 md:h-screen md:py-6">
      <div className="flex items-center gap-3 py-4">
        <img src={logo} alt="Talki" width={1774} height={887} className="h-10 w-auto shrink-0" />
        <div className="min-w-0">
          <h1 className="truncate text-2xl text-brand-deep">Talki Chat</h1>
          <p className="text-sm text-muted-foreground">Tips for parents & educators</p>
        </div>
      </div>

      <Conversation className="flex-1 rounded-3xl bg-sky">
        <ConversationContent>
          {messages.length === 0 && (
            <div className="flex flex-col items-center py-10 text-center">
              <img src={logo} alt="Talki" width={1774} height={887} className="h-20 w-auto" />
              <h2 className="mt-3 text-xl text-brand-deep">Hi! How can I help today?</h2>
              <div className="mt-5 grid w-full gap-2 sm:grid-cols-2">
                {STARTERS.map((s) => (
                  <button key={s} onClick={() => sendMessage({ text: s })}
                    className="rounded-2xl border-2 border-brand-blue/30 bg-card px-4 py-3 text-left font-semibold text-brand-deep transition hover:border-brand-blue">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m) => (
            <Message key={m.id} from={m.role}>
              <MessageContent className={m.role === "user" ? "group-[.is-user]:bg-brand-blue group-[.is-user]:text-on-brand rounded-2xl" : ""}>
                {m.parts.map((p, i) =>
                  p.type === "text" ? (
                    m.role === "assistant" ? <MessageResponse key={i}>{p.text}</MessageResponse> : <span key={i}>{p.text}</span>
                  ) : null,
                )}
              </MessageContent>
            </Message>
          ))}
          {status === "submitted" && <Shimmer>Talki is thinking...</Shimmer>}
          {error && <p className="rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">{error.message || "Something went wrong. Please try again."}</p>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="py-3">
        <PromptInput onSubmit={submit} className="rounded-3xl bg-card">
          <PromptInputTextarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about autism, speech, routines..." />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} onStop={stop} disabled={!busy && !text.trim()} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

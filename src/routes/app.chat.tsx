import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { Mic, MessageSquareText, ArrowLeft } from "lucide-react";
import { speak } from "@/lib/talki";
import logoAsset from "@/assets/talki-logo.png.asset.json";
const logo = logoAsset.url;
import isoAsset from "@/assets/talki-isotype.png.asset.json";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";

export const Route = createFileRoute("/app/chat")({
  head: () => ({
    meta: [
      { title: "Talki Chat — Ask about autism & speech" },
      {
        name: "description",
        content: "Ask Talki's AI about autism, speech therapy tips and child development.",
      },
      { property: "og:title", content: "Talki Chat" },
      {
        property: "og:description",
        content: "Ask Talki's AI about autism, speech therapy tips and child development.",
      },
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
  const [mode, setMode] = useState<null | "voice" | "text">(null);
  if (!mode) return <ModeChooser onPick={setMode} />;
  return <ChatView mode={mode} onBack={() => setMode(null)} />;
}

function ModeChooser({ onPick }: { onPick: (m: "voice" | "text") => void }) {
  const options = [
    {
      id: "voice" as const,
      icon: Mic,
      label: "Speak",
      hint: "Click this icon to quickly generate pictograms with your voice.",
      tone: "bg-brand-coral",
    },
    {
      id: "text" as const,
      icon: MessageSquareText,
      label: "Write",
      hint: "Click here to enter your text manually.",
      tone: "bg-brand-blue",
    },
  ];
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8.5rem)] max-w-3xl flex-col items-center justify-center px-5 py-10 text-center md:min-h-screen">
      <img src={isoAsset.url} alt="" width={436} height={400} className="h-16 w-auto" />
      <h1 className="mt-4 text-3xl text-brand-deep sm:text-4xl">What do you want to say?</h1>
      <div className="mt-10 grid w-full max-w-lg grid-cols-2 gap-6">
        {options.map((o) => (
          <div key={o.id} className="flex flex-col items-center">
            <button
              onClick={() => onPick(o.id)}
              aria-label={o.label}
              className={`grid aspect-square w-full max-w-44 place-items-center rounded-[2rem] ${o.tone} text-on-brand shadow-pop transition hover:-translate-y-1 active:translate-y-1`}
            >
              <o.icon className="h-16 w-16 sm:h-20 sm:w-20" strokeWidth={2.2} />
            </button>
            <p className="mt-4 font-display text-xl font-semibold text-brand-deep">{o.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{o.hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

type SR = {
  start: () => void;
  stop: () => void;
  lang: string;
  interimResults: boolean;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onend: () => void;
  onerror: () => void;
};

function ChatView({ mode, onBack }: { mode: "voice" | "text"; onBack: () => void }) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const recRef = useRef<SR | null>(null);
  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const submit = (m: PromptInputMessage) => {
    if (!m.text?.trim()) return;
    sendMessage({ text: m.text });
    setText("");
  };
  const busy = status === "submitted" || status === "streaming";

  // In voice mode, read each finished answer aloud.
  const lastSpoken = useRef<string | null>(null);
  useEffect(() => {
    if (mode !== "voice" || status !== "ready") return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant" || lastSpoken.current === last.id) return;
    lastSpoken.current = last.id;
    const t = last.parts
      .map((p) => (p.type === "text" ? p.text : ""))
      .join(" ")
      .replace(/[*#_`>-]/g, "");
    speak(t);
  }, [mode, status, messages]);

  const toggleMic = () => {
    if (listening) return recRef.current?.stop();
    const W = window as unknown as Record<string, (new () => SR) | undefined>;
    const Ctor = W["SpeechRecognition"] || W["webkitSpeechRecognition"];
    if (!Ctor) {
      alert("Voice input isn't supported in this browser. Try Chrome or Edge.");
      return;
    }
    const rec: SR = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const said = Array.from(e.results)
        .map((r) => r[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (said) setText(said);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    window.speechSynthesis?.cancel();
    setListening(true);
    rec.start();
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-8.5rem)] max-w-3xl flex-col px-4 md:h-screen md:py-6">
      <div className="flex items-center gap-3 py-4">
        <button
          onClick={onBack}
          aria-label="Back"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted text-brand-deep"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <img src={isoAsset.url} alt="" width={436} height={400} className="h-11 w-auto shrink-0" />
        <div className="min-w-0">
          <h1 className="truncate text-2xl text-brand-deep">Talki Chat</h1>
          <p className="text-sm text-muted-foreground">Tips for parents & educators</p>
        </div>
      </div>

      <Conversation className="flex-1 rounded-3xl bg-sky">
        <ConversationContent>
          {messages.map((m) => (
            <Message key={m.id} from={m.role}>
              <MessageContent
                className={
                  m.role === "user"
                    ? "group-[.is-user]:bg-brand-blue group-[.is-user]:text-on-brand rounded-2xl"
                    : ""
                }
              >
                {m.parts.map((p, i) =>
                  p.type === "text" ? (
                    m.role === "assistant" ? (
                      <MessageResponse key={i}>{p.text}</MessageResponse>
                    ) : (
                      <span key={i}>{p.text}</span>
                    )
                  ) : null,
                )}
              </MessageContent>
            </Message>
          ))}
          {status === "submitted" && <Shimmer>Talki is thinking...</Shimmer>}
          {error && (
            <p className="rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">
              {error.message || "Something went wrong. Please try again."}
            </p>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {mode === "voice" ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <button
            onClick={toggleMic}
            disabled={busy || listening}
            aria-label={listening ? "Listening" : "Start speaking"}
            aria-busy={listening}
            className="relative grid h-20 w-20 place-items-center rounded-full bg-brand-coral text-on-brand shadow-pop transition active:translate-y-1 disabled:cursor-not-allowed"
          >
            {listening ? (
              <>
                <span className="absolute inset-0 animate-ping rounded-full bg-brand-coral/60" />
                <span className="relative flex h-9 items-center gap-1">
                  {[0, 150, 300, 450].map((d) => (
                    <span
                      key={d}
                      className="h-full w-1.5 animate-pulse rounded-full bg-on-brand"
                      style={{ animationDelay: `${d}ms`, height: d % 300 ? "60%" : "100%" }}
                    />
                  ))}
                </span>
              </>
            ) : (
              <Mic className="h-9 w-9" />
            )}
          </button>
          <p className="text-sm font-semibold text-muted-foreground">
            {listening ? "Listening…" : busy ? "Talki is answering…" : "Tap and speak"}
          </p>
          <div className="w-full">
            <label htmlFor="voice-text" className="mb-1 block text-sm font-semibold text-brand-deep">
              Text (double check)
            </label>
            <div className="flex gap-2">
              <textarea
                id="voice-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={2}
                placeholder="Your words will appear here…"
                className="flex-1 resize-none rounded-2xl border-2 border-brand-blue/30 bg-card px-3 py-2 text-brand-deep outline-none focus:border-brand-blue"
              />
              <button
                onClick={() => submit({ text, files: [] })}
                disabled={busy || listening || !text.trim()}
                className="rounded-2xl bg-brand-blue px-4 font-semibold text-on-brand disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-3">
          <PromptInput onSubmit={submit} className="rounded-3xl bg-card">
            <PromptInputTextarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask about autism, speech, routines..."
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} onStop={stop} disabled={!busy && !text.trim()} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      )}
    </div>
  );
}

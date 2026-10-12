import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  Mic,
  MessageSquareText,
  ArrowLeft,
  X,
  Volume2,
  Bookmark,
  BookmarkCheck,
  Maximize2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { PictoViewer } from "@/components/PictoViewer";
import { speak, type Picto } from "@/lib/talki";
import { useUser } from "@/contexts/UserContext";
import { SavedPhrasesService } from "@/services/saved-phrases.service";
import { toast } from "sonner";
import { KidSwitcher } from "@/components/KidSwitcher";
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
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const [mode, setMode] = useState<null | "voice" | "text">(null);
  if (!mode) return <ModeChooser onPick={setMode} />;
  return <ChatView mode={mode} onBack={() => setMode(null)} />;
}

function ModeChooser({ onPick }: { onPick: (m: "voice" | "text") => void }) {
  const { activeKid } = useUser();
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
      <img src="/talki-isotype.png" alt="Talki" width={436} height={400} className="h-16 w-auto" />
      <h1 className="mt-4 text-3xl text-brand-deep sm:text-4xl">
        What do you want to say{activeKid ? ` to ${activeKid.name}` : ""}?
      </h1>
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

// Socket instance
const socket = io(import.meta.env.VITE_WS_URL || "ws://localhost:3000", {
  autoConnect: false,
});

export interface WsMessage {
  id: string;
  type: "system" | "user";
  message: string;
  responseType?: number;
  phrase?: any[];
  quotes?: any[];
  topic?: string;
  examples?: any[];
}

type SR = {
  start: () => void;
  stop: () => void;
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onend: () => void;
  onerror: () => void;
};

function ChatView({ mode, onBack }: { mode: "voice" | "text"; onBack: () => void }) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const recRef = useRef<SR | null>(null);

  const [chatHistory, setChatHistory] = useState<WsMessage[]>([
    { id: crypto.randomUUID(), type: "system", message: "Welcome to Talki, how can I help you?" }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, activeKid } = useUser();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [viewing, setViewing] = useState<{ id: string; pictos: Picto[] } | null>(null);

  const savePhraseToBackend = async (msg: WsMessage) => {
    if (!user || !activeKid || !msg.phrase) return;
    try {
      await SavedPhrasesService.savePhrase({
        user_id: user._id,
        kid_id: activeKid._id,
        phrase: msg.phrase,
        topic: msg.topic,
        examples: msg.examples,
      });
      setSavedIds((s) => (s.includes(msg.id) ? s : [...s, msg.id]));
      toast.success("Phrase saved successfully!");
    } catch (e) {
      console.error("Failed to save phrase:", e);
      toast.error("Failed to save phrase. Please try again.");
    }
  };

  useEffect(() => {
    socket.connect();

    const handleResponse = (response: any) => {
      setIsThinking(false);
      
      const newMessage: WsMessage = {
        id: crypto.randomUUID(),
        type: "system",
        message: response.response || "",
        responseType: response.type || (response.phrase ? 1 : null),
        phrase: response.phrase,
        quotes: response.quotes,
        topic: response.topic,
        examples: response.examples,
      };

      if (newMessage.responseType === 1 && response.phrase) {
        const sentence = response.phrase.map((p: any) => p.word).join(" ");
        newMessage.message = `Pictogram: ${sentence}`;
      }
      
      if (newMessage.message || newMessage.phrase || newMessage.quotes) {
        setChatHistory((prev) => [...prev, newMessage]);
        
        if (mode === "voice" && newMessage.message) {
          speak(newMessage.message);
        }
      }
    };

    const handleError = (err: Error) => {
      setIsThinking(false);
      setError("Connection failed: " + err.message);
    };

    socket.on("kidsChatResponse", handleResponse);
    socket.on("connect_error", handleError);

    return () => {
      socket.off("kidsChatResponse", handleResponse);
      socket.off("connect_error", handleError);
      socket.disconnect();
    };
  }, [mode]);

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    const newMessage: WsMessage = { id: crypto.randomUUID(), type: "user", message: content.trim() };
    
    const newHistory = [...chatHistory, newMessage];
    setChatHistory(newHistory);
    setIsThinking(true);
    setText("");
    setError(null);

    const payload = {
      history: newHistory.map((m) => ({ type: m.type, message: m.message }))
    };
    socket.emit("kidsChat", payload);
  };

  const submitText = (m: PromptInputMessage) => {
    if (m.text) handleSendMessage(m.text);
  };

  const clearChat = () => {
    setChatHistory([{ id: crypto.randomUUID(), type: "system", message: "Welcome to Talki, how can I help you?" }]);
    setError(null);
  };

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
    rec.interimResults = true;
    rec.continuous = true;
    rec.onresult = (e) => {
      const said = Array.from(e.results)
        .map((r) => r[0]?.transcript ?? "")
        .join(" ")
        .trim();
      setText(said);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    window.speechSynthesis?.cancel();
    setListening(true);
    rec.start();
  };

  return (
    <>
      {viewing && (
        <PictoViewer
          pictos={viewing.pictos}
          saved={savedIds.includes(viewing.id)}
          onSave={() => {
            const m = chatHistory.find(msg => msg.id === viewing.id);
            if (m) savePhraseToBackend(m);
          }}
          onClose={() => setViewing(null)}
        />
      )}
      <div className="mx-auto flex h-[calc(100dvh-8.5rem)] max-w-3xl flex-col px-4 md:h-screen md:py-6">
        <div className="flex items-center gap-3 py-4">
          <button
            onClick={onBack}
            aria-label="Back"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted text-brand-deep transition hover:bg-muted/80"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <img src="/talki-isotype.png" alt="Talki" width={436} height={400} className="h-11 w-auto shrink-0" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl text-brand-deep">Talki Chat</h1>
            <p className="text-sm text-muted-foreground">Tips for parents & educators</p>
          </div>
          <button onClick={clearChat} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive transition hover:bg-destructive/20" aria-label="Clear Chat" title="Clear Chat">
            <Trash2 className="h-4 w-4" />
          </button>
          <KidSwitcher />
        </div>

        <Conversation className="flex-1 rounded-3xl">
          <ConversationContent>
            {chatHistory.map((m) => (
              <div key={m.id} className="space-y-2 mb-4">
                {m.type === "user" ? (
                  <Message from="user">
                    <MessageContent className="rounded-2xl group-[.is-user]:bg-brand-blue group-[.is-user]:text-on-brand">
                      {m.message}
                    </MessageContent>
                  </Message>
                ) : (
                  <>
                    {/* System text output (Case 2, 4, or generic message) */}
                    {m.message && m.responseType !== 1 && (
                      <Message from="assistant">
                        <MessageContent>
                          <MessageResponse>{m.message}</MessageResponse>
                        </MessageContent>
                      </Message>
                    )}

                    {/* Type 1: Pictogram phrase output */}
                    {m.phrase && (
                      <div className="mt-2 flex flex-col gap-3 ml-2">
                        <p className="text-sm text-muted-foreground font-semibold">Pictogram translation:</p>
                        <div className="flex flex-wrap gap-2">
                          {[...m.phrase]
                            .sort((a, b) => a.order - b.order)
                            .map((p: any, idx: number) => (
                              <button
                                key={idx}
                                onClick={() => speak(p.word)}
                                className="flex w-24 flex-col items-center justify-center rounded-2xl border-2 border-brand-yellow bg-card p-2 shadow-sm"
                              >
                                {p.pictogram?.url ? (
                                  <img src={p.pictogram.url} alt={p.word} className="h-12 w-12 object-contain" />
                                ) : (
                                  <span className="text-4xl">{p.pictogram?.emoji || "💬"}</span>
                                )}
                                <span className="mt-1 text-xs font-semibold text-brand-deep capitalize text-center">
                                  {p.word}
                                </span>
                              </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const pictos = m.phrase!.sort((a, b) => a.order - b.order).map((p: any) => ({
                                id: p.word,
                                label: p.word,
                                emoji: p.pictogram?.emoji || "💬",
                                url: p.pictogram?.url,
                              }));
                              setViewing({ id: m.id, pictos });
                            }}
                            className="flex items-center gap-1.5 rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-on-brand"
                          >
                            <Maximize2 className="h-4 w-4" /> See
                          </button>
                          <button
                            onClick={() => speak([...m.phrase!].sort((a, b) => a.order - b.order).map((p: any) => p.word).join(" "))}
                            className="flex items-center gap-1.5 rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-on-brand"
                          >
                            <Volume2 className="h-4 w-4" /> Listen
                          </button>
                          <button
                            onClick={() => savePhraseToBackend(m)}
                            disabled={savedIds.includes(m.id)}
                            className="flex items-center gap-1.5 rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-on-brand disabled:opacity-70 disabled:cursor-not-allowed"
                          >
                            {savedIds.includes(m.id) ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                            {savedIds.includes(m.id) ? "Saved" : "Save"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Type 2: Quotes and Sources */}
                    {m.quotes && m.quotes.length > 0 && (
                      <div className="mt-2 flex flex-col gap-2 ml-2">
                        {m.quotes.map((q: any, idx: number) => (
                          <div key={idx} className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground shadow-sm">
                            <p className="italic">"{q.quote}"</p>
                            {q.url && (
                              <a href={q.url} target="_blank" rel="noreferrer" className="mt-3 flex items-center gap-1.5 font-bold text-brand-blue hover:underline">
                                <ExternalLink className="h-4 w-4" /> View Source
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
            {isThinking && <Shimmer>Talki is thinking...</Shimmer>}
            {error && (
              <p className="rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {mode === "voice" ? (
          <>
            <div className="flex flex-col items-center gap-3 py-4">
              <button
                onClick={toggleMic}
                disabled={isThinking}
                aria-label={listening ? "Stop recording" : "Start speaking"}
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
                {listening
                  ? "Listening… tap to stop"
                  : isThinking
                    ? "Talki is answering…"
                    : "Tap and speak"}
              </p>
              <div className="w-full">
                <label
                  htmlFor="voice-text"
                  className="mb-1 block text-sm font-semibold text-brand-deep"
                >
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
                    onClick={() => handleSendMessage(text)}
                    disabled={isThinking || listening || !text.trim()}
                    className="rounded-2xl bg-brand-blue px-4 font-semibold text-on-brand disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="py-3">
            <PromptInput onSubmit={submitText} className="rounded-3xl bg-card">
              <PromptInputTextarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
              />
              <PromptInputFooter className="justify-end">
                <PromptInputSubmit status={isThinking ? "submitted" : "ready"} onStop={() => setIsThinking(false)} disabled={(!text.trim() && !isThinking) || isThinking} />
              </PromptInputFooter>
            </PromptInput>
          </div>
        )}
      </div>
    </>
  );
}

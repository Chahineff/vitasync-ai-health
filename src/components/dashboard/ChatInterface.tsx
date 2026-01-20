import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { PaperPlaneTilt, SpinnerGap, Robot, User, Plus, Trash, ChatCircle } from "@phosphor-icons/react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-coach`;

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content: "Bonjour ! Je suis votre coach santé IA VitaSync. Comment puis-je vous aider aujourd'hui ? N'hésitez pas à me poser des questions sur la nutrition, le sommeil, l'exercice ou tout autre aspect de votre bien-être.",
};

export function ChatInterface() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingConversations(true);
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (!error && data) {
      setConversations(data);
    }
    setIsLoadingConversations(false);
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages for a conversation
  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      const loadedMessages: Message[] = data.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      setMessages(loadedMessages.length > 0 ? loadedMessages : [WELCOME_MESSAGE]);
    }
  };

  // Select a conversation
  const selectConversation = async (conversationId: string) => {
    setCurrentConversationId(conversationId);
    await loadMessages(conversationId);
  };

  // Create new conversation
  const createNewConversation = async () => {
    setCurrentConversationId(null);
    setMessages([WELCOME_MESSAGE]);
  };

  // Delete conversation
  const deleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId);

    if (!error) {
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (currentConversationId === conversationId) {
        createNewConversation();
      }
    }
  };

  // Save message to database
  const saveMessage = async (conversationId: string, role: "user" | "assistant", content: string) => {
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      role,
      content,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !user) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let conversationId = currentConversationId;

    // Create new conversation if needed
    if (!conversationId) {
      const { data: newConv, error } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          title: userMessage.content.slice(0, 50) + (userMessage.content.length > 50 ? "..." : ""),
        })
        .select()
        .single();

      if (error || !newConv) {
        console.error("Failed to create conversation:", error);
        setIsLoading(false);
        return;
      }

      conversationId = newConv.id;
      setCurrentConversationId(conversationId);
      setConversations((prev) => [newConv, ...prev]);
    }

    // Save user message
    await saveMessage(conversationId, "user", userMessage.content);

    let assistantContent = "";

    const upsertAssistant = (nextChunk: string) => {
      assistantContent += nextChunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.role === "user") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || "Erreur de connexion");
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            /* ignore */
          }
        }
      }

      // Save assistant message
      if (assistantContent && conversationId) {
        await saveMessage(conversationId, "assistant", assistantContent);
        
        // Update conversation updated_at
        await supabase
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", conversationId);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Désolé, une erreur s'est produite. Veuillez réessayer dans quelques instants.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-4 h-[600px]">
      {/* Conversations Sidebar */}
      <div className="hidden md:flex flex-col w-64 glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <button
            onClick={createNewConversation}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all"
          >
            <Plus size={18} weight="bold" />
            <span className="text-sm font-medium">Nouvelle conversation</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isLoadingConversations ? (
            <div className="flex items-center justify-center py-8">
              <SpinnerGap size={24} className="animate-spin text-foreground/40" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <ChatCircle size={32} className="text-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-foreground/50">Aucune conversation</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {conversations.map((conv) => (
                <li key={conv.id}>
                  <button
                    onClick={() => selectConversation(conv.id)}
                    className={`w-full group flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${
                      currentConversationId === conv.id
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
                    }`}
                  >
                    <ChatCircle size={16} weight="light" className="flex-shrink-0" />
                    <span className="flex-1 text-sm truncate">{conv.title || "Conversation"}</span>
                    <button
                      onClick={(e) => deleteConversation(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                    >
                      <Trash size={14} />
                    </button>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 glass-card rounded-2xl overflow-hidden flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                  message.role === "user"
                    ? "bg-primary/20"
                    : "bg-gradient-to-br from-primary to-secondary"
                }`}
              >
                {message.role === "user" ? (
                  <User size={16} weight="light" className="text-primary" />
                ) : (
                  <Robot size={16} weight="light" className="text-primary-foreground" />
                )}
              </div>
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-foreground/5"
                }`}
              >
                {message.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/80">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Robot size={16} weight="light" className="text-primary-foreground" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-foreground/5">
                <SpinnerGap size={20} className="animate-spin text-foreground/50" />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-border/50">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl bg-foreground/5 border-0 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperPlaneTilt size={20} weight="light" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

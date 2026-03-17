import { useEffect, useRef, useState } from "react";
import { auth } from "../../firebase/config";
import {
  getChatMessages,
  saveChatMessage,
  clearChatMessages,
} from "../../features/student/services/chatHistoryService";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function StudyAssistant({
  moduleId,
  moduleTitle,
  materialTitle,
  materialContent,
  compact = false,
}) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I’m your study assistant. Ask me to explain this lesson, summarize it, or generate quiz questions.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesRef = useRef(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoadingHistory(true);

        const user = auth.currentUser;
        if (!user || !moduleId) return;

        const savedMessages = await getChatMessages(user.uid, moduleId);

        if (savedMessages.length > 0) {
          setMessages(savedMessages.map(({ role, content, id }) => ({ role, content, id })));
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, [moduleId]);

  const handleQuickPrompt = (prompt) => {
    setInput(prompt);
  };

  const handleClearChat = async () => {
    try {
      const user = auth.currentUser;
      if (!user || !moduleId) return;

      await clearChatMessages(user.uid, moduleId, messages.filter((m) => m.id));

      setMessages([
        {
          role: "assistant",
          content:
            "Hi, I’m your study assistant. Ask me to explain this lesson, summarize it, or generate quiz questions.",
        },
      ]);
    } catch (error) {
      console.error("Failed to clear chat:", error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();

    const text = input.trim();
    if (!text || sending) return;

    const user = auth.currentUser;
    const userMessage = { role: "user", content: text };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setSending(true);

    try {
      if (user && moduleId) {
        await saveChatMessage(user.uid, moduleId, userMessage);
      }

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          moduleTitle,
          materialTitle,
          materialContent,
          chatHistory: updatedMessages.slice(0, -1),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to get chatbot response.");
      }

      const assistantMessage = {
        role: "assistant",
        content: data.reply || "No response generated.",
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (user && moduleId) {
        await saveChatMessage(user.uid, moduleId, assistantMessage);
      }
    } catch (error) {
      console.error("Chatbot error:", error);

      const fallbackMessage = {
        role: "assistant",
        content:
          "The AI assistant is unavailable right now. Please make sure the backend server and Ollama are running.",
      };

      setMessages((prev) => [...prev, fallbackMessage]);

      if (user && moduleId) {
        await saveChatMessage(user.uid, moduleId, fallbackMessage);
      }
    } finally {
      setSending(false);

      requestAnimationFrame(() => {
        if (messagesRef.current) {
          messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
      });
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col ${
        compact ? "h-full min-h-0" : "min-h-[620px]"
      }`}
    >
      <div className="px-5 py-4 border-b border-slate-200">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Study Assistant</h3>
            <p className="text-sm text-slate-500 mt-1">
              {materialTitle
                ? `Helping with ${materialTitle}`
                : "Ask questions about this module"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClearChat}
            className="px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
          >
            Clear Chat
          </button>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleQuickPrompt("Explain this lesson in simple words.")}
          className="px-3 py-2 rounded-full text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
        >
          Explain Simply
        </button>
        <button
          type="button"
          onClick={() => handleQuickPrompt("Summarize this material.")}
          className="px-3 py-2 rounded-full text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
        >
          Summarize
        </button>
        <button
          type="button"
          onClick={() => handleQuickPrompt("Give me 5 quiz questions from this lesson.")}
          className="px-3 py-2 rounded-full text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
        >
          Quiz Me
        </button>
      </div>

      <div
        ref={messagesRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/70 min-h-0"
      >
        {loadingHistory ? (
          <div className="text-sm text-slate-500">Loading chat history...</div>
        ) : (
          messages.map((message, index) => {
            const isUser = message.role === "user";

            return (
              <div
                key={message.id || `${message.role}-${index}`}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm whitespace-pre-wrap ${
                    isUser
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-700 border border-slate-200"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            );
          })
        )}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-500 border border-slate-200 rounded-2xl px-4 py-3 text-sm shadow-sm">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-slate-200">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this lesson..."
            rows={compact ? 2 : 3}
            className="flex-1 resize-none rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="self-end bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 rounded-2xl text-sm font-medium transition"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
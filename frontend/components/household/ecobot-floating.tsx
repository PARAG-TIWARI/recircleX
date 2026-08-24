"use client";

import { useState } from "react";
import { Bot, X, Send, Sparkles, MessageCircle } from "lucide-react";
import { aiApi } from "@/lib/api/ai";

export function EcoBotFloating() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "bot"; text: string }>>([
    {
      role: "bot",
      text: "Hello! I am EcoBot. Ask me anything about recyclable materials, scrap prices, or pickup procedures!",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (userQuery?: string) => {
    const textToSend = userQuery || query;
    if (!textToSend.trim() || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", text: textToSend }]);
    setQuery("");
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));
      const res = await aiApi.queryEcoBot(textToSend, history);
      setMessages((prev) => [...prev, { role: "bot", text: res.answer }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "I am ready to help! RecycleX accepts plastics, metals, paper, e-waste, and glass." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-5 py-3.5 shadow-xl hover:shadow-2xl transition-all font-black text-xs group"
      >
        <Bot className="h-5 w-5 transition-transform group-hover:rotate-12" />
        <span className="hidden sm:inline">Ask EcoBot AI</span>
        <span className="h-2 w-2 rounded-full bg-emerald-300 animate-ping" />
      </button>

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[520px] animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="bg-emerald-600 text-white p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-xs">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight">EcoBot AI Assistant</h3>
                <p className="text-[10px] text-emerald-100 font-medium">RecycleX Real-Time Recycling Intelligence</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-xl p-1.5 text-emerald-100 hover:text-white hover:bg-emerald-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed font-medium ${
                    m.role === "user"
                      ? "bg-emerald-600 text-white rounded-br-xs shadow-xs"
                      : "bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-2xs"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs flex items-center gap-2 text-slate-500 font-medium">
                  <div className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>EcoBot is analyzing your request...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions */}
          <div className="p-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => handleSend("What is the current scrap rate for PET plastic?")}
              className="text-[10px] font-bold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 px-3 py-1 rounded-full whitespace-nowrap transition-colors"
            >
              PET Plastic Rates
            </button>
            <button
              onClick={() => handleSend("How does doorstep pickup work?")}
              className="text-[10px] font-bold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 px-3 py-1 rounded-full whitespace-nowrap transition-colors"
            >
              Pickup Process
            </button>
            <button
              onClick={() => handleSend("What materials can I recycle?")}
              className="text-[10px] font-bold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 px-3 py-1 rounded-full whitespace-nowrap transition-colors"
            >
              Accepted Items
            </button>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about materials, prices, pickup..."
              className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 transition-colors font-bold flex items-center justify-center shadow-xs"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

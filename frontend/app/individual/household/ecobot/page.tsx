"use client";

import { useState } from "react";
import { Bot, Send, Sparkles, HelpCircle, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HouseholdNav } from "@/components/household/household-nav";
import { Badge } from "@/components/ui/badge";
import { aiApi } from "@/lib/api/ai";

export default function EcoBotPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "bot"; text: string }>>([
    {
      role: "bot",
      text: "Namaste! I am EcoBot, your AI recycling guide. I can answer questions about which scrap materials are recyclable, how to segregate waste, current rates, and doorstep collection procedures. How can I help you today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const SUGGESTIONS = [
    "What materials does RecircleX accept?",
    "Is glossy cardboard or pizza box recyclable?",
    "What happens after I request a doorstep pickup?",
    "How are scrap prices calculated?",
    "How should I prepare plastic bottles for collection?",
  ];

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || query;
    if (!prompt.trim() || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", text: prompt }]);
    setQuery("");
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));
      const res = await aiApi.queryEcoBot(prompt, history);
      setMessages((prev) => [...prev, { role: "bot", text: res.answer }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "RecircleX accepts plastics (PET, HDPE), metals (copper, aluminium, iron), paper (corrugated, books, newsprint), e-waste, and glass bottles. You can create a listing anytime!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between pb-16 md:pb-0">
      <Navbar />
      <HouseholdNav />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-sm">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900">EcoBot AI Assistant</h1>
                <Badge variant="brand" className="text-[10px] bg-emerald-100 text-emerald-800 border-none">
                  Online
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Instant guidance on recycling segregation, material guidelines, and doorstep collection.
              </p>
            </div>
          </div>
        </div>

        {/* Chat Box Container */}
        <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col h-[520px]">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-emerald-600 text-white rounded-br-none shadow-xs"
                      : "bg-white border border-slate-200 text-slate-900 rounded-bl-none shadow-2xs"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-3xl p-3.5 shadow-2xs flex items-center gap-2 text-xs text-slate-500">
                  <div className="h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
                  <span>EcoBot is researching recycling guidelines...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick FAQ Pills */}
          <div className="p-3 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto scrollbar-none">
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-4 bg-white border-t border-slate-200 flex gap-3"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask any question about waste, recycling, or pickups..."
              className="flex-1 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-3 font-bold text-xs shadow-sm transition-all flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

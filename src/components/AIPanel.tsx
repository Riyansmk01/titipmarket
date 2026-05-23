import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { Bot, Sparkles, Send, Loader2, ArrowRight, Eye } from 'lucide-react';

interface AIPanelProps {
  onSelectProduct: (product: Product) => void;
}

interface RecommendedEnrichedProduct extends Product {
  aiReason?: string;
}

export default function AIPanel({ onSelectProduct }: AIPanelProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [smartAdvice, setSmartAdvice] = useState<string>('');
  const [recommendations, setRecommendations] = useState<RecommendedEnrichedProduct[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          userPreferences: 'Prefers ultra shiny products with 3D glass surfaces'
        }),
      });
      const data = await res.json();
      setSmartAdvice(data.smartAdvice || "Focus on items featuring glowing neon accent structures.");
      setRecommendations(data.recommendations || []);
      setHasSearched(true);
    } catch (err) {
      console.error('Error fetching AI recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "I want active sneakers with high-tech cushions",
    "Gimme items designed by Neon Labs 3D",
    "Recommend neon accessories under 5 million Rp"
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 lg:p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-orange-500/20 rounded-2xl border border-orange-500/30 text-orange-400">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display tracking-tight flex items-center gap-2">
              Gemini AI Shopping Assistant
              <span className="text-[10px] bg-indigo-500 text-indigo-50 font-mono tracking-widest px-2 py-0.5 rounded-full uppercase">
                Active Grounding
              </span>
            </h2>
            <p className="text-slate-300 text-xs">Find exactly what matches your premium hardware cravings.</p>
          </div>
        </div>

        <form onSubmit={handleAskAI} className="relative mt-5">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your style preference (e.g. 'I want durable jacket mesh wear with cool luminescent style')"
            className="w-full pl-5 pr-12 py-4 bg-slate-900/90 text-slate-100 placeholder-slate-400 border border-slate-700/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/80 text-sm transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-2 p-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white transition-all duration-200"
          >
            {loading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Send className="w-4.5 h-4.5" />}
          </button>
        </form>

        {/* Suggested Prompts */}
        {!hasSearched && !loading && (
          <div className="mt-4">
            <p className="text-slate-400 text-xs font-medium mb-2 flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" /> SUGGESTED AI PROMPTS:
            </p>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => { setQuery(p); }}
                  className="text-xs bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 text-slate-200 px-3.5 py-1.5 rounded-xl transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Stream */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 p-4 rounded-2xl bg-slate-850/50 border border-slate-800 flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              <p className="text-sm text-slate-300 font-mono animate-pulse">Running neural catalog grounding engine...</p>
            </motion.div>
          )}

          {hasSearched && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 space-y-5"
            >
              {/* Intelligent Advice Paragraph */}
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                <p className="text-xs font-bold font-mono tracking-wider uppercase text-amber-400 mb-1">RECOMMENDER ADVICE</p>
                <p className="text-sm text-slate-150 leading-relaxed italic">
                  &ldquo;{smartAdvice}&rdquo;
                </p>
              </div>

              {/* Product recommendations with explainers */}
              <div>
                <p className="text-xs font-bold font-mono text-slate-400 mb-3 uppercase tracking-widest">
                  AI RECOMMENDED MATCHES ({recommendations.length})
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => onSelectProduct(prod)}
                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-orange-500/40 cursor-pointer hover:bg-slate-850 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Recommendation explain badge */}
                        <div className="flex items-start gap-3 mb-2">
                          <img
                            src={prod.images[0]}
                            alt={prod.title}
                            className="w-12 h-12 rounded-xl object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h4 className="text-sm font-semibold text-slate-100 group-hover:text-orange-400 transition-colors">
                              {prod.title}
                            </h4>
                            <span className="text-xs font-semibold text-orange-400">
                              Rp {prod.price.toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>

                        {/* AI narrative */}
                        <p className="text-xs text-slate-300 bg-slate-800/60 rounded-lg p-2.5 mt-2 line-clamp-3">
                          💡 <span className="text-slate-200 font-medium font-mono">MATCH FIT: </span>
                          {prod.aiReason || "Perfect match for your cyberwear setup based on design density."}
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-1 text-xs text-orange-400 font-semibold mt-3 pt-2 border-t border-slate-800 group-hover:gap-2 transition-all">
                        View Item Details <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { Play, Pause, SkipBack, SkipForward, Volume2, Mic2, Info, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

interface ScriptPart {
  speaker: 'Male Host' | 'Female Host' | 'System';
  text: string;
  mood?: string;
  tone?: string;
}

const PODCAST_SCRIPT: ScriptPart[] = [
  { speaker: 'Male Host', text: "Welcome to Human in the Loop. In this space, we examine the intersection of artificial intelligence, power, and human responsibility. Not from a place of hype. Not from fear. But from deliberate inquiry. Because the world is changing faster than our institutions can adapt, and somewhere inside that acceleration lies a question that refuses to go away — who governs intelligence when intelligence itself becomes strategic infrastructure?" },
  { speaker: 'Female Host', text: "And that question is no longer theoretical. It lives inside defense contracts, inside classified briefings, inside negotiations between governments and AI companies. When systems once built for research labs begin influencing military doctrine and national security decisions, the stakes move beyond innovation. They enter the realm of sovereignty, ethics, and long-term global stability. That is the conversation we are stepping into today." },
  { speaker: 'Male Host', text: "Let’s begin with the confrontation that sparked this debate. Anthropic reportedly drew two red lines — no domestic mass surveillance, and no fully autonomous lethal weapons. On the surface, those principles sound almost obvious. But what happens when those principles collide with military operational doctrine? Should a private AI company be able to restrict how a sovereign nation defends itself? Or does national security override corporate ethics when geopolitical tensions escalate?" },
  { speaker: 'Female Host', text: "That’s precisely where the discomfort begins. Because ethics are easy to defend in peacetime and far more complicated during conflict. The Pentagon’s position, at least from a strategic lens, is rooted in preparedness. If adversaries are advancing autonomous systems, refusing to explore similar capabilities could appear reckless. Yet if companies surrender their ethical boundaries entirely, we risk normalizing systems that remove human judgment from the most consequential decisions imaginable. The tension is not simplistic. It’s deeply human." },
  { speaker: 'Male Host', text: "And then the escalation. A supply-chain risk designation. That isn’t symbolic language. It’s leverage. It’s a reminder that governments possess structural power over procurement and access. They don’t need to seize servers or rewrite code. They simply need to close doors. When that happens, the debate shifts from moral philosophy to survival strategy. Is this negotiation? Or pressure?" },
  { speaker: 'Female Host', text: "It can be both. Governments operate under existential logic — they must preserve sovereignty. AI companies operate under reputational and long-term trust logic. When those logics collide, each side believes it is acting rationally. But rationality doesn’t erase consequence. The broader concern is whether technological power becomes so essential that ethical negotiation becomes symbolic rather than substantive." },
  { speaker: 'Male Host', text: "Then OpenAI signs a deal to deploy models on a classified Defense Department network. Same military. Different outcome. So what changed? Did OpenAI negotiate more effectively? Did it accept narrower definitions of restriction? Or is the difference strategic positioning — integration instead of resistance?" },
  { speaker: 'Female Host', text: "Without access to contracts, we’re left interpreting signals. But here’s the deeper question — does integration allow influence from within, or does it gradually normalize expanded use? Safeguards on paper are only as strong as their enforcement mechanisms. And in classified environments, public visibility disappears. That opacity creates anxiety. Not because wrongdoing is proven, but because oversight becomes abstract." },
  { speaker: 'Male Host', text: "And then there’s the phrase that everyone repeats — human in the loop. It sounds reassuring. It sounds humane. But what does it truly mean when decisions unfold at machine speed? Does a human meaningfully deliberate? Or merely supervise a system that acts unless interrupted?" },
  { speaker: 'Female Host', text: "That distinction matters profoundly. Oversight that exists only in theory does not preserve accountability. But neither does fear-driven paralysis. Militaries value speed because speed can prevent loss. Yet the faster decisions move, the thinner deliberation becomes. The ethical challenge is not about rejecting technology outright. It’s about ensuring that human judgment remains consequential — not ceremonial." },
  { speaker: 'Male Host', text: "Now we arrive at the question circulating across media and online discourse. Was generative AI — systems like Claude or OpenAI models — used in the recent U.S.–Iran strikes where the Supreme Leader was killed? Based on credible public reporting, there is no confirmed evidence that generative AI directly planned or executed those strikes. Conventional aircraft, missiles, drones, and established intelligence channels are what have been described." },
  { speaker: 'Female Host', text: "But we must be precise. The absence of public confirmation does not equate to proof of absence. Military operations are highly classified. Advanced analytics, machine learning, and data fusion systems have been used in defense contexts before. It is entirely plausible that AI assisted intelligence synthesis or simulation behind closed doors. That does not mean it replaced human decision-making. It means the boundary between assistance and autonomy may already be thinner than we publicly acknowledge." },
  { speaker: 'Male Host', text: "And here is the thought that lingers. If AI has already been deployed in certain classified operations elsewhere, then the integration of frontier models into military ecosystems is not speculative — it is incremental. What if some of the most powerful AI systems are not the ones we access through chat interfaces, but the ones embedded quietly inside defense networks, analyzing satellite feeds, intercepts, predictive models?" },
  { speaker: 'Female Host', text: "We have no proof that such systems shaped this specific strike. But history teaches us that transformative technologies often operate in classified environments long before public acknowledgment. If AI is already deeply woven into intelligence fusion pipelines, then the revolution is not approaching — it may already be underway. And the public might only learn about it years later, in declassified documents. Or perhaps not at all." },
  { speaker: 'Male Host', text: "This conversation is not about paranoia. It is about responsibility. Intelligence is no longer just software. It is infrastructure. And infrastructure shapes power." },
  { speaker: 'Female Host', text: "The future of artificial intelligence will be shaped not only by engineers, but by policy makers, military leaders, corporate boards, and informed citizens. That is why conversations like this matter." },
  { speaker: 'Male Host', text: "Until next time—" },
  { speaker: 'Female Host', text: "Stay analytical." },
  { speaker: 'Male Host', text: "Stay critical." },
  { speaker: 'Female Host', text: "And keep humans in the loop." },
];

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    generatePodcast();
  }, []);

  const generatePodcast = async () => {
    if (audioUrl) return;

    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Construct the prompt for multi-speaker TTS
      const prompt = PODCAST_SCRIPT.map(p => `${p.speaker}: ${p.text}`).join('\n\n');

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                {
                  speaker: 'Male Host',
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' } // Authoritative, grounded
                  }
                },
                {
                  speaker: 'Female Host',
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Puck' } // Sharp, analytical
                  }
                }
              ]
            }
          }
        }
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioBlob = await fetch(`data:audio/pcm;rate=24000;base64,${base64Audio}`).then(res => res.blob());
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      }
    } catch (error) {
      console.error("Failed to generate podcast audio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Simple simulation of script progress based on audio time
  // Note: Real word-level sync would require timestamps from the API
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const progress = audio.currentTime / audio.duration;
      const index = Math.min(
        Math.floor(progress * PODCAST_SCRIPT.length),
        PODCAST_SCRIPT.length - 1
      );
      setCurrentPartIndex(index);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => audio.removeEventListener('timeupdate', handleTimeUpdate);
  }, [audioUrl]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 font-sans">
      <div className="atmosphere" />
      
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl flex justify-between items-center mb-12"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/20">
            <Mic2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Human in the Loop</h1>
            <p className="text-xs text-white/40 uppercase tracking-widest font-mono">Investigative Series</p>
          </div>
        </div>
        <button className="p-2 rounded-full hover:bg-white/5 transition-colors">
          <Info className="w-5 h-5 text-white/60" />
        </button>
      </motion.header>

      {/* Main Content */}
      <main className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Cover & Info */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-5 space-y-6"
        >
          <div className="aspect-square rounded-2xl overflow-hidden glass-panel relative group">
            <img 
              src="https://picsum.photos/seed/pentagon/800/800" 
              alt="Podcast Cover" 
              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="px-2 py-1 rounded bg-orange-600 text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">New Episode</span>
              <h2 className="text-2xl font-serif italic leading-tight">Pentagon vs Anthropic — AI, War, and the Classified Unknown</h2>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40 uppercase tracking-widest font-mono">Hosts</span>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-[10px] font-bold">M</div>
                <div className="w-8 h-8 rounded-full border-2 border-black bg-zinc-700 flex items-center justify-center text-[10px] font-bold">F</div>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed font-serif italic">
              "Who governs intelligence when intelligence itself becomes strategic infrastructure?"
            </p>
          </div>
        </motion.div>

        {/* Right Column: Transcript & Player */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-7 flex flex-col h-[600px]"
        >
          {/* Transcript Viewport */}
          <div className="flex-1 lyric-viewport overflow-y-auto pr-4 space-y-8 scroll-smooth py-12">
            {PODCAST_SCRIPT.map((part, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0.2 }}
                animate={{ 
                  opacity: currentPartIndex === idx ? 1 : 0.2,
                  scale: currentPartIndex === idx ? 1 : 0.98
                }}
                className={`space-y-2 transition-all duration-500 ${currentPartIndex === idx ? 'text-white' : 'text-white/40'}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded ${part.speaker === 'Male Host' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                    {part.speaker}
                  </span>
                </div>
                <p className="text-lg md:text-xl font-serif leading-relaxed">
                  {part.text}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Player Controls */}
          <div className="glass-panel rounded-3xl p-6 mt-6">
            <div className="space-y-6">
              {/* Progress Bar (Simulated) */}
              <div className="space-y-2">
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-orange-600"
                    initial={{ width: 0 }}
                    animate={{ width: audioRef.current ? `${(audioRef.current.currentTime / audioRef.current.duration) * 100}%` : '0%' }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-white/40">
                  <span>{audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'}</span>
                  <span>{audioRef.current ? formatTime(audioRef.current.duration) : '0:00'}</span>
                </div>
              </div>

              {/* Main Buttons */}
              <div className="flex items-center justify-between">
                <button className="p-2 text-white/40 hover:text-white transition-colors">
                  <SkipBack className="w-6 h-6" />
                </button>
                
                <button 
                  onClick={togglePlay}
                  disabled={isLoading}
                  className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-8 h-8 fill-current" />
                  ) : (
                    <Play className="w-8 h-8 fill-current ml-1" />
                  )}
                </button>

                <button className="p-2 text-white/40 hover:text-white transition-colors">
                  <SkipForward className="w-6 h-6" />
                </button>
              </div>

              {/* Secondary Controls */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-white/40">
                  <Volume2 className="w-4 h-4" />
                  <div className="w-20 h-1 bg-white/10 rounded-full">
                    <div className="w-2/3 h-full bg-white/40 rounded-full" />
                  </div>
                </div>
                <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                  {isLoading ? "Generating AI Audio..." : isPlaying ? "Now Playing" : "Ready to Listen"}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Hidden Audio Element */}
      {audioUrl && (
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      {/* Footer */}
      <footer className="mt-12 text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">
        &copy; 2026 Human in the Loop &bull; Classified Intelligence Series
      </footer>
    </div>
  );
}

function formatTime(seconds: number) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

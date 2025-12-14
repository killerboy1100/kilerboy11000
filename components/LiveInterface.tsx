import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, Radio, Activity } from 'lucide-react';
import { getGeminiClient } from '../services/geminiService';
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from '../utils/audioUtils';
import { LiveServerMessage, Modality } from '@google/genai';
import { LIVE_MODEL } from '../constants';

const LiveInterface: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Audio Contexts & Refs
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const cleanup = () => {
    // Stop all audio sources
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    sourcesRef.current.clear();

    // Close contexts
    if (inputContextRef.current) {
      inputContextRef.current.close();
      inputContextRef.current = null;
    }
    if (outputContextRef.current) {
      outputContextRef.current.close();
      outputContextRef.current = null;
    }

    // Stop tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Disconnect processor
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
    }
    if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
    }

    // Close session if possible (wrapper doesn't expose close easily on promise, 
    // but typically we let it GC or rely on connection drop)
    // In a real app we would call session.close() if we stored the resolved session.
    sessionRef.current?.then(session => {
        try { session.close(); } catch(e) {}
    });
    sessionRef.current = null;

    setIsActive(false);
    setIsConnecting(false);
    setVolume(0);
  };

  const startSession = async () => {
    setError(null);
    setIsConnecting(true);

    try {
      // 1. Initialize Audio Contexts
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      // 2. Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 3. Connect to Gemini Live
      const ai = getGeminiClient();
      
      const sessionPromise = ai.live.connect({
        model: LIVE_MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: "You are a helpful and friendly AI assistant. Keep responses concise and conversational.",
        },
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Connected');
            setIsConnecting(false);
            setIsActive(true);
            
            // Setup Audio Processing for Input
            if (!inputContextRef.current || !streamRef.current) return;
            
            const source = inputContextRef.current.createMediaStreamSource(streamRef.current);
            sourceNodeRef.current = source;
            
            const processor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              // Calculate volume for visualization
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
              const rms = Math.sqrt(sum / inputData.length);
              setVolume(Math.min(rms * 10, 1)); // Amplify for visual

              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(processor);
            processor.connect(inputContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (!outputContextRef.current) return;

            // Handle Audio Output
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              const ctx = outputContextRef.current;
              // Ensure gapless playback
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(
                base64ToUint8Array(audioData),
                ctx
              );
              
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            console.log('Session closed');
            cleanup();
          },
          onerror: (e) => {
            console.error('Session error', e);
            setError('Connection error occurred.');
            cleanup();
          }
        }
      });

      sessionRef.current = sessionPromise;

    } catch (err) {
      console.error('Failed to start session:', err);
      setError('Failed to access microphone or connect.');
      cleanup();
    }
  };

  useEffect(() => {
    return () => cleanup();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-white relative overflow-hidden">
      {/* Background Pulse Effect */}
      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center z-0">
           <div className="w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>
      )}

      <div className="z-10 flex flex-col items-center gap-8">
        <div className="relative">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
            isActive ? 'bg-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.3)]' : 'bg-slate-800'
          }`}>
             {isActive ? (
                // Visualizer Rings
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-red-500/30 animate-[ping_2s_linear_infinite]" style={{ animationDelay: '0s' }}></div>
                  <div className="absolute inset-0 rounded-full border-2 border-red-500/30 animate-[ping_2s_linear_infinite]" style={{ animationDelay: '0.6s' }}></div>
                  <Activity size={48} className="text-red-500 animate-pulse" />
                </>
             ) : (
                <Radio size={48} className="text-slate-500" />
             )}
          </div>
          
          {/* Active Status Badge */}
          {isActive && (
             <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
               Live
             </div>
          )}
        </div>

        <div className="text-center space-y-2">
           <h2 className="text-3xl font-bold tracking-tight">Gemini Live</h2>
           <p className="text-slate-400 max-w-sm">
             {isConnecting ? 'Establishing secure connection...' : 
              isActive ? 'Listening... Speak naturally.' : 
              'Experience real-time, low-latency voice conversations.'}
           </p>
           {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        <button
          onClick={isActive ? cleanup : startSession}
          disabled={isConnecting}
          className={`flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 active:scale-95 ${
            isActive 
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/30' 
              : 'bg-white text-slate-900 hover:bg-slate-200 shadow-lg shadow-white/10'
          }`}
        >
          {isConnecting ? (
            <>Connecting...</>
          ) : isActive ? (
            <>
              <MicOff size={24} />
              End Session
            </>
          ) : (
            <>
              <Mic size={24} />
              Start Conversation
            </>
          )}
        </button>
      </div>

      {/* Volume Indicator Bar (Simple) */}
      {isActive && (
         <div className="absolute bottom-12 w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500 transition-all duration-75 ease-out"
              style={{ width: `${Math.min(volume * 100, 100)}%` }}
            ></div>
         </div>
      )}
    </div>
  );
};

export default LiveInterface;

"use client";

import { useCallback, useRef, useEffect } from "react";

// Enhanced TypeScript declarations for better mobile support
interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  grammars: unknown;
  serviceURI: string | null;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognitionInterface, ev: Event) => void) | null;
  onend: ((this: SpeechRecognitionInterface, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInterface, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionInterface, ev: SpeechRecognitionErrorEvent) => void) | null;
  onaudiostart: ((this: SpeechRecognitionInterface, ev: Event) => void) | null;
  onaudioend: ((this: SpeechRecognitionInterface, ev: Event) => void) | null;
  onspeechstart: ((this: SpeechRecognitionInterface, ev: Event) => void) | null;
  onspeechend: ((this: SpeechRecognitionInterface, ev: Event) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognitionInterface;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognitionInterface;
    };
    webkitAudioContext: typeof AudioContext;
  }
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface VoiceRecognitionManagerProps {
  locale: string;
  isEnding: boolean;
  isSpeaking: boolean;
  conversationActive: boolean;
  autoListenMode: boolean;
  onListeningStart: () => void;
  onListeningEnd: () => void;
  onTranscript: (transcript: string) => void;
  onError: (error: string) => void;
  onAudioLevel: (level: number) => void;
}

export default function useVoiceRecognitionManager({
  locale,
  isEnding,
  isSpeaking,
  conversationActive,
  autoListenMode,
  onListeningStart,
  onListeningEnd,
  onTranscript,
  onError,
  onAudioLevel
}: VoiceRecognitionManagerProps) {
  
  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRecognitionActiveRef = useRef(false);
  const lastSpeechTimeRef = useRef<number>(0);
  const initializationAttempts = useRef(0);
  const isInitializingRef = useRef(false);

  // Check browser compatibility with detailed mobile detection
  const checkBrowserCompatibility = useCallback(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = userAgent.includes('android');
    const isChrome = userAgent.includes('chrome');
    const isSamsung = userAgent.includes('samsung');
    const isFirefox = userAgent.includes('firefox');
    
    console.log('🎤 Browser detection:', { userAgent, isAndroid, isChrome, isSamsung, isFirefox });
    
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.log('❌ Speech recognition not supported');
      return { supported: false, reason: 'Speech recognition not available in this browser' };
    }
    
    // Special handling for known problematic combinations
    if (isFirefox) {
      console.log('⚠️ Firefox detected - limited speech recognition support');
      return { supported: false, reason: 'Please use Chrome, Safari, or Samsung Internet for voice features' };
    }
    
    console.log('✅ Speech recognition supported');
    return { supported: true, reason: null };
  }, []);

  // Enhanced audio visualization with mobile optimizations
  const startAudioVisualization = useCallback(() => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateAudioLevel = () => {
      if (!analyserRef.current || !isRecognitionActiveRef.current) return;
      
      try {
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average volume level with mobile optimization
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalizedLevel = Math.min(average / 100, 1); // More sensitive for mobile
        
        onAudioLevel(normalizedLevel);
        
        // Continue animation if still listening
        if (isRecognitionActiveRef.current) {
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      } catch (error) {
        console.log('🎤 Audio visualization error:', error);
      }
    };

    updateAudioLevel();
  }, [onAudioLevel]);

  // MOBILE-OPTIMIZED speech recognition initialization
  const initializeRecognition = useCallback(() => {
    if (isInitializingRef.current || recognitionRef.current) {
      console.log('🎤 Recognition already initializing or exists');
      return;
    }

    isInitializingRef.current = true;
    initializationAttempts.current++;

    console.log(`🎤 Initializing recognition (attempt ${initializationAttempts.current})`);

    // Check compatibility first
    const compatibility = checkBrowserCompatibility();
    if (!compatibility.supported) {
      onError(compatibility.reason || 'Voice recognition not supported');
      isInitializingRef.current = false;
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      // MOBILE-OPTIMIZED SETTINGS
      recognition.continuous = true; // Keep listening
      recognition.interimResults = true; // Show real-time results
      recognition.maxAlternatives = 1; // Reduce processing overhead
      
      // Enhanced language support for mobile
      const languageMap = {
        'ar': 'ar-SA',
        'fr': 'fr-FR', 
        'en': 'en-US'
      };
      recognition.lang = languageMap[locale as keyof typeof languageMap] || 'en-US';
      
      console.log('🎤 Recognition configured with language:', recognition.lang);

      // Enhanced event handlers for mobile reliability
      recognition.onstart = () => {
        console.log('🎤 Recognition started successfully');
        onListeningStart();
        isRecognitionActiveRef.current = true;
        lastSpeechTimeRef.current = Date.now();
        isInitializingRef.current = false;
        
        // Set appropriate silence timeout for mobile
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        silenceTimeoutRef.current = setTimeout(() => {
          console.log('⏰ Silence timeout - stopping recognition');
          if (recognitionRef.current && isRecognitionActiveRef.current) {
            try {
              recognitionRef.current.stop();
            } catch (error) {
              console.log('Recognition stop error:', error);
            }
          }
        }, 10000); // 10 seconds for mobile
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        console.log('🎤 Recognition result received');
        lastSpeechTimeRef.current = Date.now();
        
        // Reset silence timeout on speech
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = setTimeout(() => {
            console.log('⏰ Silence timeout after speech');
            if (recognitionRef.current && isRecognitionActiveRef.current) {
              try {
                recognitionRef.current.stop();
              } catch (error) {
                console.log('Recognition stop error:', error);
              }
            }
          }, 3000); // 3 seconds after speech
        }
        
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          
          if (result.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Show interim results for better UX
        if (interimTranscript) {
          console.log('🎤 Interim:', interimTranscript);
        }
        
        // Process final transcript
        if (finalTranscript.trim()) {
          console.log('✅ Final transcript:', finalTranscript);
          onTranscript(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.log('🚫 Recognition error:', event.error, event.message);
        isRecognitionActiveRef.current = false;
        isInitializingRef.current = false;
        
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        
        // Enhanced error handling for mobile
        switch (event.error) {
          case 'no-speech':
            console.log('📱 No speech detected');
            // Don't show error for no-speech on mobile - it's normal
            onListeningEnd();
            break;
          case 'aborted':
            console.log('📱 Recognition aborted');
            onListeningEnd();
            break;
          case 'not-allowed':
            onError("🎤 Microphone access denied. Please check browser settings and try again.");
            break;
          case 'network':
            onError("🎤 Network error. Please check your connection and try again.");
            break;
          case 'service-not-allowed':
            onError("🎤 Speech service not available. Please try again later.");
            break;
          default:
            // MOBILE FIX: Force complete restart on unknown errors
            console.log('🔄 Unknown error - forcing complete restart for mobile...');
            
            // Clean up everything
            if (recognitionRef.current) {
              try {
                recognitionRef.current.abort();
              } catch (e) {
                console.log('Error cleanup:', e);
              }
              recognitionRef.current = null;
            }
            
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
              streamRef.current = null;
            }
            
            // Reset all states
            isRecognitionActiveRef.current = false;
            isInitializingRef.current = false;
            initializationAttempts.current = 0;
            
            // Only retry if still in conversation and not too many attempts
            if (conversationActive && initializationAttempts.current < 3) {
              console.log('🔄 Retrying with fresh mobile setup...');
              setTimeout(() => {
                if (!isEnding && !isSpeaking && conversationActive) {
                  initializeRecognition();
                  setTimeout(() => startListening(), 1000);
                }
              }, 2000);
              return;
            } else {
              onError(`🎤 Voice recognition error: ${event.error}. Please refresh and try again.`);
            }
        }
        onListeningEnd();
      };

      recognition.onend = () => {
        console.log('🎤 Recognition ended');
        isRecognitionActiveRef.current = false;
        isInitializingRef.current = false;
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        onListeningEnd();
      };

      // Additional mobile-specific events
      recognition.onaudiostart = () => {
        console.log('🎤 Audio input started');
      };

      recognition.onaudioend = () => {
        console.log('🎤 Audio input ended');
      };

      recognitionRef.current = recognition;
      console.log('🎤 Recognition initialized successfully');

    } catch (error) {
      console.error('🎤 Recognition initialization failed:', error);
      isInitializingRef.current = false;
      onError("🎤 Could not initialize voice recognition. Please refresh and try again.");
    }
  }, [locale, checkBrowserCompatibility, onListeningStart, onListeningEnd, onTranscript, onError, conversationActive, isEnding, isSpeaking]);

  // MOBILE-OPTIMIZED start listening with enhanced permission handling
  const startListening = useCallback(async () => {
    // CRITICAL: Check if already active
    if (isRecognitionActiveRef.current) {
      console.log('🚫 Recognition already active, skipping start');
      return;
    }

    if (isEnding || isSpeaking) {
      console.log('🚫 Not starting listening - ending or speaking');
      return;
    }

    console.log('🎤 Starting to listen...');
    onError('');
    
    // Stop any existing speech synthesis
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    // MOBILE FIX: Always recreate recognition for mobile browsers
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /iphone|ipad|ipod|android/.test(userAgent);
    
    if (isMobile || !recognitionRef.current) {
      console.log('📱 Mobile detected or no recognition - creating fresh instance');
      // Clean up existing recognition first
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.log('Previous recognition cleanup:', e);
        }
        recognitionRef.current = null;
      }
      
      initializeRecognition();
      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    // ANDROID CHROME FIX: Request microphone permissions explicitly
    try {
      console.log('📱 Requesting microphone permissions explicitly...');
      
      // Always request fresh stream for mobile browsers
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Enhanced microphone request with mobile compatibility
      console.log('📱 Requesting fresh microphone stream...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // Mobile optimized constraints
          sampleRate: { ideal: 16000, min: 8000, max: 48000 },
          channelCount: { ideal: 1, max: 2 },
          latency: { ideal: 0.1, max: 0.5 }
        }
      });

      console.log('🎤 Fresh microphone access granted successfully');
      streamRef.current = stream;

      // Enhanced audio context setup for mobile
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
        
        // Mobile requires user interaction to resume audio context
        if (audioContextRef.current.state === 'suspended') {
          console.log('📱 Resuming audio context...');
          await audioContextRef.current.resume();
        }
        
        // Create analyser for mobile
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 128; // Reduced for mobile performance
        analyserRef.current.smoothingTimeConstant = 0.8;
        
        microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
        microphoneRef.current.connect(analyserRef.current);
        
        startAudioVisualization();
        console.log('🎤 Mobile audio setup completed successfully');
      } else {
        // Reuse existing audio context but update source
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        
        if (microphoneRef.current) {
          microphoneRef.current.disconnect();
        }
        
        if (analyserRef.current) {
          microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
          microphoneRef.current.connect(analyserRef.current);
          startAudioVisualization();
        }
      }
      
    } catch (error) {
      console.error('🚫 Microphone access error:', error);
      
      if (error instanceof Error) {
        switch (error.name) {
          case 'NotAllowedError':
            onError("🎤 Microphone permission denied. Please tap the microphone icon in your browser's address bar and allow access.");
            break;
          case 'NotFoundError':
            onError("🎤 No microphone found. Please check that your device has a working microphone.");
            break;
          case 'NotSupportedError':
            onError("🎤 Voice features not supported. Please use Chrome, Samsung Internet, or update your browser.");
            break;
          case 'OverconstrainedError':
            onError("🎤 Microphone settings incompatible. Please try again.");
            break;
          case 'NotReadableError':
            onError("🎤 Microphone is being used by another app. Please close other apps and try again.");
            break;
          case 'SecurityError':
            onError("🎤 Security error. Please make sure you're using HTTPS or localhost.");
            break;
          case 'AbortError':
            onError("🎤 Microphone request was cancelled. Please try again.");
            break;
          default:
            onError(`🎤 Microphone error: ${error.message}. Please check your browser settings and try again.`);
        }
      }
      return;
    }
    
    // Start recognition with mobile optimizations
    if (recognitionRef.current && !isRecognitionActiveRef.current && !isEnding) {
      try {
        // MOBILE FIX: Longer delay for mobile stability
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Double-check state before starting
        if (isRecognitionActiveRef.current || isEnding || isSpeaking) {
          console.log('🚫 State changed during delay, aborting start');
          return;
        }
        
        console.log('🎤 Starting speech recognition...');
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start recognition:', error);
        isRecognitionActiveRef.current = false;
        isInitializingRef.current = false;
        
        if (error instanceof Error) {
          if (error.name === 'InvalidStateError') {
            // Common on mobile - force complete restart
            console.log('🔄 Mobile recognition restart needed - force cleanup...');
            
            // Clean up everything
            if (recognitionRef.current) {
              try {
                recognitionRef.current.abort();
              } catch (e) {
                console.log('Abort error:', e);
              }
              recognitionRef.current = null;
            }
            
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
              streamRef.current = null;
            }
            
            // Retry with fresh setup
            setTimeout(() => {
              if (!isEnding && !isSpeaking) {
                startListening();
              }
            }, 2000);
          } else if (error.name === 'NotAllowedError') {
            onError("🎤 Speech recognition permission denied. Please check your browser settings.");
          } else {
            onError("🎤 Could not start voice recognition. Please refresh the page and try again.");
          }
        }
      }
    }
  }, [locale, isEnding, isSpeaking, initializeRecognition, startAudioVisualization, onListeningStart, onListeningEnd, onTranscript, onError, conversationActive]);

  const stopListening = useCallback(() => {
    console.log('🛑 Stopping listening...');
    
    // Clear silence timeout
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    
    if (recognitionRef.current && isRecognitionActiveRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
    }
    
    isRecognitionActiveRef.current = false;
    onListeningEnd();
  }, [onListeningEnd]);

  const restartListening = useCallback(() => {
    if (!isEnding && !isSpeaking && conversationActive && autoListenMode) {
      console.log('🎤 RESTART: Scheduling mobile-optimized restart...');
      
      // MOBILE FIX: Always clean up before restart
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.log('Restart cleanup:', e);
        }
        recognitionRef.current = null;
      }
      
      // Clean up audio streams
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      // Reset states
      isRecognitionActiveRef.current = false;
      isInitializingRef.current = false;
      
      setTimeout(() => {
        if (!isRecognitionActiveRef.current && !isEnding && !isSpeaking && conversationActive) {
          console.log('🎤 RESTART: Executing fresh start for mobile!');
          startListening();
        } else {
          console.log('🎤 RESTART: Skipped due to state change');
        }
      }, 2000); // Longer delay for mobile stability
    }
  }, [isEnding, isSpeaking, conversationActive, autoListenMode, startListening]);

  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up recognition...');
    
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    
    if (recognitionRef.current && isRecognitionActiveRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
      isRecognitionActiveRef.current = false;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch((error: Error) => {
        console.error('Error closing audio context:', error);
      });
    }
    
    onListeningEnd();
    onAudioLevel(0);
  }, [onListeningEnd, onAudioLevel]);

  return {
    startListening,
    stopListening,
    restartListening,
    cleanup
  };
}
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
  onRestartListening: () => void; // Added missing parameter
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
  onAudioLevel,
  onRestartListening // Added missing parameter
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
  
  // ANDROID FIX: Add transcript deduplication
  const lastTranscriptRef = useRef<string>('');
  const lastTranscriptTimeRef = useRef<number>(0);
  const isProcessingTranscriptRef = useRef(false);

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
      
      // Enhanced language support for mobile with regional variants
      const languageMap = {
        'ar': 'ar-SA', // Saudi Arabic for better recognition
        'fr': 'fr-FR', 
        'en': 'en-US'
      };
      recognition.lang = languageMap[locale as keyof typeof languageMap] || 'en-US';
      
      // MOBILE ACCURACY FIX: Add alternative language fallbacks
      const userAgent = navigator.userAgent.toLowerCase();
      const isAndroid = userAgent.includes('android');
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      
      if (isAndroid && locale === 'en') {
        // Android works better with generic English sometimes
        recognition.lang = 'en';
      } else if (isIOS && locale === 'en') {
        // iOS prefers specific regional variants
        recognition.lang = 'en-US';
      }
      
      console.log('🎤 Recognition configured with language:', recognition.lang, 'for platform:', isAndroid ? 'Android' : isIOS ? 'iOS' : 'Desktop');

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
        
        // ANDROID FIX: Aggressive transcript deduplication
        if (finalTranscript.trim()) {
          const cleanTranscript = finalTranscript.trim();
          const now = Date.now();
          
          // Check if this is a duplicate transcript
          const isDuplicate = (
            cleanTranscript === lastTranscriptRef.current &&
            now - lastTranscriptTimeRef.current < 2000 // Within 2 seconds
          ) || isProcessingTranscriptRef.current;
          
          if (isDuplicate) {
            console.log('🚫 DUPLICATE transcript detected, ignoring:', cleanTranscript);
            return;
          }
          
          // Check if we're already processing a transcript
          if (isProcessingTranscriptRef.current) {
            console.log('🚫 Already processing transcript, ignoring:', cleanTranscript);
            return;
          }
          
          // Mark as processing and store for deduplication
          isProcessingTranscriptRef.current = true;
          lastTranscriptRef.current = cleanTranscript;
          lastTranscriptTimeRef.current = now;
          
          console.log('✅ Final transcript (deduplicated):', cleanTranscript);
          
          // Process transcript and reset processing flag after a delay
          onTranscript(cleanTranscript);
          
          // Reset processing flag after transcript is handled
          setTimeout(() => {
            isProcessingTranscriptRef.current = false;
          }, 1000);
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
            // Retry on unknown errors (common on mobile)
            if (initializationAttempts.current < 3) {
              console.log('🔄 Retrying recognition initialization...');
              setTimeout(() => {
                recognitionRef.current = null;
                initializeRecognition();
              }, 1000);
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
        
        // ANDROID CHROME FIX: Enhanced restart logic
        const userAgent = navigator.userAgent.toLowerCase();
        const isAndroid = userAgent.includes('android');
        const isChrome = userAgent.includes('chrome');
        
        console.log('🎤 onend - Platform:', { isAndroid, isChrome, conversationActive, autoListenMode, isEnding, isSpeaking });
        
        // Call the original onListeningEnd
        onListeningEnd();
        
        // CRITICAL: Auto-restart for Android with proper timing
        if (isAndroid && isChrome && conversationActive && autoListenMode && !isEnding && !isSpeaking) {
          console.log('🔄 Android Chrome auto-restart triggered from onend');
          // Longer delay specifically for Android Chrome
          setTimeout(() => {
            if (!isRecognitionActiveRef.current && !isEnding && !isSpeaking && conversationActive) {
              console.log('🔄 Executing Android restart...');
              // Clear any existing recognition instance for clean restart
              recognitionRef.current = null;
              // Use the parent's restart function with a small delay
              setTimeout(() => {
                if (!isRecognitionActiveRef.current) {
                  console.log('🔄 Final Android restart attempt');
                  onRestartListening();
                }
              }, 500);
            }
          }, 1500); // Increased delay for Android stability
        }
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
  }, [locale, checkBrowserCompatibility, onListeningStart, onListeningEnd, onTranscript, onError]);

  // MOBILE-OPTIMIZED start listening with enhanced permission handling
  const startListening = useCallback(async () => {
    // CRITICAL: Aggressive check to prevent multiple instances
    if (isRecognitionActiveRef.current) {
      console.log('🚫 Recognition already active, skipping start');
      return;
    }

    // ANDROID FIX: Stop any existing recognition first
    if (recognitionRef.current) {
      console.log('🛑 Stopping existing recognition before start...');
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null; // Clear the reference
      } catch (error) {
        console.log('Error stopping existing recognition:', error);
      }
      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 300));
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

    // ANDROID FIX: Force recreation of recognition instance
    recognitionRef.current = null;
    initializeRecognition();
    // Wait for proper initialization
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // ANDROID CHROME FIX: Request microphone permissions explicitly
    try {
      console.log('📱 Requesting microphone permissions explicitly for Android...');
      
      // Check if permissions API is available
      if (navigator.permissions) {
        const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        console.log('🎤 Current microphone permission:', micPermission.state);
        
        if (micPermission.state === 'denied') {
          onError("🎤 Microphone access was denied. Please go to your browser settings and allow microphone access for this site.");
          return;
        }
      }

      // Enhanced microphone request with Android Chrome compatibility
      console.log('📱 Requesting microphone with Android Chrome optimizations...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // Android Chrome specific optimizations
          sampleRate: { ideal: 16000, min: 8000, max: 48000 },
          channelCount: { ideal: 1, max: 2 },
          latency: { ideal: 0.1, max: 0.5 },
          // Additional Android compatibility
          googEchoCancellation: true,
          googAutoGainControl: true,
          googNoiseSuppression: true,
          googHighpassFilter: true,
          googTypingNoiseDetection: true
        } as any // Cast to any to allow Chrome-specific properties
      });

      console.log('🎤 Microphone access granted successfully');
      streamRef.current = stream;

      // Enhanced audio context setup for Android
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
        
        // Android requires user interaction to resume audio context
        if (audioContextRef.current.state === 'suspended') {
          console.log('📱 Resuming audio context for Android...');
          await audioContextRef.current.resume();
        }
        
        // Create analyser for mobile
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 128; // Reduced for mobile performance
        analyserRef.current.smoothingTimeConstant = 0.8;
        
        microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
        microphoneRef.current.connect(analyserRef.current);
        
        startAudioVisualization();
        console.log('🎤 Android audio setup completed successfully');
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
    
    // Start recognition with Android Chrome optimizations
    if (recognitionRef.current && !isRecognitionActiveRef.current && !isEnding) {
      try {
        // Longer delay for Android Chrome stability
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('🎤 Starting speech recognition for Android Chrome...');
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start recognition:', error);
        isRecognitionActiveRef.current = false;
        isInitializingRef.current = false;
        
        if (error instanceof Error) {
          if (error.name === 'InvalidStateError') {
            // Common on Android - try to restart
            console.log('🔄 Android recognition restart needed...');
            recognitionRef.current = null;
            setTimeout(() => startListening(), 1500);
          } else if (error.name === 'NotAllowedError') {
            onError("🎤 Speech recognition permission denied. Please check your browser settings.");
          } else {
            onError("🎤 Could not start voice recognition. Please refresh the page and try again.");
          }
        }
      }
    }
  }, [locale, isEnding, isSpeaking, initializeRecognition, startAudioVisualization, onListeningStart, onListeningEnd, onTranscript, onError]);

  const stopListening = useCallback(() => {
    console.log('🛑 Stopping listening...');
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
      console.log('🎤 RESTART: Scheduling restart...');
      setTimeout(() => {
        if (!isRecognitionActiveRef.current && !isEnding && !isSpeaking) {
          console.log('🎤 RESTART: Executing now!');
          startListening();
        }
      }, 1500); // Longer delay for mobile stability
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
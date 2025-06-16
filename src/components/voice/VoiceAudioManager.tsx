"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface VoiceAudioManagerProps {
  locale: string;
  onSpeakingStart: () => void;
  onSpeakingEnd: () => void;
  onRestartListening: () => void;
}

export default function useVoiceAudioManager({
  locale,
  onSpeakingStart,
  onSpeakingEnd,
  onRestartListening
}: VoiceAudioManagerProps) {
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const [hasUserGesture, setHasUserGesture] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const isPlayingRef = useRef(false);

  // Initialize audio context on first user interaction (MOBILE CRITICAL)
  useEffect(() => {
    const initializeAudio = () => {
      if (!hasUserGesture) {
        setHasUserGesture(true);
        console.log('🔊 User gesture detected - audio unlocked');
        
        // Create audio context for mobile compatibility
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          setAudioContext(ctx);
          
          // Resume context if suspended (iOS requirement)
          if (ctx.state === 'suspended') {
            ctx.resume().then(() => {
              console.log('🔊 Audio context resumed');
            });
          }
        } catch (error) {
          console.log('🔊 AudioContext not available, using fallback');
        }
      }
    };

    // Listen for any user interaction
    const events = ['touchstart', 'touchend', 'mousedown', 'keydown', 'click'];
    events.forEach(event => {
      document.addEventListener(event, initializeAudio, { once: true, passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, initializeAudio);
      });
    };
  }, [hasUserGesture]);

  // IOS SAFARI FIX: Enhanced user gesture detection and audio unlocking
  useEffect(() => {
    const unlockAudio = () => {
      if (!hasUserGesture) {
        setHasUserGesture(true);
        console.log('🍏 iOS: Unlocking audio with user gesture');
        
        // Create a silent audio element to unlock iOS audio
        const silentAudio = new Audio();
        silentAudio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4Ljc3AAAAAAAAAAAAAAAAJAAAAAAAAAAAASAA8y6nvwAAAAAAAAAAAAAAAAAAAAD/80DEAAAAI0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NCxAAAAAAjSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NCxAAAAAAjSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
        silentAudio.volume = 0.01; // Very low volume
        silentAudio.preload = 'auto';
        
        // iOS Safari specific attributes
        silentAudio.setAttribute('playsinline', 'true');
        silentAudio.setAttribute('webkit-playsinline', 'true');
        
        const playPromise = silentAudio.play();
        if (playPromise) {
          playPromise.then(() => {
            console.log('🍏 iOS: Silent audio played - audio unlocked');
            silentAudio.pause();
            silentAudio.remove();
          }).catch((error) => {
            console.log('🍏 iOS: Silent audio failed:', error);
          });
        }
        
        // Also unlock speech synthesis on iOS
        if (window.speechSynthesis) {
          try {
            const utterance = new SpeechSynthesisUtterance('');
            utterance.volume = 0;
            window.speechSynthesis.speak(utterance);
            window.speechSynthesis.cancel();
            console.log('🍏 iOS: Speech synthesis unlocked');
          } catch (error) {
            console.log('🍏 iOS: Speech synthesis unlock failed:', error);
          }
        }
      }
    };

    // More aggressive event listening for iOS
    const iosEvents = ['touchstart', 'touchend', 'click', 'tap', 'mousedown'];
    iosEvents.forEach(event => {
      document.addEventListener(event, unlockAudio, { once: true, passive: true });
    });

    return () => {
      iosEvents.forEach(event => {
        document.removeEventListener(event, unlockAudio);
      });
    };
  }, [hasUserGesture]);

  // MOBILE-OPTIMIZED TTS with multiple fallbacks
  const speakWithElevenLabs = useCallback(async (text: string, isGoodbye: boolean = false) => {
    try {
      console.log('🔊 Starting TTS for mobile:', text.substring(0, 50) + '...');
      
      // Prevent multiple simultaneous playback
      if (isPlayingRef.current) {
        console.log('🔊 Already playing, skipping');
        return;
      }
      
      onSpeakingStart();
      isPlayingRef.current = true;

      // Method 1: Try OpenAI TTS API (best quality)
      try {
        await speakWithOpenAI(text, isGoodbye);
        return;
      } catch (error) {
        console.log('🔊 OpenAI TTS failed, trying browser TTS:', error);
      }

      // Method 2: Browser TTS fallback (most reliable on mobile)
      await speakWithBrowserTTS(text, isGoodbye);
      
    } catch (error) {
      console.error('🔊 All TTS methods failed:', error);
      onSpeakingEnd();
      isPlayingRef.current = false;
      
      if (!isGoodbye) {
        setTimeout(() => onRestartListening(), 1000);
      }
    }
  }, [locale, onSpeakingStart, onSpeakingEnd, onRestartListening, hasUserGesture]);

  // OpenAI TTS with mobile optimizations
  const speakWithOpenAI = useCallback(async (text: string, isGoodbye: boolean) => {
    if (!hasUserGesture) {
      throw new Error('No user gesture for audio playback');
    }

    const response = await fetch('/api/text-to-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.slice(0, 500), locale }), // Limit for mobile
    });

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    console.log('🔊 Audio blob received:', audioBlob.size, 'bytes');

    return new Promise<void>((resolve, reject) => {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // MOBILE-CRITICAL: Set audio properties
      audio.preload = 'auto';
      audio.volume = 1.0;
      
      // iOS Safari requires these
      audio.setAttribute('playsinline', 'true');
      audio.setAttribute('webkit-playsinline', 'true');
      
      currentAudioRef.current = audio;

      const cleanup = () => {
        URL.revokeObjectURL(audioUrl);
        onSpeakingEnd();
        isPlayingRef.current = false;
        if (!isGoodbye) {
          setTimeout(() => onRestartListening(), 800);
        }
        resolve();
      };

      audio.onended = cleanup;
      audio.onerror = (error) => {
        console.error('🔊 Audio playback error:', error);
        cleanup();
      };

      // Mobile-optimized play with retry
      const attemptPlay = () => {
        audio.play()
          .then(() => {
            console.log('🔊 OpenAI audio playing successfully');
          })
          .catch((error) => {
            console.error('🔊 Audio play failed:', error);
            cleanup();
            reject(error);
          });
      };

      // Immediate play attempt
      attemptPlay();
    });
  }, [locale, hasUserGesture, onSpeakingEnd, onRestartListening]);

  // MOBILE-OPTIMIZED Browser TTS (most reliable fallback)
  const speakWithBrowserTTS = useCallback(async (text: string, isGoodbye: boolean) => {
    return new Promise<void>((resolve) => {
      console.log('🔊 Using mobile browser TTS fallback');
      
      if (!window.speechSynthesis) {
        console.log('🔊 Speech synthesis not available');
        onSpeakingEnd();
        isPlayingRef.current = false;
        if (!isGoodbye) {
          setTimeout(() => onRestartListening(), 1000);
        }
        resolve();
        return;
      }

      // Cancel any existing speech
      window.speechSynthesis.cancel();
      
      // Wait for voices to load (mobile requirement)
      const speak = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Mobile-optimized settings
        utterance.lang = locale === 'ar' ? 'ar-SA' : locale === 'fr' ? 'fr-FR' : 'en-US';
        utterance.rate = 0.9; // Slightly slower for better clarity
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Try to get a good voice
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          const preferredVoice = voices.find(voice => 
            voice.lang.startsWith(locale) && !voice.localService
          ) || voices.find(voice => 
            voice.lang.startsWith(locale)
          ) || voices[0];
          
          if (preferredVoice) {
            utterance.voice = preferredVoice;
            console.log('🔊 Using voice:', preferredVoice.name);
          }
        }

        utterance.onstart = () => {
          console.log('🔊 Browser TTS started');
        };

        utterance.onend = () => {
          console.log('🔊 Browser TTS ended');
          onSpeakingEnd();
          isPlayingRef.current = false;
          if (!isGoodbye) {
            setTimeout(() => onRestartListening(), 800);
          }
          resolve();
        };

        utterance.onerror = (error) => {
          console.error('🔊 Browser TTS error:', error);
          onSpeakingEnd();
          isPlayingRef.current = false;
          if (!isGoodbye) {
            setTimeout(() => onRestartListening(), 1000);
          }
          resolve();
        };

        // Start speaking
        console.log('🔊 Starting browser speech synthesis');
        window.speechSynthesis.speak(utterance);
      };

      // Handle voice loading on mobile
      if (window.speechSynthesis.getVoices().length === 0) {
        console.log('🔊 Waiting for voices to load...');
        window.speechSynthesis.onvoiceschanged = () => {
          console.log('🔊 Voices loaded, starting speech');
          speak();
        };
        // Fallback timeout
        setTimeout(speak, 1000);
      } else {
        speak();
      }
    });
  }, [locale, onSpeakingEnd, onRestartListening]);

  const stopSpeaking = useCallback(() => {
    console.log('🛑 Stopping all audio...');
    
    // Stop current audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    
    // Stop speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    isPlayingRef.current = false;
    onSpeakingEnd();
  }, [onSpeakingEnd]);

  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up audio...');
    stopSpeaking();
  }, [stopSpeaking]);

  return {
    speakWithElevenLabs,
    stopSpeaking,
    cleanup,
    hasUserGesture // Export for debugging
  };
}
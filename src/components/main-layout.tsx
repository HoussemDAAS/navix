"use client";

import { ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PiMicrophone } from 'react-icons/pi';

import Navbar from './sections/Navbar';
import Footer from './sections/Footer';
import VoiceAIAgent from './VoiceAIAgent';
export default function MainLayout({ children }: { children: ReactNode }) {
  const [isVoiceAgentOpen, setIsVoiceAgentOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);


  // Hide tooltip after 3 seconds (reduced from 5)
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="flex-1 pt-18 md:mt-10">{children}</main>
      
      {/* MOBILE-OPTIMIZED Voice AI Agent Button */}
      <div className="fixed bottom-4 right-4 z-40">
        {/* Mobile-optimized tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-16 right-0 bg-white px-3 py-2 rounded-lg shadow-lg border whitespace-nowrap z-10"
            >
              <div className="text-xs font-medium text-gray-800 flex items-center gap-1">
                🎤 Voice AI Assistant
                <span className="text-green-600 text-xs">●</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Tap to start voice chat
              </div>
              <div className="absolute -bottom-1 right-4 w-2 h-2 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced floating button for mobile reliability */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // ENHANCED Mobile gesture detection for audio unlock
            console.log('📱 Voice button tapped - enabling audio contexts');
            
            // iOS SAFARI FIX: Comprehensive audio unlocking
            const userAgent = navigator.userAgent.toLowerCase();
            const isIOS = /iphone|ipad|ipod/.test(userAgent);
            const isAndroid = userAgent.includes('android');
            
            // Enable audio context immediately on touch (critical for mobile)
            if (window.AudioContext || (window as any).webkitAudioContext) {
              try {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                const audioContext = new AudioContext();
                if (audioContext.state === 'suspended') {
                  audioContext.resume().then(() => {
                    console.log('📱 Audio context resumed on button tap');
                  });
                }
                audioContext.close(); // Just to enable and close
              } catch (error) {
                console.log('Audio context error:', error);
              }
            }

            // iOS FIX: Silent audio playback to unlock audio
            if (isIOS) {
              console.log('🍏 iOS detected - unlocking audio with silent playback');
              const silentAudio = new Audio();
              silentAudio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4Ljc3AAAAAAAAAAAAAAAAJAAAAAAAAAAAASAA8y6nvwAAAAAAAAAAAAAAAAAAAAD/80DEAAAAI0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NCxAAAAAAjSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NCxAAAAAAjSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
              silentAudio.volume = 0.01;
              silentAudio.setAttribute('playsinline', 'true');
              silentAudio.setAttribute('webkit-playsinline', 'true');
              
              silentAudio.play()
                .then(() => {
                  console.log('🍏 iOS silent audio played - audio unlocked');
                  silentAudio.pause();
                  silentAudio.remove();
                })
                .catch((error) => {
                  console.log('🍏 iOS silent audio failed:', error);
                });
            }

            // Enable speech synthesis voices loading for all platforms
            if (window.speechSynthesis) {
              // Load voices immediately
              window.speechSynthesis.getVoices();
              
              // iOS/Mobile FIX: Test speech synthesis with silent utterance
              try {
                const testUtterance = new SpeechSynthesisUtterance('');
                testUtterance.volume = 0;
                testUtterance.rate = 10; // Very fast to complete quickly
                window.speechSynthesis.speak(testUtterance);
                window.speechSynthesis.cancel(); // Cancel immediately
                console.log('📱 Speech synthesis unlocked');
              } catch (error) {
                console.log('Speech synthesis unlock failed:', error);
              }
            }

            // ANDROID FIX: Pre-request microphone for smoother experience
            if (isAndroid && navigator.mediaDevices) {
              navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                  console.log('📱 Android microphone pre-access successful');
                  stream.getTracks().forEach(track => track.stop());
                })
                .catch(error => {
                  console.log('📱 Android microphone pre-access failed:', error);
                });
            }
            
            setIsVoiceAgentOpen(true);
            setShowTooltip(false);
          }}
          className="relative w-16 h-16 bg-gradient-to-br from-[#4083b7] to-[#3474ac] text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center group touch-manipulation"
          style={{ touchAction: 'manipulation' }} // Prevent double-tap zoom on mobile
          title="Voice AI Assistant"
        >          
          {/* Enhanced pulse animation for better mobile visibility */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#4083b7]/40"
            animate={{ 
              scale: [1, 1.5],
              opacity: [0.6, 0]
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity, 
              ease: "easeOut"
            }}
          />
          
          {/* Secondary pulse for better visibility */}
          <motion.div
            className="absolute inset-0 rounded-full border border-[#4083b7]/20"
            animate={{ 
              scale: [1, 1.3],
              opacity: [0.8, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeOut",
              delay: 0.5
            }}
          />
          
          {/* Main microphone icon - larger for mobile */}
          <PiMicrophone className="text-2xl relative z-10" />

          {/* Enhanced active indicator */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-lg">
            <motion.div 
              className="w-full h-full bg-green-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>

          {/* Mobile touch feedback overlay */}
          <div className="absolute inset-0 rounded-full bg-white/0 group-active:bg-white/20 transition-colors duration-150" />
        </motion.button>
      </div>

      {/* Voice AI Agent Modal */}
      <VoiceAIAgent 
        isOpen={isVoiceAgentOpen} 
        onClose={() => setIsVoiceAgentOpen(false)}
        context="general"
      />
      
      <Footer />
    </div>
  );
}
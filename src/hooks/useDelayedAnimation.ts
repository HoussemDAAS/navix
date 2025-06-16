import { useState, useEffect } from 'react';
import { useTranslationReady } from '@/components/TranslationProvider';

interface UseDelayedAnimationOptions {
  delay?: number;
  enabled?: boolean;
}

export const useDelayedAnimation = (options: UseDelayedAnimationOptions = {}) => {
  const { delay = 300, enabled = true } = options;
  const { isTranslationsReady } = useTranslationReady();
  const [isAnimationReady, setIsAnimationReady] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsAnimationReady(true);
      return;
    }

    if (isTranslationsReady) {
      const timer = setTimeout(() => {
        setIsAnimationReady(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isTranslationsReady, delay, enabled]);

  return {
    isAnimationReady,
    isTranslationsReady,
    shouldAnimate: isAnimationReady && isTranslationsReady
  };
};
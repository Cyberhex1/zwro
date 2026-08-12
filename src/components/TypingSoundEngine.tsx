import React, { useEffect } from 'react';
import { audioSynth } from '../lib/audioSynth';

interface TypingSoundEngineProps {
  enabled?: boolean;
}

export const TypingSoundEngine: React.FC<TypingSoundEngineProps> = ({ enabled = true }) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore modifier keys, system shortcuts, navigation keys when alone
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape'].includes(e.key)) {
        return;
      }

      // Check if target is an editable input or textarea element
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.getAttribute('contenteditable') === 'true';

      if (isInput) {
        audioSynth.playKeyClickSound();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [enabled]);

  return null;
};

import { useState, useEffect, useRef, useCallback, memo } from 'react';

interface TypingAnimationProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
  cursorStyle?: 'bar' | 'block' | 'underscore';
  smooth?: boolean;
}

export const TypingAnimation = memo(({ 
  text, 
  speed = 25, 
  onComplete,
  className = "",
  cursorStyle = "bar",
  smooth = true,
}: TypingAnimationProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const rafRef = useRef<number>();
  const lastTimeRef = useRef(0);
  const textRef = useRef(text);

  // Reset when text changes
  useEffect(() => {
    if (textRef.current !== text) {
      textRef.current = text;
      setDisplayedText('');
      setIsComplete(false);
      indexRef.current = 0;
      lastTimeRef.current = 0;
    }
  }, [text]);

  useEffect(() => {
    if (isComplete) return;

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const elapsed = timestamp - lastTimeRef.current;

      if (elapsed >= speed) {
        const charsToAdd = smooth ? Math.max(1, Math.floor(elapsed / speed)) : 1;
        const nextIndex = Math.min(indexRef.current + charsToAdd, text.length);
        
        if (nextIndex > indexRef.current) {
          setDisplayedText(text.slice(0, nextIndex));
          indexRef.current = nextIndex;
          lastTimeRef.current = timestamp;
        }

        if (nextIndex >= text.length) {
          setIsComplete(true);
          onComplete?.();
          return;
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [text, speed, onComplete, isComplete, smooth]);

  const cursorElement = !isComplete ? (
    <span
      className={`inline-block ml-0.5 animate-blink ${
        cursorStyle === 'bar' ? 'w-0.5 h-[1.1em] bg-current align-text-bottom' :
        cursorStyle === 'block' ? 'w-2 h-[1.1em] bg-current/30 align-text-bottom' :
        'w-2 h-0.5 bg-current align-baseline'
      }`}
      style={{
        animation: 'blink 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }}
    />
  ) : null;

  return (
    <span className={`${className}`} style={{ willChange: isComplete ? 'auto' : 'contents' }}>
      {displayedText}
      {cursorElement}
    </span>
  );
});

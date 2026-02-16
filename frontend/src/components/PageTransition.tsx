import { useEffect, useState, useCallback, type ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  variant?: "fade" | "slideUp" | "slideLeft" | "scale" | "spring";
  duration?: number;
  delay?: number;
  staggerChildren?: boolean;
  staggerDelay?: number;
}

const variants = {
  fade: {
    hidden: "opacity-0",
    visible: "opacity-100",
  },
  slideUp: {
    hidden: "opacity-0 translate-y-6",
    visible: "opacity-100 translate-y-0",
  },
  slideLeft: {
    hidden: "opacity-0 translate-x-6",
    visible: "opacity-100 translate-x-0",
  },
  scale: {
    hidden: "opacity-0 scale-95",
    visible: "opacity-100 scale-100",
  },
  spring: {
    hidden: "opacity-0 translate-y-4 scale-[0.98]",
    visible: "opacity-100 translate-y-0 scale-100",
  },
};

const PageTransition = ({
  children,
  className = "",
  variant = "spring",
  duration = 600,
  delay = 0,
  staggerChildren = false,
  staggerDelay = 80,
}: PageTransitionProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Use rAF for smooth first-frame rendering
    const raf = requestAnimationFrame(() => {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    });
    return () => cancelAnimationFrame(raf);
  }, [delay]);

  const v = variants[variant];

  return (
    <div
      className={`will-change-[transform,opacity] ${
        isVisible ? v.visible : v.hidden
      } ${className}`}
      style={{
        transitionProperty: "transform, opacity",
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: variant === "spring"
          ? "cubic-bezier(0.34, 1.56, 0.64, 1)"
          : "cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {children}
    </div>
  );
};

/**
 * Wrapper for staggered child animations
 */
export const StaggerItem = ({
  children,
  index = 0,
  className = "",
  delay = 80,
}: {
  children: ReactNode;
  index?: number;
  className?: string;
  delay?: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * delay + 100);
    return () => clearTimeout(timer);
  }, [index, delay]);

  return (
    <div
      className={`will-change-[transform,opacity] ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-3 scale-[0.97]"
      } ${className}`}
      style={{
        transitionProperty: "transform, opacity",
        transitionDuration: "500ms",
        transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;

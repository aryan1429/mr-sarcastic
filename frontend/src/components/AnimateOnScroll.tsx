import { type ReactNode, memo } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

interface AnimateOnScrollProps {
  children: ReactNode;
  className?: string;
  animation?: "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "scaleIn" | "bounceIn";
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
}

const animationStyles = {
  fadeUp: {
    hidden: "opacity-0 translate-y-8",
    visible: "opacity-100 translate-y-0",
  },
  fadeIn: {
    hidden: "opacity-0",
    visible: "opacity-100",
  },
  slideLeft: {
    hidden: "opacity-0 -translate-x-8",
    visible: "opacity-100 translate-x-0",
  },
  slideRight: {
    hidden: "opacity-0 translate-x-8",
    visible: "opacity-100 translate-x-0",
  },
  scaleIn: {
    hidden: "opacity-0 scale-90",
    visible: "opacity-100 scale-100",
  },
  bounceIn: {
    hidden: "opacity-0 scale-75",
    visible: "opacity-100 scale-100",
  },
};

/**
 * Wraps children to animate them into view when scrolled into the viewport.
 * Uses IntersectionObserver for performance (no scroll listeners).
 * Only animates with transform + opacity (GPU composited).
 */
const AnimateOnScroll = memo(({
  children,
  className = "",
  animation = "fadeUp",
  delay = 0,
  duration = 600,
  threshold = 0.15,
  once = true,
}: AnimateOnScrollProps) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold,
    triggerOnce: once,
  });

  const style = animationStyles[animation];

  return (
    <div
      ref={ref}
      className={`will-change-[transform,opacity] ${
        isIntersecting ? style.visible : style.hidden
      } ${className}`}
      style={{
        transitionProperty: "transform, opacity",
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: animation === "bounceIn"
          ? "cubic-bezier(0.34, 1.56, 0.64, 1)"
          : "cubic-bezier(0.22, 1, 0.36, 1)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
});

AnimateOnScroll.displayName = "AnimateOnScroll";

export default AnimateOnScroll;

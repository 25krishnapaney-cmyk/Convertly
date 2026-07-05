"use client";

import * as React from "react";
import { motion, AnimatePresence, useSpring } from "framer-motion";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export function CustomCursor() {
  const [mousePosition, setMousePosition] = React.useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = React.useState(false);
  const [isTextHovered, setIsTextHovered] = React.useState(false);
  const [isClicked, setIsClicked] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);

  const [ripples, setRipples] = React.useState<Ripple[]>([]);
  const rippleIdRef = React.useRef(0);

  // Smooth spring physics for trailing outer ring (hardware accelerated via transform)
  const ringX = useSpring(-100, { stiffness: 450, damping: 28 });
  const ringY = useSpring(-100, { stiffness: 450, damping: 28 });

  React.useEffect(() => {
    // Detect mobile / touch devices
    if (typeof window !== "undefined") {
      const isTouch = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window || navigator.maxTouchPoints > 0;
      if (isTouch) {
        setIsTouchDevice(true);
        return;
      }
      document.body.classList.add("custom-cursor-active");
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      
      setMousePosition({ x: e.clientX, y: e.clientY });
      ringX.set(e.clientX);
      ringY.set(e.clientY);

      // Detect interactive elements under cursor
      const target = e.target as HTMLElement;
      if (target) {
        const isInteractive = 
          target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.closest("button") !== null ||
          target.closest("a") !== null ||
          target.getAttribute("role") === "button" ||
          target.classList.contains("cursor-pointer") ||
          target.closest(".cursor-pointer") !== null ||
          target.onclick !== null;

        const isTextInput = 
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable;

        setIsHovered(!!isInteractive && !isTextInput);
        setIsTextHovered(!!isTextInput);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicked(true);
      // Spawn expanding click ripple
      const newRipple: Ripple = {
        id: rippleIdRef.current++,
        x: e.clientX,
        y: e.clientY,
      };
      setRipples((prev) => [...prev.slice(-3), newRipple]);
    };

    const handleMouseUp = () => {
      setIsClicked(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mouseup", handleMouseUp, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (typeof document !== "undefined") {
        document.body.classList.remove("custom-cursor-active");
      }
    };
  }, [ringX, ringY, isVisible]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Click Ripples */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            initial={{ opacity: 0.8, scale: 0.2 }}
            animate={{ opacity: 0, scale: 2.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            onAnimationComplete={() => {
              setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
            }}
            className="absolute rounded-full border-2 border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.6)] bg-gradient-to-tr from-primary/30 to-[#00E5FF]/20"
            style={{
              left: ripple.x - 24,
              top: ripple.y - 24,
              width: 48,
              height: 48,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Trailing Outer Ring (Liquid Glass Orb) */}
      <motion.div
        className="absolute flex items-center justify-center rounded-full transition-colors duration-200"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: isTextHovered ? 6 : isHovered ? 56 : isClicked ? 28 : 36,
          height: isTextHovered ? 28 : isHovered ? 56 : isClicked ? 28 : 36,
          borderRadius: isTextHovered ? "4px" : "9999px",
          backgroundColor: isTextHovered
            ? "rgba(0, 122, 112, 0.4)"
            : isHovered
            ? "rgba(0, 229, 255, 0.15)"
            : "rgba(0, 168, 150, 0.1)",
          borderColor: isTextHovered
            ? "rgba(0, 168, 150, 0.8)"
            : isHovered
            ? "rgba(0, 229, 255, 0.8)"
            : "rgba(0, 122, 112, 0.4)",
          borderWidth: isTextHovered ? "1px" : isHovered ? "2px" : "1.5px",
          boxShadow: isHovered
            ? "0 0 25px rgba(0, 229, 255, 0.5), inset 0 0 10px rgba(0, 229, 255, 0.3)"
            : "0 0 15px rgba(0, 122, 112, 0.25)",
          scale: isClicked ? 0.85 : 1,
        }}
        transition={{
          width: { duration: 0.2, ease: "easeOut" },
          height: { duration: 0.2, ease: "easeOut" },
          borderRadius: { duration: 0.2 },
          backgroundColor: { duration: 0.2 },
          borderColor: { duration: 0.2 },
          boxShadow: { duration: 0.2 },
          scale: { duration: 0.1 },
        }}
      >
        {/* Subtle inner blur reflection for liquid glass feel */}
        {isHovered && (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary/20 to-transparent blur-[2px]" />
        )}
      </motion.div>

      {/* Central Instant Luminous Dot */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: isTextHovered ? 2 : isHovered ? 8 : 10,
          height: isTextHovered ? 22 : isHovered ? 8 : 10,
          borderRadius: isTextHovered ? "2px" : "9999px",
          backgroundColor: isTextHovered ? "#00E5FF" : isHovered ? "#00E5FF" : "#00A896",
          boxShadow: isHovered
            ? "0 0 12px #00E5FF, 0 0 20px #00E5FF"
            : "0 0 8px #00A896",
          scale: isClicked ? 0.6 : 1,
        }}
        transition={{
          duration: 0.15,
          ease: "easeOut",
        }}
      />
    </div>
  );
}

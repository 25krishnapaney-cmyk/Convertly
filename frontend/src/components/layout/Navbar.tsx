"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Sun, Moon, Layers, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { sound } from "@/lib/sound";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Image Tools", href: "/tools/image" },
  { label: "PDF Tools", href: "/tools/pdf" },
  { label: "Video", href: "/tools/video" },
  { label: "Audio", href: "/tools/audio" },
  { label: "All Tools", href: "/tools" },
  { label: "About", href: "/#about" },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [scrolled, setScrolled] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(true);

  React.useEffect(() => {
    setMounted(true);
    setSoundEnabled(sound.isEnabled());
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    sound.playPop(700);
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const toggleSound = () => {
    const newState = sound.toggle();
    setSoundEnabled(newState);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-navbar shadow-md py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo (§5, §3.3) */}
        <Link href="/" className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-primary rounded-lg p-1 -m-1">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200">
            <Layers className="w-5 h-5" />
          </div>
          <span className="font-display text-2xl tracking-tight font-bold text-main">
            File Grave<span className="text-success">.</span>
          </span>
        </Link>

        {/* Navigation Items (§5) */}
        <nav className="hidden lg:flex items-center gap-1 bg-surface/60 dark:bg-surface/40 p-1.5 rounded-2xl border border-subtle backdrop-blur-md shadow-sm">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${
                  isActive
                    ? "text-main"
                    : "text-muted hover:text-main"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-active-pill"
                    className="absolute inset-0 bg-surface dark:bg-surface-elevated rounded-xl shadow-sm border border-subtle"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    style={{ zIndex: -1 }}
                  />
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side controls: Sound Toggle, Theme Toggle & Quick Action */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? "Mute audio & haptics" : "Enable audio & haptics"}
            title={soundEnabled ? "Sound & Haptics Enabled" : "Sound & Haptics Muted"}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary ${
              soundEnabled
                ? "bg-primary/10 border-primary/30 text-primary hover:scale-105 active:scale-95"
                : "bg-surface/80 dark:bg-surface-elevated/80 border-subtle text-muted hover:text-main hover:scale-105 active:scale-95"
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 animate-pulse" />
            ) : (
              <VolumeX className="w-5 h-5 opacity-60" />
            )}
          </button>

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-10 h-10 rounded-xl bg-surface/80 dark:bg-surface-elevated/80 border border-subtle flex items-center justify-center text-muted hover:text-main hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {mounted ? (
              resolvedTheme === "dark" ? (
                <Sun className="w-5 h-5 text-warning transition-transform rotate-0 scale-100 duration-300" />
              ) : (
                <Moon className="w-5 h-5 text-primary transition-transform rotate-0 scale-100 duration-300" />
              )
            ) : (
              <div className="w-5 h-5" />
            )}
          </button>

          <Link
            href="/tools"
            className="clay-button px-4 py-2.5 text-sm font-medium hidden sm:flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <span>Start Converting</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

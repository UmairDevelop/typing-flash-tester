"use client";

import React, { useState, useEffect, useRef } from "react";

const SAMPLE_TEXTS = {
  technical: "The compiler translates source code into optimized machine instructions. High-performance computing architectures utilize parallel processing, cache hierarchies, and vector operations to maximize throughput and minimize latency. Writing thread-safe concurrent algorithms requires careful synchronization, understanding of memory barriers, and avoidance of race conditions.",
  minimalist: "Focus is the art of eliminating distractions. When the mind settles, the fingers fly across the keys with effortless grace. Speed is a natural byproduct of accuracy and relaxed attention. Breathe in, find your rhythm, and let the letters flow like water down a quiet mountain stream.",
  philosophy: "In the void of space, light is the only constant. We build digital structures to capture fleeting thoughts, translating consciousness into arrays of binary states. The cursor is a blinking bridge between the physical world of mechanical keystrokes and the infinite expanse of logical space.",
};

type Category = keyof typeof SAMPLE_TEXTS;

export default function Home() {
  // Theme state: dark (default) or light
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  
  // Test configurations
  const [category, setCategory] = useState<Category>("technical");
  const [duration, setDuration] = useState<number>(30); // in seconds
  
  // Test execution state
  const [targetText, setTargetText] = useState<string>("");
  const [typedInput, setTypedInput] = useState<string>("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  
  // Statistics state
  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [mistakes, setMistakes] = useState<number>(0);
  const [totalCharsTyped, setTotalCharsTyped] = useState<number>(0);
  const [correctChars, setCorrectChars] = useState<number>(0);

  // Focus and Active states
  const [isTestActive, setIsTestActive] = useState<boolean>(false);
  const typingAreaRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize text
  useEffect(() => {
    resetTest();
  }, [category, duration]);

  // Handle theme changes
  useEffect(() => {
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
      html.style.setProperty("--background", "#111317");
      html.style.setProperty("--on-background", "#e2e2e8");
      html.style.setProperty("--surface", "#111317");
    } else {
      html.classList.remove("dark");
      html.style.setProperty("--background", "#F8F9FA");
      html.style.setProperty("--on-background", "#1E2024");
      html.style.setProperty("--surface", "#FFFFFF");
    }
  }, [theme]);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isTestActive && timeLeft > 0 && !isFinished) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsFinished(true);
            setIsTestActive(false);
            if (interval) clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTestActive, timeLeft, isFinished]);

  // Calculate statistics in real-time
  useEffect(() => {
    if (!startTime || typedInput.length === 0) {
      setWpm(0);
      setAccuracy(100);
      return;
    }

    const elapsedMinutes = (Date.now() - startTime) / 60000;
    
    // Correct characters count
    let correct = 0;
    let errors = 0;
    
    for (let i = 0; i < typedInput.length; i++) {
      if (typedInput[i] === targetText[i]) {
        correct++;
      } else {
        errors++;
      }
    }

    setCorrectChars(correct);
    setMistakes(errors);
    
    // Standard word length is 5 characters
    const calculatedWpm = Math.round((correct / 5) / (elapsedMinutes || 0.01));
    const calculatedAcc = Math.round((correct / typedInput.length) * 100);
    
    setWpm(calculatedWpm > 0 ? calculatedWpm : 0);
    setAccuracy(calculatedAcc);
  }, [typedInput, targetText, startTime]);

  // Reset the test
  const resetTest = () => {
    const text = SAMPLE_TEXTS[category];
    setTargetText(text);
    setTypedInput("");
    setStartTime(null);
    setTimeLeft(duration);
    setIsFinished(false);
    setIsTestActive(false);
    setWpm(0);
    setAccuracy(100);
    setMistakes(0);
    setTotalCharsTyped(0);
    setCorrectChars(0);
    
    // Recenter focus on invisible textarea
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = "";
    }
  };

  // Start typing handler
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    if (isFinished) return;

    if (!isTestActive) {
      setIsTestActive(true);
      setStartTime(Date.now());
    }

    setTypedInput(value);
    setTotalCharsTyped(value.length);

    // End test if the whole paragraph is typed
    if (value.length >= targetText.length) {
      setIsFinished(true);
      setIsTestActive(false);
    }
  };

  // Click container to focus
  const focusTypingArea = () => {
    if (hiddenInputRef.current && !isFinished) {
      hiddenInputRef.current.focus();
    }
  };

  const progressPercent = Math.min((typedInput.length / targetText.length) * 100, 100);

  return (
    <div className={`min-h-screen flex flex-col justify-between py-8 relative transition-all duration-300`}>
      {/* Dynamic Top Progress Bar */}
      <div 
        className="progress-bar-top" 
        style={{ width: `${isTestActive ? progressPercent : 0}%` }}
      />

      {/* HEADER SECTION (fades out when typing) */}
      <header className={`container flex justify-between items-center mb-8 transition-opacity duration-300 ${isTestActive ? "opacity-20 pointer-events-none" : "opacity-100"}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center font-bold text-[var(--on-primary)] shadow-lg shadow-[var(--primary)]/10">
            ⚡
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white dark:text-white">
            Typing<span className="text-[var(--primary)]">Flash</span>
          </h1>
        </div>

        {/* Configurations */}
        <div className="flex items-center gap-6">
          <div className="flex bg-[var(--surface-container-low)] p-1 rounded-md border border-[var(--outline-variant)]/30">
            {(Object.keys(SAMPLE_TEXTS) as Category[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`label-caps px-3 py-1.5 rounded-sm transition-all duration-150 ${category === cat ? "bg-[var(--primary)] text-[var(--on-primary)]" : "text-[var(--on-surface-variant)] hover:text-white"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex bg-[var(--surface-container-low)] p-1 rounded-md border border-[var(--outline-variant)]/30">
            {[15, 30, 60].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setDuration(t);
                  setTimeLeft(t);
                }}
                className={`label-caps px-3 py-1.5 rounded-sm transition-all duration-150 ${duration === t ? "bg-[var(--secondary-container)] text-[var(--on-secondary-container)]" : "text-[var(--on-surface-variant)] hover:text-white"}`}
              >
                {t}s
              </button>
            ))}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="btn-ghost label-caps px-3 py-2 border border-[var(--outline)]/20 hover:border-[var(--primary)] flex items-center gap-2"
            title="Toggle Visual Theme"
          >
            {theme === "dark" ? "☀️ LIGHT" : "🌙 DARK"}
          </button>
        </div>
      </header>

      {/* MAIN TYPING ZONE */}
      <main className="container flex-grow flex flex-col justify-center my-12">
        {/* Statistics Banner when not active & finished */}
        {isFinished ? (
          <div className="glass-panel p-8 rounded-lg mb-8 animate-[fadeIn_0.4s_ease-out] flex justify-around items-center border border-[var(--primary)]/20 shadow-xl shadow-[var(--primary)]/5">
            <div className="text-center">
              <span className="label-caps block text-[var(--on-surface-variant)] mb-1">WPM</span>
              <div className="stats-lg text-[var(--primary)] font-bold">{wpm}</div>
            </div>
            <div className="w-px h-12 bg-[var(--outline-variant)]/20" />
            <div className="text-center">
              <span className="label-caps block text-[var(--on-surface-variant)] mb-1">Accuracy</span>
              <div className="stats-lg text-[var(--secondary-container)] font-bold">{accuracy}%</div>
            </div>
            <div className="w-px h-12 bg-[var(--outline-variant)]/20" />
            <div className="text-center">
              <span className="label-caps block text-[var(--on-surface-variant)] mb-1">Mistakes</span>
              <div className="stats-lg text-[var(--error)] font-bold">{mistakes}</div>
            </div>
            <div className="w-px h-12 bg-[var(--outline-variant)]/20" />
            <div className="text-center">
              <span className="label-caps block text-[var(--on-surface-variant)] mb-1">Time</span>
              <div className="stats-lg text-white font-bold">{duration - timeLeft}s</div>
            </div>
            <button 
              onClick={resetTest}
              className="btn-ghost btn-ghost-cyan"
            >
              TRY AGAIN
            </button>
          </div>
        ) : (
          /* Realtime mini-stats during typing */
          <div className={`flex justify-between items-center mb-8 transition-opacity duration-300 ${isTestActive ? "opacity-100" : "opacity-0"}`}>
            <div className="flex gap-8">
              <div className="flex items-baseline gap-2">
                <span className="label-caps text-[var(--on-surface-variant)]">WPM</span>
                <span className="font-mono text-xl font-bold text-[var(--primary)]">{wpm}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="label-caps text-[var(--on-surface-variant)]">ACC</span>
                <span className="font-mono text-xl font-bold text-[var(--secondary-container)]">{accuracy}%</span>
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono text-2xl text-white font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--secondary-container)] animate-pulse" />
              {timeLeft}s
            </div>
          </div>
        )}

        {/* The Text Block */}
        <div 
          ref={typingAreaRef}
          onClick={focusTypingArea}
          className={`relative p-8 rounded-lg transition-all duration-300 cursor-text min-h-[160px] flex items-center justify-center ${
            isTestActive ? "bg-[var(--surface-container-lowest)] shadow-inner" : "glass-panel"
          }`}
        >
          {/* Invisible text area to capture keystrokes */}
          <textarea
            ref={hiddenInputRef}
            onChange={handleInputChange}
            value={typedInput}
            disabled={isFinished}
            className="absolute top-0 left-0 w-full h-full opacity-0 pointer-events-auto cursor-text resize-none"
            autoFocus
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
          />

          {/* Prompt Overlay */}
          {!isTestActive && !isFinished && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-lg z-10 pointer-events-none">
              <div className="label-caps text-[var(--secondary)] animate-pulse">
                Click or Type anywhere to start
              </div>
            </div>
          )}

          {/* Rendered Text */}
          <div className="type-area leading-relaxed select-none">
            {targetText.split("").map((char, index) => {
              let charClass = "char-pending";
              let isCurrentCursor = index === typedInput.length;
              
              if (index < typedInput.length) {
                charClass = typedInput[index] === char ? "char-correct" : "char-incorrect";
              }
              
              return (
                <span 
                  key={index} 
                  className={`${charClass} ${isCurrentCursor ? "cursor-active" : ""}`}
                >
                  {char}
                </span>
              );
            })}
            {typedInput.length === targetText.length && !isFinished && (
              <span className="cursor-active" />
            )}
          </div>
        </div>

        {/* Reset & Instructions Bar (fades out when typing) */}
        <div className={`mt-8 flex justify-between items-center transition-opacity duration-300 ${isTestActive ? "opacity-20 pointer-events-none" : "opacity-100"}`}>
          <div className="flex items-center gap-2">
            <span className="text-[var(--on-surface-variant)] text-xs label-caps">Keyboard Shortcuts:</span>
            <kbd className="px-2 py-1 bg-[var(--surface-container-high)] border border-[var(--outline-variant)]/40 rounded text-xs text-[var(--on-surface-variant)] font-mono">TAB</kbd>
            <span className="text-[var(--on-surface-variant)] text-xs label-caps">+</span>
            <kbd className="px-2 py-1 bg-[var(--surface-container-high)] border border-[var(--outline-variant)]/40 rounded text-xs text-[var(--on-surface-variant)] font-mono">ENTER</kbd>
            <span className="text-[var(--on-surface-variant)] text-xs label-caps">to reset test</span>
          </div>

          <button 
            onClick={resetTest}
            className="btn-ghost flex items-center gap-2"
          >
            <span>🔄</span> RESET TEST
          </button>
        </div>
      </main>

      {/* FOOTER SECTION (fades out when typing) */}
      <footer className={`container mt-12 pt-6 border-t border-[var(--outline-variant)]/10 text-center transition-opacity duration-300 ${isTestActive ? "opacity-20 pointer-events-none" : "opacity-100"}`}>
        <p className="label-caps text-[var(--on-surface-variant)] opacity-60">
          Typing Flash &copy; 2026 &bull; Powered by Next.js &amp; Stitch Design System
        </p>
      </footer>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";

// Vocabulary Word Lists
const WORD_LISTS = {
  technical: [
    "compiler", "variable", "function", "syntax", "database", "query", "server", "client",
    "developer", "backend", "frontend", "modular", "interface", "abstract", "inheritance",
    "polymorphism", "encapsulation", "asynchronous", "callback", "promise", "await", "thread",
    "concurrency", "deadlock", "algorithm", "recursive", "iteration", "matrix", "vector",
    "cache", "memory", "latency", "throughput", "bandwidth", "protocol", "socket", "packet",
    "encryption", "decryption", "hashing", "security", "firewall", "endpoint", "controller",
    "middleware", "deployment", "repository", "commit", "branch", "merge", "conflict",
    "performance", "gradient", "responsive", "terminal", "pattern", "javascript", "structure"
  ],
  minimalist: [
    "flow", "calm", "focus", "breath", "mind", "quiet", "still", "peace", "rhythm",
    "smooth", "drift", "light", "shadow", "stone", "water", "wind", "river", "ocean",
    "cloud", "sky", "earth", "leaf", "tree", "forest", "mountain", "valley", "path",
    "road", "bridge", "gate", "door", "window", "house", "room", "table", "chair",
    "book", "pen", "paper", "word", "line", "page", "story", "song", "voice", "sound",
    "experience", "minimalist", "promise", "terminal", "abstract", "system", "pattern"
  ],
  philosophy: [
    "existence", "essence", "reason", "logic", "ethics", "morality", "justice", "truth",
    "knowledge", "belief", "reality", "illusion", "mind", "body", "dualism", "monism",
    "free", "will", "determinism", "nihilism", "existentialism", "stoicism", "wisdom",
    "virtue", "happiness", "meaning", "purpose", "cosmos", "universe", "nature", "time",
    "space", "infinite", "finite", "being", "nothingness", "consciousness", "perception",
    "experience", "phenomenon", "noumenon", "transcendental", "metaphysics", "epistemology"
  ]
};

type Category = keyof typeof WORD_LISTS;
type TestMode = "time" | "words";

interface LeaderboardEntry {
  username?: string;
  isUser?: boolean;
  wpm: number;
  accuracy: number;
  mode: string;
  category: string;
  date: string;
}

export default function Home() {
  // Navigation Tabs: "test" | "leaderboard" | "settings"
  const [activeTab, setActiveTab] = useState<"test" | "leaderboard" | "settings">("test");

  // Visual Theme: "dark" | "light" | "system"
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");

  // Keyboard Click Sound Settings
  const [clickSound, setClickSound] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.05);

  // Focus Mode Enable/Disable
  const [enableFocusMode, setEnableFocusMode] = useState<boolean>(true);

  // Blind Mode Enable/Disable
  const [blindMode, setBlindMode] = useState<boolean>(false);

  // Font Size in px (defaults to 28)
  const [fontSize, setFontSize] = useState<number>(28);

  // Custom Accent color: "purple" | "cyan" | "green" | "amber"
  const [customAccent, setCustomAccent] = useState<"purple" | "cyan" | "green" | "amber">("purple");

  // User Profile Name (defaults to "you")
  const [profileName, setProfileName] = useState<string>("you");

  // Leaderboard filters: "today" | "week" | "all"
  const [leaderboardFilter, setLeaderboardFilter] = useState<"today" | "week" | "all">("today");
  const [visibleLeaderboardEntries, setVisibleLeaderboardEntries] = useState<number>(5);

  // Settings tab: "test-settings" | "appearance" | "account"
  const [settingsTab, setSettingsTab] = useState<"test-settings" | "appearance" | "account">("test-settings");

  // Test Configurations
  const [category, setCategory] = useState<Category>("technical");
  const [testMode, setTestMode] = useState<TestMode>("time");
  const [timeDuration, setTimeDuration] = useState<number>(30); // in seconds
  const [wordTarget, setWordTarget] = useState<number>(50); // word count target

  // Test Running State
  const [words, setWords] = useState<string[]>([]);
  const [typedInput, setTypedInput] = useState<string>("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isTestActive, setIsTestActive] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Live Statistics
  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [mistakes, setMistakes] = useState<number>(0);
  const [rawWpm, setRawWpm] = useState<number>(0);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [accumulatedErrors, setAccumulatedErrors] = useState<number>(0);

  // Leaderboard data
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // DOM Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);

  // Load Leaderboard and Settings on mount
  useEffect(() => {
    const stored = localStorage.getItem("flowtype_leaderboard");
    const todayStr = new Date().toISOString().split("T")[0];
    if (stored) {
      setLeaderboard(JSON.parse(stored));
    } else {
      // Set default mock entries
      const mock: LeaderboardEntry[] = [
        { username: "speed_demon", wpm: 124, accuracy: 99, mode: "words (50)", category: "technical", date: todayStr },
        { username: "zen_writer", wpm: 108, accuracy: 98, mode: "time (30s)", category: "minimalist", date: todayStr },
        { username: "philosopher", wpm: 95, accuracy: 96, mode: "time (30s)", category: "philosophy", date: todayStr }
      ];
      localStorage.setItem("flowtype_leaderboard", JSON.stringify(mock));
      setLeaderboard(mock);
    }

    const storedAccent = localStorage.getItem("flowtype_custom_accent");
    if (storedAccent) setCustomAccent(storedAccent as any);

    const storedTheme = localStorage.getItem("flowtype_theme");
    if (storedTheme) setTheme(storedTheme as any);

    const storedClickSound = localStorage.getItem("flowtype_click_sound");
    if (storedClickSound !== null) setClickSound(storedClickSound === "true");

    const storedVolume = localStorage.getItem("flowtype_volume");
    if (storedVolume) setVolume(parseFloat(storedVolume));

    const storedFocusMode = localStorage.getItem("flowtype_focus_mode");
    if (storedFocusMode !== null) setEnableFocusMode(storedFocusMode === "true");

    const storedBlindMode = localStorage.getItem("flowtype_blind_mode");
    if (storedBlindMode !== null) setBlindMode(storedBlindMode === "true");

    const storedFontSize = localStorage.getItem("flowtype_font_size");
    if (storedFontSize) setFontSize(parseInt(storedFontSize));

    const storedProfileName = localStorage.getItem("flowtype_profile_name");
    if (storedProfileName) setProfileName(storedProfileName);
  }, []);

  // Sync custom accents
  useEffect(() => {
    localStorage.setItem("flowtype_custom_accent", customAccent);
    const root = document.documentElement;
    if (customAccent === "purple") {
      root.style.setProperty("--primary-accent", "#ecb2ff");
      root.style.setProperty("--primary-glow", "rgba(236, 178, 255, 0.35)");
      root.style.setProperty("--on-primary", "#520071");
      root.style.setProperty("--primary-container", "#bd00ff");
    } else if (customAccent === "cyan") {
      root.style.setProperty("--primary-accent", "#00eefc");
      root.style.setProperty("--primary-glow", "rgba(0, 238, 252, 0.35)");
      root.style.setProperty("--on-primary", "#00363a");
      root.style.setProperty("--primary-container", "#00686f");
    } else if (customAccent === "green") {
      root.style.setProperty("--primary-accent", "#00ff66");
      root.style.setProperty("--primary-glow", "rgba(0, 255, 102, 0.35)");
      root.style.setProperty("--on-primary", "#003311");
      root.style.setProperty("--primary-container", "#006622");
    } else if (customAccent === "amber") {
      root.style.setProperty("--primary-accent", "#ffb961");
      root.style.setProperty("--primary-glow", "rgba(255, 185, 97, 0.35)");
      root.style.setProperty("--on-primary", "#472a00");
      root.style.setProperty("--primary-container", "#a66800");
    }
  }, [customAccent]);

  // Sync system/dark/light theme classes
  useEffect(() => {
    localStorage.setItem("flowtype_theme", theme);
    const root = document.documentElement;
    const applyTheme = (t: "dark" | "light") => {
      if (t === "dark") {
        root.classList.remove("light");
      } else {
        root.classList.add("light");
      }
    };

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      applyTheme(mediaQuery.matches ? "dark" : "light");
      
      const listener = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? "dark" : "light");
      };
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  // Sync localstorage for other settings
  useEffect(() => {
    localStorage.setItem("flowtype_click_sound", String(clickSound));
  }, [clickSound]);

  useEffect(() => {
    localStorage.setItem("flowtype_volume", String(volume));
  }, [volume]);

  useEffect(() => {
    localStorage.setItem("flowtype_focus_mode", String(enableFocusMode));
  }, [enableFocusMode]);

  useEffect(() => {
    localStorage.setItem("flowtype_blind_mode", String(blindMode));
  }, [blindMode]);

  useEffect(() => {
    localStorage.setItem("flowtype_font_size", String(fontSize));
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("flowtype_profile_name", profileName);
  }, [profileName]);

  // Generate words on mode/category/config change
  useEffect(() => {
    if (activeTab === "test") {
      resetTest();
    }
  }, [category, testMode, timeDuration, wordTarget, activeTab]);

  // Timer Interval
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isTestActive && testMode === "time" && timeLeft > 0 && !isFinished) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            finishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTestActive, testMode, timeLeft, isFinished]);

  // Live Statistics Calculator
  useEffect(() => {
    if (!startTime || typedInput.length === 0) {
      setWpm(0);
      setAccuracy(100);
      setRawWpm(0);
      return;
    }

    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const elapsedMinutes = elapsedSeconds / 60;

    // Count correct chars typed
    let correct = 0;
    const targetText = words.join(" ");
    for (let i = 0; i < typedInput.length; i++) {
      if (typedInput[i] === targetText[i]) {
        correct++;
      }
    }

    setMistakes(accumulatedErrors);

    // Standard WPM: (correct characters / 5) / time elapsed
    const currentWpm = Math.round((correct / 5) / (elapsedMinutes || 0.015));
    const currentRawWpm = Math.round((totalAttempts / 5) / (elapsedMinutes || 0.015));
    const currentAcc = totalAttempts > 0 
      ? Math.max(0, Math.round(((totalAttempts - accumulatedErrors) / totalAttempts) * 100))
      : 100;

    setWpm(currentWpm >= 0 ? currentWpm : 0);
    setRawWpm(currentRawWpm >= 0 ? currentRawWpm : 0);
    setAccuracy(currentAcc);

    // Trigger end test in Word Mode
    if (testMode === "words") {
      const targetLength = targetText.length;
      if (typedInput.length >= targetLength) {
        finishTest();
      }
    }
  }, [typedInput, words, startTime, testMode, totalAttempts, accumulatedErrors]);

  // Smooth scroll container to keep active typing line centered
  useEffect(() => {
    const container = wordsContainerRef.current;
    if (!container || isFinished || typedInput.length === 0) {
      if (container) container.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const activeWordEl = container.querySelector(".word.active") as HTMLElement;
    if (activeWordEl) {
      const containerHeight = container.clientHeight;
      const activeWordTop = activeWordEl.offsetTop;
      const activeWordHeight = activeWordEl.clientHeight;
      
      const targetScrollTop = activeWordTop - (containerHeight / 2) + (activeWordHeight / 2);
      
      container.scrollTo({
        top: targetScrollTop >= 0 ? targetScrollTop : 0,
        behavior: "smooth"
      });
    }
  }, [typedInput, isFinished]);

  // Keyboard Shortcuts (Tab / Escape for reset)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || (e.key === "Tab" && activeTab === "test")) {
        e.preventDefault();
        resetTest();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [category, testMode, timeDuration, wordTarget, activeTab]);

  // Start test on keydown if not started
  useEffect(() => {
    const handleStartKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== "test" || isTestActive || isFinished || typedInput.length > 0) return;
      
      const ignoredKeys = ["Tab", "Escape", "Shift", "Control", "Alt", "Meta", "CapsLock", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter"];
      if (ignoredKeys.includes(e.key)) return;

      // Start the test!
      setIsTestActive(true);
      setStartTime(Date.now());
      setTimeLeft(testMode === "time" ? timeDuration : 0);
      setTotalAttempts(0);
      setAccumulatedErrors(0);
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
    
    window.addEventListener("keydown", handleStartKeyDown);
    return () => window.removeEventListener("keydown", handleStartKeyDown);
  }, [activeTab, isTestActive, isFinished, timeDuration, testMode, typedInput]);

  // Audio click synthesizer
  const playClickSound = (isError = false) => {
    if (!clickSound) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      if (isError) {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);
        gainNode.gain.setValueAtTime(volume * 1.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(1400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      }
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (err) {
      // Silently catch audio errors
    }
  };

  // Generate a random word sequence
  const generateWords = () => {
    const source = WORD_LISTS[category];
    const count = testMode === "words" ? wordTarget : 120;
    const generated: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const randIdx = Math.floor(Math.random() * source.length);
      generated.push(source[randIdx]);
    }
    return generated;
  };

  // Reset/Start New Test
  const resetTest = () => {
    const newWords = generateWords();
    setWords(newWords);
    setTypedInput("");
    setStartTime(null);
    setTimeLeft(testMode === "time" ? timeDuration : 0);
    setIsTestActive(false);
    setIsFinished(false);
    setWpm(0);
    setRawWpm(0);
    setAccuracy(100);
    setMistakes(0);
    setTotalAttempts(0);
    setAccumulatedErrors(0);

    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  };

  // Explicitly Start Test
  const startTest = () => {
    setIsTestActive(true);
    setStartTime(Date.now());
    setTimeLeft(testMode === "time" ? timeDuration : 0);
    setTotalAttempts(0);
    setAccumulatedErrors(0);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Complete typing test
  const finishTest = () => {
    setIsFinished(true);
    setIsTestActive(false);

    const elapsedMinutes = startTime ? (Date.now() - startTime) / 60000 : 0.5;
    
    let correct = 0;
    const targetText = words.join(" ");
    for (let i = 0; i < typedInput.length; i++) {
      if (typedInput[i] === targetText[i]) {
        correct++;
      }
    }
    const finalWpm = Math.round((correct / 5) / (elapsedMinutes || 0.015));
    
    // Accuracy including backspaces (using totalAttempts and accumulatedErrors)
    const finalAcc = totalAttempts > 0 
      ? Math.max(0, Math.round(((totalAttempts - accumulatedErrors) / totalAttempts) * 100))
      : 100;

    if (finalWpm > 0 && typedInput.length > 5) {
      const newEntry: LeaderboardEntry = {
        username: profileName || "guest_typist",
        isUser: true,
        wpm: finalWpm,
        accuracy: finalAcc,
        mode: testMode === "time" ? `time (${timeDuration}s)` : `words (${wordTarget})`,
        category: category,
        date: new Date().toISOString().split("T")[0]
      };

      const updated = [newEntry, ...leaderboard]
        .sort((a, b) => b.wpm - a.wpm)
        .slice(0, 50); // keep top 50

      setLeaderboard(updated);
      localStorage.setItem("flowtype_leaderboard", JSON.stringify(updated));
    }
  };

  // Handle typing input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (isFinished) return;

    if (!isTestActive) {
      setIsTestActive(true);
      setStartTime(Date.now());
    }

    const targetText = words.join(" ");
    
    if (val.length > typedInput.length) {
      const addedChar = val[val.length - 1];
      const targetChar = targetText[val.length - 1];
      const isNewError = addedChar !== targetChar;

      setTotalAttempts((prev) => prev + 1);
      if (isNewError) {
        setAccumulatedErrors((prev) => prev + 1);
        playClickSound(true);
      } else {
        playClickSound(false);
      }
    } else {
      playClickSound(false);
    }

    setTypedInput(val);
  };

  const focusInput = () => {
    if (inputRef.current && !isFinished) {
      inputRef.current.focus();
    }
  };

  // Render character list for active test visualization
  const renderTypingText = () => {
    const targetText = words.join(" ");
    
    return words.map((word, wIdx) => {
      const wordStartIndex = words.slice(0, wIdx).join(" ").length + (wIdx > 0 ? 1 : 0);
      const isWordActive = typedInput.length >= wordStartIndex && typedInput.length <= wordStartIndex + word.length;
      
      return (
        <span key={wIdx} className={`word ${isWordActive ? "active" : ""}`}>
          {word.split("").map((char, cIdx) => {
            const absoluteIndex = wordStartIndex + cIdx;
            let charClass = "char";

            if (absoluteIndex < typedInput.length) {
              const isCorrect = typedInput[absoluteIndex] === char;
              if (isCorrect) {
                charClass += " correct";
              } else {
                charClass += blindMode ? " correct" : " incorrect";
              }
            }

            const isCurrentCursor = absoluteIndex === typedInput.length;

            return (
              <span key={cIdx} className={`${charClass} relative`}>
                {isCurrentCursor && <span className="caret typing" />}
                {char}
              </span>
            );
          })}
          
          {wIdx < words.length - 1 && (
            <span className={`char ${typedInput.length > wordStartIndex + word.length ? (typedInput[wordStartIndex + word.length] === " " ? "correct" : (blindMode ? "correct" : "incorrect")) : ""} relative`}>
              {typedInput.length === wordStartIndex + word.length && <span className="caret typing" />}
              &nbsp;
            </span>
          )}
        </span>
      );
    });
  };

  // Reset Leaderboard
  const clearLeaderboard = () => {
    localStorage.removeItem("flowtype_leaderboard");
    setLeaderboard([]);
  };

  // Leaderboard Filtering Helper
  const getFilteredLeaderboard = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    
    const isThisWeek = (dateStr: string) => {
      try {
        const date = new Date(dateStr);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      } catch (e) {
        return false;
      }
    };

    return leaderboard.filter((entry) => {
      if (leaderboardFilter === "today") {
        return entry.date === todayStr;
      } else if (leaderboardFilter === "week") {
        return isThisWeek(entry.date) || entry.date === todayStr;
      }
      return true; // all time
    }).sort((a, b) => b.wpm - a.wpm);
  };

  return (
    <div className="app-container">
      {/* HEADER: FLOWTYPE / NAV TABS / THEME TOGGLE */}
      <header className={`main-header focus-transition ${isTestActive && enableFocusMode ? "dimmed-focus" : ""}`}>
        <div className="logo" onClick={() => { setActiveTab("test"); resetTest(); }}>
          FLOWTYPE
        </div>

        <nav className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === "test" ? "active" : ""}`}
            onClick={() => { setActiveTab("test"); resetTest(); }}
          >
            test
          </button>
          <button 
            className={`nav-tab ${activeTab === "leaderboard" ? "active" : ""}`}
            onClick={() => setActiveTab("leaderboard")}
          >
            leaderboard
          </button>
          <button 
            className={`nav-tab ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            settings
          </button>
        </nav>

        <button 
          className="theme-toggle" 
          onClick={() => setTheme(theme === "dark" ? "light" : theme === "light" ? "system" : "dark")}
          title={`Theme: ${theme}`}
        >
          {theme === "dark" ? (
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : theme === "light" ? (
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          ) : (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", fontWeight: 700 }}>auto</span>
          )}
        </button>
      </header>

      {/* MAIN VIEW */}
      <main className="main-content">
        {activeTab === "test" && (
          <>
            {isFinished ? (
              /* Results Dashboard */
              <div className="results-container">
                <div className="results-grid">
                  <div className="results-card">
                    <span className="stat-label">WPM</span>
                    <div className="stat-value text-primary">{wpm}</div>
                  </div>
                  <div className="results-card">
                    <span className="stat-label">Accuracy</span>
                    <div className="stat-value text-secondary">{accuracy}%</div>
                  </div>
                  <div className="results-card">
                    <span className="stat-label">Mistakes</span>
                    <div className="stat-value text-error">{mistakes}</div>
                  </div>
                  <div className="results-card">
                    <span className="stat-label">Raw WPM</span>
                    <div className="stat-value">{rawWpm}</div>
                  </div>
                </div>
                <div className="results-actions">
                  <button className="results-btn primary" onClick={resetTest}>
                    Try Again
                  </button>
                  <button className="results-btn" onClick={() => setActiveTab("leaderboard")}>
                    Leaderboard
                  </button>
                </div>
              </div>
            ) : (
              /* Active Typing Screen */
              <>
                {/* Controls/Metadata Bar */}
                <div className={`test-controls-bar focus-transition ${isTestActive && enableFocusMode ? "dimmed-focus" : ""}`}>
                  <div className="controls-left">
                    <div 
                      className="control-item active" 
                      onClick={() => setCategory((prev) => prev === "technical" ? "minimalist" : prev === "minimalist" ? "philosophy" : "technical")}
                      title="Click to cycle word vocabulary list"
                    >
                      ENGLISH / {category.toUpperCase()}
                    </div>

                    <div 
                      className={`control-item ${testMode === "words" ? "active" : "inactive"}`}
                      onClick={() => {
                        setTestMode("words");
                        setWordTarget((prev) => prev === 10 ? 25 : prev === 25 ? 50 : prev === 50 ? 100 : 10);
                      }}
                      title="Word target mode. Click to cycle word count"
                    >
                      {testMode === "words" ? `WORDS ${wordTarget}` : `WORDS`}
                    </div>

                    <div 
                      className={`control-item ${testMode === "time" ? "active" : "inactive"}`}
                      onClick={() => {
                        setTestMode("time");
                        setTimeDuration((prev) => prev === 15 ? 30 : prev === 30 ? 60 : 15);
                      }}
                      title="Time mode. Click to cycle time limit"
                    >
                      {testMode === "time" ? `00:${timeLeft < 10 ? "0" : ""}${timeLeft}` : `TIME`}
                    </div>
                  </div>

                  <div className="controls-right">
                    {enableFocusMode && (
                      <>
                        <span className="focus-dot"></span>
                        <span>Focus Mode Active</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Typing Test Main Panel */}
                <div className="typing-area-wrapper" onClick={focusInput} onFocus={focusInput}>
                  <input
                    ref={inputRef}
                    type="text"
                    className="hidden-input"
                    onChange={handleInputChange}
                    value={typedInput}
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck="false"
                    disabled={isFinished}
                  />

                  {/* Rendered Words list */}
                  <div 
                    ref={wordsContainerRef} 
                    className="words-container"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {renderTypingText()}
                  </div>

                  {!isTestActive && !isFinished && typedInput.length === 0 && (
                    <div className="start-overlay">
                      <button className="start-test-btn" onClick={(e) => {
                        e.stopPropagation();
                        startTest();
                      }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                        start test
                      </button>
                      <span className="start-hint">or type to start</span>
                    </div>
                  )}
                </div>

                {/* Divider Line */}
                <div className="divider-line" />

                {/* Live Stats and Reset Button */}
                <div className="stats-footer-bar">
                  <div className="stat-box">
                    <span className="stat-label">WPM</span>
                    <span className="stat-value">{(isTestActive && blindMode) ? "—" : wpm}</span>
                  </div>

                  <button 
                    className="reset-btn-circle" 
                    onClick={resetTest}
                    title="Restart test (Esc or Tab)"
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                    </svg>
                  </button>

                  <div className="stat-box" style={{ alignItems: "flex-end" }}>
                    <span className="stat-label">Accuracy</span>
                    <span className="stat-value">{(isTestActive && blindMode) ? "—" : `${accuracy}%`}</span>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* LEADERBOARD VIEW */}
        {activeTab === "leaderboard" && (
          <div className="leaderboard-view">
            <div className="leaderboard-header">
              <div className="leaderboard-title-group">
                <h1 className="leaderboard-title">leaderboard</h1>
                <div className="leaderboard-subtitle">GLOBAL RANKING OF PRECISION AND SPEED</div>
              </div>

              {/* Filter Tabs */}
              <div className="leaderboard-filters">
                <button 
                  className={`filter-btn ${leaderboardFilter === "today" ? "active" : ""}`}
                  onClick={() => setLeaderboardFilter("today")}
                >
                  today
                </button>
                <button 
                  className={`filter-btn ${leaderboardFilter === "week" ? "active" : ""}`}
                  onClick={() => setLeaderboardFilter("week")}
                >
                  this week
                </button>
                <button 
                  className={`filter-btn ${leaderboardFilter === "all" ? "active" : ""}`}
                  onClick={() => setLeaderboardFilter("all")}
                >
                  all time
                </button>
              </div>
            </div>

            {/* Table */}
            {getFilteredLeaderboard().length === 0 ? (
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", color: "var(--text-muted)", padding: "1rem" }}>
                No records found. Complete a test today to submit a record!
              </p>
            ) : (
              <div className="leaderboard-table-container">
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>typist</th>
                      <th>wpm</th>
                      <th>accuracy</th>
                      <th>mode</th>
                      <th>date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredLeaderboard().slice(0, visibleLeaderboardEntries).map((entry, idx) => {
                      const isUser = entry.isUser;
                      const isTop3 = idx < 3;
                      const rankNum = String(idx + 1).padStart(2, "0");
                      
                      return (
                        <tr key={idx} className={isUser ? "user-row" : ""}>
                          <td className={`rank-cell ${isTop3 ? `top-${idx + 1}` : ""}`}>
                            {isTop3 && (
                              <span className="rank-icon">
                                {idx === 0 && (
                                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                    <path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2-6.3-4.6-6.3 4.6 2.3-7.2-6-4.4h7.6z"/>
                                  </svg>
                                )}
                                {idx === 1 && (
                                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                                  </svg>
                                )}
                                {idx === 2 && (
                                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                                  </svg>
                                )}
                              </span>
                            )}
                            <span className="rank-number">{rankNum}</span>
                          </td>
                          <td className="username-cell">
                            {entry.username || "guest_typist"}
                            {isUser && <span className="user-badge">you</span>}
                          </td>
                          <td className="wpm-cell">{entry.wpm}</td>
                          <td className={`accuracy-cell ${entry.accuracy === 100 ? "cyan-text" : ""}`}>
                            {entry.accuracy}%
                          </td>
                          <td className="mode-cell">{entry.mode}</td>
                          <td className="date-cell">{entry.date}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Load More Button */}
            {getFilteredLeaderboard().length > visibleLeaderboardEntries && (
              <div className="leaderboard-actions">
                <button 
                  className="load-more-btn"
                  onClick={() => setVisibleLeaderboardEntries(prev => prev + 5)}
                >
                  load more entries ∨
                </button>
              </div>
            )}
            
            {/* Clear option */}
            {leaderboard.length > 0 && (
              <div className="clear-leaderboard-container">
                <button className="clear-leaderboard-btn" onClick={clearLeaderboard}>
                  clear local stats
                </button>
              </div>
            )}
          </div>
        )}

        {/* SETTINGS VIEW */}
        {activeTab === "settings" && (
          <div className="settings-split-container">
            {/* Sidebar */}
            <aside className="settings-sidebar">
              <nav className="settings-sidebar-nav">
                <button 
                  className={`settings-nav-item ${settingsTab === "test-settings" ? "active" : ""}`}
                  onClick={() => setSettingsTab("test-settings")}
                >
                  test settings
                </button>
                <button 
                  className={`settings-nav-item ${settingsTab === "appearance" ? "active" : ""}`}
                  onClick={() => setSettingsTab("appearance")}
                >
                  appearance
                </button>
                <button 
                  className={`settings-nav-item ${settingsTab === "account" ? "active" : ""}`}
                  onClick={() => setSettingsTab("account")}
                >
                  account & sync
                </button>
              </nav>

              <div className="quick-tip-card">
                <div className="quick-tip-title">QUICK TIP</div>
                <div className="quick-tip-content">
                  {settingsTab === "test-settings" && "Press 'Esc' or 'Tab' at any time to instantly reset and restart your typing test."}
                  {settingsTab === "appearance" && "Custom accent colors dynamically change the highlights across the typing cursor and metrics."}
                  {settingsTab === "account" && "Change your profile username here to personalize your entries on the local leaderboard."}
                </div>
              </div>
            </aside>

            {/* Settings Sheet */}
            <section className="settings-sheet">
              {settingsTab === "test-settings" && (
                <div className="settings-section">
                  <div className="section-header">
                    <svg className="section-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <h2 className="section-title">Test Settings</h2>
                  </div>

                  <div className="setting-control-row">
                    <div className="setting-label-group">
                      <label className="setting-label-name">Time Limit</label>
                      <p className="setting-label-desc">Configure the standard duration of the typing test</p>
                    </div>
                    <div className="button-group">
                      {[15, 30, 60, 120].map((t) => (
                        <button
                          key={t}
                          className={`segmented-button ${timeDuration === t ? "active" : ""}`}
                          onClick={() => {
                            setTimeDuration(t);
                            setTimeLeft(t);
                          }}
                        >
                          {t}s
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="setting-control-row">
                    <div className="setting-label-group">
                      <label className="setting-label-name">Vocabulary Type</label>
                      <p className="setting-label-desc">Select the vocabulary list database to practice</p>
                    </div>
                    <div className="select-container">
                      <select
                        className="custom-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as Category)}
                      >
                        <option value="technical">technical vocabulary</option>
                        <option value="minimalist">minimalist nature</option>
                        <option value="philosophy">existential philosophy</option>
                      </select>
                    </div>
                  </div>

                  <div className="setting-control-row">
                    <div className="setting-label-group">
                      <label className="setting-label-name">Blind Mode</label>
                      <p className="setting-label-desc">Warns you of errors but hides red highlights and hides live metrics</p>
                    </div>
                    <button
                      className={`toggle-switch-btn ${blindMode ? "active" : ""}`}
                      onClick={() => setBlindMode(!blindMode)}
                    >
                      {blindMode ? "ENABLED" : "DISABLED"}
                    </button>
                  </div>
                </div>
              )}

              {settingsTab === "appearance" && (
                <div className="settings-section">
                  <div className="section-header">
                    <svg className="section-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"></path>
                      <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z"></path>
                    </svg>
                    <h2 className="section-title">Appearance</h2>
                  </div>

                  <div className="setting-control-row">
                    <div className="setting-label-group">
                      <label className="setting-label-name">Visual Theme</label>
                      <p className="setting-label-desc">Switch interface contrast modes</p>
                    </div>
                    <div className="button-group">
                      {(["dark", "light", "system"] as const).map((t) => (
                        <button
                          key={t}
                          className={`segmented-button ${theme === t ? "active" : ""}`}
                          onClick={() => setTheme(t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="setting-control-row">
                    <div className="setting-label-group">
                      <label className="setting-label-name">Color Accent</label>
                      <p className="setting-label-desc">Select the primary system highlight color</p>
                    </div>
                    <div className="color-swatch-group">
                      {[
                        { id: "purple", color: "#ecb2ff", label: "electric purple" },
                        { id: "cyan", color: "#00eefc", label: "neon cyan" },
                        { id: "green", color: "#00ff66", label: "emerald green" },
                        { id: "amber", color: "#ffb961", label: "amber gold" }
                      ].map((swatch) => (
                        <button
                          key={swatch.id}
                          className={`color-swatch-btn ${customAccent === swatch.id ? "active" : ""}`}
                          style={{ backgroundColor: swatch.color }}
                          title={swatch.label}
                          onClick={() => setCustomAccent(swatch.id as any)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="setting-control-row">
                    <div className="setting-label-group">
                      <label className="setting-label-name">Font Size</label>
                      <p className="setting-label-desc">Adjust WPM typography scale</p>
                    </div>
                    <div className="range-slider-container">
                      <div className="range-slider-row">
                        <span className="slider-edge-label" style={{ fontSize: "16px" }}>Aa</span>
                        <input
                          type="range"
                          min="20"
                          max="36"
                          step="2"
                          value={fontSize}
                          onChange={(e) => setFontSize(parseInt(e.target.value))}
                          className="custom-range"
                        />
                        <span className="slider-edge-label" style={{ fontSize: "28px" }}>Aa</span>
                      </div>
                      <div className="slider-val-preview">{fontSize}px</div>
                    </div>
                  </div>

                  <div className="setting-control-row">
                    <div className="setting-label-group">
                      <label className="setting-label-name">Tactile Click Sound</label>
                      <p className="setting-label-desc">Simulate mechanical switches when pressing keys</p>
                    </div>
                    <button
                      className={`toggle-switch-btn ${clickSound ? "active" : ""}`}
                      onClick={() => setClickSound(!clickSound)}
                    >
                      {clickSound ? "ON" : "OFF"}
                    </button>
                  </div>

                  <div className="setting-control-row">
                    <div className="setting-label-group">
                      <label className="setting-label-name">Key Sound Volume</label>
                      <p className="setting-label-desc">Adjust volume of tactile feedback</p>
                    </div>
                    <div className="volume-slider-group">
                      <input
                        type="range"
                        min="0.01"
                        max="0.2"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        disabled={!clickSound}
                        className="custom-range"
                      />
                      <span className="volume-val-label">
                        {Math.round(volume * 500)}%
                      </span>
                    </div>
                  </div>

                  <div className="setting-control-row">
                    <div className="setting-label-group">
                      <label className="setting-label-name">Focus Mode Dimming</label>
                      <p className="setting-label-desc">Fade peripheral navigation elements while typing</p>
                    </div>
                    <button
                      className={`toggle-switch-btn ${enableFocusMode ? "active" : ""}`}
                      onClick={() => setEnableFocusMode(!enableFocusMode)}
                    >
                      {enableFocusMode ? "ON" : "OFF"}
                    </button>
                  </div>
                </div>
              )}

              {settingsTab === "account" && (
                <div className="settings-section">
                  <div className="section-header">
                    <svg className="section-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21V19C20 17.94 19.1 17 18 17H6C4.9 17 4 17.94 4 19V21"></path>
                      <circle cx="12" cy="9" r="4"></circle>
                    </svg>
                    <h2 className="section-title">Account & Sync</h2>
                  </div>

                  <div className="setting-control-row">
                    <div className="setting-label-group">
                      <label className="setting-label-name">Typist Username</label>
                      <p className="setting-label-desc">Set your display handle for leaderboard submissions</p>
                    </div>
                    <div className="text-input-container">
                      <input
                        type="text"
                        className="custom-text-input"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 15))}
                        placeholder="guest_typist"
                      />
                    </div>
                  </div>

                  <div className="setting-control-row flex-column align-items-start">
                    <div className="setting-label-group" style={{ marginBottom: "1rem" }}>
                      <label className="setting-label-name">Connected Services</label>
                      <p className="setting-label-desc">Sync your performance stats with developer profiles</p>
                    </div>
                    <div className="connected-accounts-grid">
                      <div className="account-card">
                        <div className="account-card-info">
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                          </svg>
                          <span>github</span>
                        </div>
                        <button className="results-btn ghost-btn small">link account</button>
                      </div>

                      <div className="account-card">
                        <div className="account-card-info">
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.873-.894.077.077 0 01-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 01.077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 01.078.009c.12.099.246.195.373.289a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.894.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/>
                          </svg>
                          <span>discord</span>
                        </div>
                        <button className="results-btn ghost-btn small">link account</button>
                      </div>
                    </div>
                  </div>

                  <div className="danger-zone-container">
                    <div className="danger-zone-header">DANGER ZONE</div>
                    <div className="danger-zone-content">
                      <p className="danger-desc">Resetting your data will erase all high scores on the local leaderboard. This cannot be undone.</p>
                      <button className="results-btn danger-btn" onClick={() => {
                        if (confirm("Are you sure you want to clear all stats?")) {
                          clearLeaderboard();
                          alert("All data has been reset.");
                        }
                      }}>
                        RESET ALL DATA
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className={`footer-bar focus-transition ${isTestActive && enableFocusMode ? "dimmed-focus" : ""}`}>
        <div className="logo-font">
          flowtype
        </div>
        <div className="footer-center">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="footer-link">github</a>
          <a href="https://discord.com" target="_blank" rel="noreferrer" className="footer-link">discord</a>
          <a href="#" className="footer-link">privacy</a>
          <a href="#" className="footer-link">terms</a>
        </div>
        <div className="footer-right">
          &copy; 2026. sharpen your focus.
        </div>
      </footer>
    </div>
  );
}

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
  wpm: number;
  accuracy: number;
  mode: string;
  category: string;
  date: string;
}

export default function Home() {
  // Navigation Tabs: "test" | "leaderboard" | "settings"
  const [activeTab, setActiveTab] = useState<"test" | "leaderboard" | "settings">("test");

  // Visual Theme: "dark" | "light"
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Keyboard Click Sound Settings
  const [clickSound, setClickSound] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.05);

  // Focus Mode Enable/Disable
  const [enableFocusMode, setEnableFocusMode] = useState<boolean>(true);

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

  // Leaderboard data
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // DOM Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);

  // Load Leaderboard on mount
  useEffect(() => {
    const stored = localStorage.getItem("flowtype_leaderboard");
    if (stored) {
      setLeaderboard(JSON.parse(stored));
    } else {
      // Set default mock entries
      const mock: LeaderboardEntry[] = [
        { wpm: 124, accuracy: 99, mode: "words (50)", category: "technical", date: "2026-06-07" },
        { wpm: 108, accuracy: 98, mode: "time (30s)", category: "minimalist", date: "2026-06-06" },
        { wpm: 95, accuracy: 96, mode: "time (30s)", category: "philosophy", date: "2026-06-05" }
      ];
      localStorage.setItem("flowtype_leaderboard", JSON.stringify(mock));
      setLeaderboard(mock);
    }
  }, []);

  // Sync theme class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.remove("light");
    } else {
      root.classList.add("light");
    }
  }, [theme]);

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
    let errors = 0;
    
    // We compare character by character
    const targetText = words.join(" ");
    for (let i = 0; i < typedInput.length; i++) {
      if (typedInput[i] === targetText[i]) {
        correct++;
      } else {
        errors++;
      }
    }

    setMistakes(errors);

    // Standard WPM: (correct characters / 5) / time elapsed
    // Standard Word length is 5 characters
    const currentWpm = Math.round((correct / 5) / (elapsedMinutes || 0.015));
    const currentRawWpm = Math.round((typedInput.length / 5) / (elapsedMinutes || 0.015));
    const currentAcc = Math.round((correct / typedInput.length) * 100);

    setWpm(currentWpm >= 0 ? currentWpm : 0);
    setRawWpm(currentRawWpm >= 0 ? currentRawWpm : 0);
    setAccuracy(currentAcc >= 0 ? currentAcc : 100);

    // Trigger end test in Word Mode
    if (testMode === "words") {
      // Check if user finished the last word
      const targetLength = targetText.length;
      if (typedInput.length >= targetLength) {
        finishTest();
      }
    }
  }, [typedInput, words, startTime, testMode]);

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
      
      // We want the active word to be positioned near the center of the container
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
        // Deeper error crunch
        osc.type = "triangle";
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);
        gainNode.gain.setValueAtTime(volume * 1.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      } else {
        // High crisp tactile switch click
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
    const count = testMode === "words" ? wordTarget : 120; // 120 words for time mode
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

    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  };

  // Complete typing test
  const finishTest = () => {
    setIsFinished(true);
    setIsTestActive(false);

    // Save score to leaderboard
    const elapsedMinutes = startTime ? (Date.now() - startTime) / 60000 : 0.5;
    
    // Recalculate final values
    let correct = 0;
    const targetText = words.join(" ");
    for (let i = 0; i < typedInput.length; i++) {
      if (typedInput[i] === targetText[i]) {
        correct++;
      }
    }
    const finalWpm = Math.round((correct / 5) / (elapsedMinutes || 0.015));
    const finalAcc = Math.round((correct / typedInput.length) * 100);

    if (finalWpm > 0 && typedInput.length > 5) {
      const newEntry: LeaderboardEntry = {
        wpm: finalWpm,
        accuracy: isNaN(finalAcc) ? 100 : finalAcc,
        mode: testMode === "time" ? `time (${timeDuration}s)` : `words (${wordTarget})`,
        category: category,
        date: new Date().toISOString().split("T")[0]
      };

      const updated = [newEntry, ...leaderboard]
        .sort((a, b) => b.wpm - a.wpm)
        .slice(0, 10); // keep top 10

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

    // Determine if user just typed an incorrect character
    const targetText = words.join(" ");
    const isNewError = val.length > typedInput.length && val[val.length - 1] !== targetText[val.length - 1];
    playClickSound(isNewError);

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
    const typedWords = typedInput.split(" ");
    
    // We split target text into words for natural wrapping
    return words.map((word, wIdx) => {
      // Find the absolute start index of this word in targetText
      const wordStartIndex = words.slice(0, wIdx).join(" ").length + (wIdx > 0 ? 1 : 0);
      const isWordActive = typedInput.length >= wordStartIndex && typedInput.length <= wordStartIndex + word.length;
      
      return (
        <span key={wIdx} className={`word ${isWordActive ? "active" : ""}`}>
          {word.split("").map((char, cIdx) => {
            const absoluteIndex = wordStartIndex + cIdx;
            let charClass = "char";

            if (absoluteIndex < typedInput.length) {
              charClass += typedInput[absoluteIndex] === char ? " correct" : " incorrect";
            }

            const isCurrentCursor = absoluteIndex === typedInput.length;

            return (
              <span key={cIdx} className={`${charClass} relative`}>
                {isCurrentCursor && <span className="caret typing" />}
                {char}
              </span>
            );
          })}
          
          {/* Space character logic */}
          {wIdx < words.length - 1 && (
            <span className={`char ${typedInput.length > wordStartIndex + word.length ? (typedInput[wordStartIndex + word.length] === " " ? "correct" : "incorrect") : ""} relative`}>
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
            onClick={() => setActiveTab("test")}
          >
            Test
          </button>
          <button 
            className={`nav-tab ${activeTab === "leaderboard" ? "active" : ""}`}
            onClick={() => setActiveTab("leaderboard")}
          >
            Leaderboard
          </button>
          <button 
            className={`nav-tab ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
        </nav>

        <button 
          className="theme-toggle" 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title="Toggle visual theme"
        >
          {theme === "dark" ? (
            // Sun Icon for Dark Theme
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
          ) : (
            // Moon Icon for Light Theme
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
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
                    {/* Cycle Category */}
                    <div 
                      className="control-item active" 
                      onClick={() => setCategory((prev) => prev === "technical" ? "minimalist" : prev === "minimalist" ? "philosophy" : "technical")}
                      title="Click to cycle word vocabulary list"
                    >
                      ENGLISH / {category.toUpperCase()}
                    </div>

                    {/* Word Mode Toggle/Cycle */}
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

                    {/* Time Mode Toggle/Cycle */}
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
                  <div ref={wordsContainerRef} className="words-container">
                    {renderTypingText()}
                  </div>
                </div>

                {/* Divider Line */}
                <div className="divider-line" />

                {/* Live Stats and Reset Button */}
                <div className="stats-footer-bar">
                  <div className="stat-box">
                    <span className="stat-label">WPM</span>
                    <span className="stat-value">{wpm}</span>
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
                    <span className="stat-value">{accuracy}%</span>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* LEADERBOARD VIEW */}
        {activeTab === "leaderboard" && (
          <div className="panel-container">
            <div style={{ display: "flex", justifyContent: "between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 className="panel-title" style={{ margin: 0 }}>Top Speeds</h2>
              {leaderboard.length > 0 && (
                <button className="results-btn" onClick={clearLeaderboard} style={{ padding: "0.3rem 0.8rem", fontSize: "0.75rem" }}>
                  Clear Leaderboard
                </button>
              )}
            </div>

            {leaderboard.length === 0 ? (
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                No records yet. Complete a test to register your speed!
              </p>
            ) : (
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>WPM</th>
                    <th>Accuracy</th>
                    <th>Mode</th>
                    <th>Category</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, idx) => (
                    <tr key={idx}>
                      <td style={{ color: "var(--primary-accent)", fontWeight: "bold" }}>#{idx + 1}</td>
                      <td style={{ fontWeight: "bold" }}>{entry.wpm}</td>
                      <td>{entry.accuracy}%</td>
                      <td>{entry.mode}</td>
                      <td>{entry.category}</td>
                      <td>{entry.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* SETTINGS VIEW */}
        {activeTab === "settings" && (
          <div className="panel-container">
            <h2 className="panel-title">Visuals & Performance</h2>
            
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-name">Tactile Click Sound</span>
                <span className="setting-desc">Simulate mechanical switches when pressing keys</span>
              </div>
              <button 
                className={`results-btn ${clickSound ? "primary" : ""}`}
                onClick={() => setClickSound(!clickSound)}
              >
                {clickSound ? "ON" : "OFF"}
              </button>
            </div>

            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-name">Focus Mode Dimming</span>
                <span className="setting-desc">Fade peripheral navigation elements while typing</span>
              </div>
              <button 
                className={`results-btn ${enableFocusMode ? "primary" : ""}`}
                onClick={() => setEnableFocusMode(!enableFocusMode)}
              >
                {enableFocusMode ? "ON" : "OFF"}
              </button>
            </div>

            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-name">Key Sound Volume</span>
                <span className="setting-desc">Adjust the volume of mechanical switch feedback</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <input 
                  type="range" 
                  min="0.01" 
                  max="0.2" 
                  step="0.01" 
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  disabled={!clickSound}
                  style={{ cursor: "pointer" }}
                />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", width: "3ch" }}>
                  {Math.round(volume * 1000)}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className={`footer-bar focus-transition ${isTestActive && enableFocusMode ? "dimmed-focus" : ""}`}>
        <div className="footer-left">
          &copy; 2026 FLOWTYPE. SHARPEN YOUR FOCUS.
        </div>
        <div className="footer-right">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="footer-link">Github</a>
          <a href="https://discord.com" target="_blank" rel="noreferrer" className="footer-link">Discord</a>
          <a href="#" className="footer-link">Privacy</a>
          <a href="#" className="footer-link">Terms</a>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createTypingSessionLog, type SessionLogEntry } from "@/lib/sessionLog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  RotateCcw,
  ArrowRight,
  Pencil,
  Layout,
  Focus,
  BarChart3,
} from "lucide-react";

interface TypingSession {
  id: string;
  date: string;
  wpm: number;
  accuracy: number;
  duration: number; // in seconds
  mode: string;
  text: string;
  // Additional metrics
  grossWPM?: number; // chars/5 per minute
  netWPM?: number;   // gross - uncorrected errors per minute
  keystrokes?: number;
  mistakes?: number; // keys that didn't match expected
  backspaces?: number;
  uncorrectedErrors?: number; // mismatches remaining at completion
}

interface TypingStats {
  totalSessions: number;
  averageWPM: number;
  bestWPM: number;
  averageAccuracy: number;
  totalWordsTyped: number;
  timeSpent: number; // in minutes
}

interface DailyTarget {
  date: string;
  target: number;
  completed: number;
}

const TYPING_TEXTS = [
  "Breathe deeply and let your fingers flow across the keys like water over smooth stones. Each keystroke is a moment of presence, each word a step toward inner peace.",
  "The gentle rhythm of typing can become a meditation. Notice how your hands move with purpose, creating words that carry meaning and intention across the digital space.",
  "In this moment of practice, there is only you and the text. Let go of the rush, embrace the flow, and find tranquility in the simple act of thoughtful typing.",
  "Like autumn leaves falling gently to the ground, let each character appear naturally on the screen. There is no hurry, only the peaceful dance of fingers and keys.",
  "Concentrate your attention on each letter as it appears. Precision and accuracy matter more than speed. Build muscle memory through deliberate, mindful practice.",
  "Focus eliminates distractions and sharpens your ability to type with intention. Every correct keystroke reinforces neural pathways that lead to effortless typing mastery.",
  "The mind that can focus on typing can focus on anything. Use this practice to train your attention, building concentration that extends far beyond the keyboard.",
  "Sharp focus transforms typing from mechanical repetition into skillful expression. Channel your mental energy into creating perfect, purposeful text with every session.",
  "Through consistent practice, your fingers learn to dance across the keyboard with increasing fluency. Each session builds upon the last, creating a foundation of skill.",
  "Mindful typing is about more than speed or accuracy. It is about being present with each keystroke, finding rhythm in the repetition, and peace in the process.",
  "The keyboard becomes an extension of your thoughts when you approach typing with intention and awareness. Let each word flow naturally from mind to screen.",
  "In the quiet moments between keystrokes, find space for reflection. Typing practice can be a moving meditation, a way to center yourself in the present moment."
];

const WORD_COUNTS = {
  short: 25,
  medium: 50,
  long: 75
};

export default function TypingApp() {
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [stats, setStats] = useState<TypingStats | null>(null);
  const [currentSession, setCurrentSession] = useState<TypingSession | null>(null);
  const [dailyTarget, setDailyTarget] = useState<DailyTarget | null>(null);
  const [showTargetInput, setShowTargetInput] = useState(false);
  const [targetInput, setTargetInput] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'focus' | 'stats'>('basic');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const prevPosRef = useRef<{ left: number; top: number } | null>(null);
  const cursorAnimRef = useRef<Animation | null>(null);
  const [keystrokes, setKeystrokes] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [backspaces, setBackspaces] = useState(0);
  const [lastSession, setLastSession] = useState<TypingSession | null>(null);
  const typingLog = useMemo(() => createTypingSessionLog<TypingSession>(), []);
  const [todayEntries, setTodayEntries] = useState<SessionLogEntry<TypingSession>[]>([]);

  // Precompute words and word start indices for efficient rendering
  const words = useMemo(() => currentText.split(' '), [currentText]);
  const wordStarts = useMemo(() => {
    let acc = 0;
    return words.map((w, i) => {
      const start = acc;
      acc += w.length + 1; // +1 for the space after each word
      return start;
    });
  }, [words]);

  // Load stats and daily target from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('typing-stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    } else {
      const initialStats: TypingStats = {
        totalSessions: 0,
        averageWPM: 0,
        bestWPM: 0,
        averageAccuracy: 0,
        totalWordsTyped: 0,
        timeSpent: 0
      };
      setStats(initialStats);
    }

    // Load daily target
    const today = new Date().toDateString();
    const savedTarget = localStorage.getItem('typing-daily-target');
    if (savedTarget) {
      const target: DailyTarget = JSON.parse(savedTarget);
      if (target.date === today) {
        setDailyTarget(target);
      } else {
        // New day, reset counter
        const newTarget: DailyTarget = {
          date: today,
          target: target.target,
          completed: 0
        };
        setDailyTarget(newTarget);
        localStorage.setItem('typing-daily-target', JSON.stringify(newTarget));
      }
    }

    // Load today's last session
    try {
      const today = typingLog.readToday();
      setTodayEntries(today);
      if (today.length > 0) setLastSession(today[today.length - 1].data);
    } catch {}

    // Live updates when sessions are appended (or storage changes in another tab)
    const refresh = () => {
      try {
        setTodayEntries(typingLog.readToday());
      } catch {}
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith("session-log:typing:")) refresh();
    };
    const onInternal = () => refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("sessionlog-update", onInternal as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("sessionlog-update", onInternal as EventListener);
    };
  }, []);

  // Generate new text when length changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    generateNewText();
  }, [length]);

  // Timer logic
  useEffect(() => {
    if (isActive && startTime) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, startTime]);

  // Handle keyboard input
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFocused) return;

      // Handle Enter key for next session
      if (e.key === 'Enter' && currentSession) {
        e.preventDefault();
        generateNewText();
        return;
      }

      if (currentSession) return;

      // Prevent default for most keys except special ones
      if (!['Tab', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        resetSession();
      } else if (e.key === 'Backspace') {
        if (userInput.length > 0) {
          setUserInput(prev => prev.slice(0, -1));
          setBackspaces((b) => b + 1);
        }
      } else if (e.key.length === 1) {
        // Start session on first character
        if (!isActive && userInput.length === 0) {
          setIsActive(true);
          setStartTime(Date.now());
        }

        const newInput = userInput + e.key;
        setKeystrokes((k) => k + 1);
        if (e.key !== currentText[userInput.length]) {
          setMistakes((m) => m + 1);
        }
        setUserInput(newInput);

        // Check if typing is complete
        if (newInput.length === currentText.length) {
          completeSession(newInput);
        }
      }
    };

    if (isFocused) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFocused, userInput, isActive, currentText, currentSession]);

  // Smooth caret movement using transform-based animation
  useEffect(() => {
    const container = textContainerRef.current;
    const cursor = cursorRef.current;
    if (!container || !cursor) return;

    // Show cursor only when focused and no completed session
    const shouldShow = isFocused && !currentSession;
    cursor.style.display = shouldShow ? "block" : "none";
    if (!shouldShow) {
      if (cursorAnimRef.current) {
        cursorAnimRef.current.cancel();
        cursorAnimRef.current = null;
      }
      prevPosRef.current = null;
      return;
    }

    // Find target element by data index
    const idx = userInput.length;
    const target = container.querySelector<HTMLElement>(`[data-idx="${idx}"]`);
    if (!target) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const left = targetRect.left - containerRect.left + container.scrollLeft;
    const top = targetRect.top - containerRect.top + container.scrollTop;

    // Adjust caret height to target line height
    cursor.style.height = `${targetRect.height}px`;

    // Animate via transform for smoothness
    cursor.style.left = "0px";
    cursor.style.top = "0px";

    const toTransform = `translate(${left}px, ${top}px)`;

    // If first paint, jump without animation
    if (!prevPosRef.current) {
      if (cursorAnimRef.current) {
        cursorAnimRef.current.cancel();
        cursorAnimRef.current = null;
      }
      cursor.style.transform = toTransform;
      prevPosRef.current = { left, top };
      return;
    }

    const from = prevPosRef.current;
    const fromTransform = `translate(${from.left}px, ${from.top}px)`;

    // Compute distance-based duration for constant speed
    const dx = left - from.left;
    const dy = top - from.top;
    const distance = Math.hypot(dx, dy);
    const SPEED_PX_PER_MS = 2.0; // ~2000 px/s
    const MIN_DUR = 60;
    const MAX_DUR = 220;
    const duration = Math.max(MIN_DUR, Math.min(MAX_DUR, Math.round(distance / SPEED_PX_PER_MS)));

    if (cursorAnimRef.current) {
      cursorAnimRef.current.cancel();
      cursorAnimRef.current = null;
    }

    // Set final transform so end state persists
    cursor.style.transform = toTransform;

    cursorAnimRef.current = cursor.animate(
      [{ transform: fromTransform }, { transform: toTransform }],
      {
        duration,
        iterations: 1,
        easing: "cubic-bezier(.2,.8,.2,1)",
        fill: "both",
      }
    );

    const clear = () => {
      cursorAnimRef.current = null;
    };
    cursorAnimRef.current.onfinish = clear;
    cursorAnimRef.current.oncancel = clear;

    prevPosRef.current = { left, top };

    // Auto-scroll to keep caret in view
    const margin = 24; // px
    const viewTop = container.scrollTop;
    const viewBottom = viewTop + container.clientHeight;
    const caretBottom = top + targetRect.height;
    if (top < viewTop + margin) {
      container.scrollTop = Math.max(0, top - margin);
    } else if (caretBottom > viewBottom - margin) {
      container.scrollTop = caretBottom - container.clientHeight + margin;
    }
    const viewLeft = container.scrollLeft;
    const viewRight = viewLeft + container.clientWidth;
    const caretRight = left + 2; // caret width ~2px
    if (left < viewLeft + margin) {
      container.scrollLeft = Math.max(0, left - margin);
    } else if (caretRight > viewRight - margin) {
      container.scrollLeft = caretRight - container.clientWidth + margin;
    }
  }, [userInput, isFocused, currentSession, currentText]);

  const generateNewText = useCallback(() => {
    // Get a random text
    const randomText = TYPING_TEXTS[Math.floor(Math.random() * TYPING_TEXTS.length)];
    
    // Split into words and limit based on selected length
    const wordLimit = WORD_COUNTS[length];
    const words = randomText.split(' ');
    
    // If the random text doesn't have enough words, combine multiple texts
    let finalWords = words;
    while (finalWords.length < wordLimit) {
      const additionalText = TYPING_TEXTS[Math.floor(Math.random() * TYPING_TEXTS.length)];
      finalWords = [...finalWords, ...additionalText.split(' ')];
    }
    
    // Take exactly the number of words we want
    const selectedWords = finalWords.slice(0, wordLimit);
    setCurrentText(selectedWords.join(' '));
    
    // Reset state
    setUserInput('');
    setIsActive(false);
    setStartTime(null);
    setElapsedTime(0);
    setCurrentSession(null);
    setIsFocused(true);
    setKeystrokes(0);
    setMistakes(0);
    setBackspaces(0);
    setTimeout(() => textContainerRef.current?.focus(), 100);
  }, [length]);

  const completeSession = useCallback((finalInput: string) => {
    setIsActive(false);
    
    const duration = Math.max(elapsedTime, 1);
    const minutes = duration / 60;
    const charsTyped = finalInput.length;
    const grossWPM = (charsTyped / 5) / minutes;
    
    // Calculate accuracy
    let correctChars = 0;
    for (let i = 0; i < Math.min(finalInput.length, currentText.length); i++) {
      if (finalInput[i] === currentText[i]) {
        correctChars++;
      }
    }
    const accuracy = Math.round((correctChars / currentText.length) * 100);
    const uncorrectedErrors = currentText.length - correctChars;
    const netWPM = Math.max(0, grossWPM - (uncorrectedErrors / minutes));

    const session: TypingSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      wpm: Math.round(netWPM),
      accuracy,
      duration,
      mode: length,
      text: currentText.substring(0, 50) + '...',
      grossWPM: Math.round(grossWPM),
      netWPM: Math.round(netWPM),
      keystrokes,
      mistakes,
      backspaces,
      uncorrectedErrors,
    };

    setCurrentSession(session);
    saveSession(session);
    updateDailyCounter();
  }, [elapsedTime, currentText, length]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveSession = useCallback((session: TypingSession) => {
    // Save session to history (legacy list)
    const savedSessions = localStorage.getItem('typing-sessions');
    let sessions: TypingSession[] = savedSessions ? JSON.parse(savedSessions) : [];
    sessions.unshift(session); // Add to beginning
    
    // Keep only last 50 sessions
    sessions = sessions.slice(0, 50);
    localStorage.setItem('typing-sessions', JSON.stringify(sessions));

    // Append to today's session log and update last session
    typingLog.append(session);
    setLastSession(session);
    try {
      setTodayEntries(typingLog.readToday());
    } catch {}

    // Update stats
    if (stats) {
      const newStats: TypingStats = {
        totalSessions: stats.totalSessions + 1,
        averageWPM: Math.round(((stats.averageWPM * stats.totalSessions) + session.wpm) / (stats.totalSessions + 1)),
        bestWPM: Math.max(stats.bestWPM, session.wpm),
        averageAccuracy: Math.round(((stats.averageAccuracy * stats.totalSessions) + session.accuracy) / (stats.totalSessions + 1)),
        totalWordsTyped: stats.totalWordsTyped + currentText.split(' ').length,
        timeSpent: stats.timeSpent + Math.round(session.duration / 60)
      };
      
      setStats(newStats);
      localStorage.setItem('typing-stats', JSON.stringify(newStats));
    }
  }, [stats, currentText]);

  const updateDailyCounter = useCallback(() => {
    if (dailyTarget) {
      const updatedTarget = {
        ...dailyTarget,
        completed: dailyTarget.completed + 1
      };
      setDailyTarget(updatedTarget);
      localStorage.setItem('typing-daily-target', JSON.stringify(updatedTarget));
    }
  }, [dailyTarget]); // eslint-disable-line react-hooks/exhaustive-deps

  const setDailyTargetValue = () => {
    const target = parseInt(targetInput);
    if (target > 0) {
      const today = new Date().toDateString();
      const newTarget: DailyTarget = {
        date: today,
        target: target,
        completed: dailyTarget?.completed || 0
      };
      setDailyTarget(newTarget);
      localStorage.setItem('typing-daily-target', JSON.stringify(newTarget));
      setShowTargetInput(false);
      setTargetInput('');
    }
  };

  // Initialize target input when editing starts
  const handleEditTarget = () => {
    setTargetInput((dailyTarget?.target || '').toString());
    setShowTargetInput(true);
  };

  const resetSession = () => {
    setUserInput('');
    setIsActive(false);
    setStartTime(null);
    setElapsedTime(0);
    setCurrentSession(null);
    setIsFocused(true);
    setKeystrokes(0);
    setMistakes(0);
    setBackspaces(0);
    textContainerRef.current?.focus();
  };

  const handleTextClick = () => {
    if (!currentSession) {
      setIsFocused(true);
      textContainerRef.current?.focus();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCharacterClass = (index: number) => {
    if (index < userInput.length) {
      // Already typed
      if (userInput[index] === currentText[index]) {
        return 'text-green-700'; // Correct
      } else {
        return 'text-red-600 bg-red-100'; // Incorrect
      }
    } else {
      // Not yet typed
      return 'text-gray-500'; // Pending
    }
  };

  const getCurrentWPM = () => {
    if (!isActive || elapsedTime === 0) return 0;
    const minutes = elapsedTime / 60;
    const gross = (userInput.length / 5) / minutes;
    let currentErrors = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] !== currentText[i]) currentErrors++;
    }
    const net = Math.max(0, gross - currentErrors / minutes);
    return Math.round(net);
  };

  const getCurrentAccuracy = () => {
    if (userInput.length === 0) return 100;
    let correctChars = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === currentText[i]) {
        correctChars++;
      }
    }
    return Math.round((correctChars / userInput.length) * 100);
  };

  const progress = (userInput.length / currentText.length) * 100;

  // Calculate dynamic height based on text length
  const getTextHeight = () => {
    const wordCount = currentText.split(' ').length;
    if (wordCount <= 30) return '300px';
    if (wordCount <= 60) return '400px';
    return '500px';
  };

  return (
    <>
      <div className="h-full bg-white font-syne overflow-hidden">
        <div className="h-full overflow-y-auto">
        <div className="w-full p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6 border-b-2 border-black pb-4">

            <div className="flex items-center gap-2">              
              {/* Tab Navigation */}
              <div className="flex border-2 border-black" style={{ borderRadius: '0px' }}>
                <Button
                  variant={activeTab === 'basic' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('basic')}
                  className="border-r-2 border-black rounded-none px-3"
                >
                  <Layout className="w-4 h-4 mr-1" />
                  Mindful Typing
                </Button>
                <Button
                  variant={activeTab === 'focus' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('focus')}
                  className="border-r-2 border-black rounded-none px-3"
                >
                  <Focus className="w-4 h-4 mr-1" />
                  Focus
                </Button>
                <Button
                  variant={activeTab === 'stats' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('stats')}
                  className="rounded-none px-3"
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Stats
                </Button>
              </div>
            </div>

                         {/* Daily Counter and Focus Mode */}
             <div className="ml-auto flex items-center gap-2">
               {showTargetInput ? (
                 <div className="flex items-center gap-2">
                   <span className="text-sm font-bold">Daily Target:</span>
                   <Input
                     type="number"
                     value={targetInput}
                     onChange={(e) => setTargetInput(e.target.value)}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter') {
                         setDailyTargetValue();
                       } else if (e.key === 'Escape') {
                         setShowTargetInput(false);
                         setTargetInput('');
                       }
                     }}
                     placeholder="Enter sessions"
                     className="w-24 h-8 border-2 border-black text-xs"
                     style={{ borderRadius: '0px' }}
                     autoFocus
                   />
                   <Button
                     onClick={setDailyTargetValue}
                     size="sm"
                     className="border-2 border-black bg-black text-white h-8 px-2"
                     style={{ borderRadius: '0px' }}
                   >
                     Set
                   </Button>
                   <Button
                     onClick={() => setShowTargetInput(false)}
                     size="sm"
                     variant="outline"
                     className="border-2 border-black h-8 px-2"
                     style={{ borderRadius: '0px' }}
                   >
                     Cancel
                   </Button>
                 </div>
               ) : (
                 <div 
                   className="flex items-center gap-1 group cursor-pointer"
                   onClick={handleEditTarget}
                 >
                   <span className="text-sm font-bold">
                     Today {dailyTarget?.completed ?? 0}/{dailyTarget?.target ?? 0}
                   </span>
                   <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                 </div>
               )}
             </div>
          </div>


          {activeTab === 'focus' ? (
            /* Focus Mode - Only Typing Area */
            <div className="flex flex-col gap-6 h-[calc(100vh-180px)]">
              {/* Text Display Only */}
              <Card 
                className="border-2 border-black bg-gray-50"
                style={{ 
                  borderRadius: '0px', 
                  boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                  height: '100%',
                  minHeight: '400px'
                }}
              >
                <CardContent className="p-6 h-full flex flex-col">
                  <Progress 
                    value={progress} 
                    className="h-2 mb-6 border border-gray-300" 
                    style={{ borderRadius: '0px' }}
                  />
                  
                  {!currentSession && (
                    <div className="text-center mb-4 text-gray-600 text-sm">
                      {!isFocused ? "Click on the text below to start typing" : 
                       !isActive ? "Start typing to begin your session • Use backspace to correct mistakes" :
                       "Use backspace to correct mistakes"}
                    </div>
                  )}
                  
                  {currentSession && (
                    <div className="text-center mb-4 text-green-600 text-sm font-bold">
                      Session Complete! Press Enter or click Next to continue
                    </div>
                  )}
                  
                  <div 
                    ref={textContainerRef}
                    className={`text-xl leading-relaxed font-mono overflow-y-auto cursor-text select-none p-4 border border-dashed border-gray-300 ${
                      isFocused ? 'border-blue-400 bg-blue-50' : 'hover:border-gray-400'
                    } transition-all duration-200 flex-1`}
                    onClick={handleTextClick}
                    onBlur={handleBlur}
                    tabIndex={0}
                    style={{ 
                      outline: 'none',
                      lineHeight: '1.8',
                      position: 'relative'
                    }}
                  >
                    {/* Smooth animated caret overlay */}
                    <div
                      ref={cursorRef}
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '2px',
                        height: '1em',
                        backgroundColor: '#3b82f6',
                        transform: 'translate(0px, 0px)',
                        willChange: 'transform',
                        zIndex: 10,
                        pointerEvents: 'none',
                      }}
                    />
                    {words.map((word, wordIndex) => (
                      <span key={wordIndex} style={{ whiteSpace: 'nowrap', display: 'inline-block', marginRight: '0.3em' }}>
                        {word.split('').map((char, charIndex) => {
                          const globalIndex = wordStarts[wordIndex] + charIndex;
                          return (
                            <span
                              key={globalIndex}
                              className={`${getCharacterClass(globalIndex)}`}
                              style={{ position: 'relative' }}
                              data-idx={globalIndex}
                            >
                              {char}
                            </span>
                          );
                        })}
                        {wordIndex < words.length - 1 && (
                          <span
                            className={`${getCharacterClass(wordStarts[wordIndex] + word.length)}`}
                            style={{ position: 'relative' }}
                            data-idx={wordStarts[wordIndex] + word.length}
                          >
                            {'\u00A0'}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : activeTab === 'stats' ? (
            /* Stats Mode - Only Statistics */
            <div className="flex flex-col gap-6 h-[calc(100vh-180px)]">
              {/* Overall Stats */}
              {stats && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-black font-playfair border-b-2 border-black pb-2">
                    OVERALL STATISTICS
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card 
                      className="border-2 border-black bg-white text-center"
                      style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                    >
                      <CardContent className="p-6">
                        <div className="text-3xl font-bold text-black font-playfair">
                          {stats.bestWPM}
                        </div>
                        <div className="text-sm text-gray-600 font-bold tracking-wider">BEST WPM</div>
                      </CardContent>
                    </Card>

                    <Card 
                      className="border-2 border-black bg-white text-center"
                      style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                    >
                      <CardContent className="p-6">
                        <div className="text-3xl font-bold text-black font-playfair">
                          {stats.averageWPM}
                        </div>
                        <div className="text-sm text-gray-600 font-bold tracking-wider">AVERAGE WPM</div>
                      </CardContent>
                    </Card>

                    <Card 
                      className="border-2 border-black bg-white text-center"
                      style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                    >
                      <CardContent className="p-6">
                        <div className="text-3xl font-bold text-black font-playfair">
                          {stats.averageAccuracy}%
                        </div>
                        <div className="text-sm text-gray-600 font-bold tracking-wider">AVERAGE ACCURACY</div>
                      </CardContent>
                    </Card>

                    <Card 
                      className="border-2 border-black bg-white text-center"
                      style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                    >
                      <CardContent className="p-6">
                        <div className="text-3xl font-bold text-black font-playfair">
                          {stats.totalSessions}
                        </div>
                        <div className="text-sm text-gray-600 font-bold tracking-wider">TOTAL SESSIONS</div>
                      </CardContent>
                    </Card>

                    <Card 
                      className="border-2 border-black bg-white text-center"
                      style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                    >
                      <CardContent className="p-6">
                        <div className="text-3xl font-bold text-black font-playfair">
                          {stats.totalWordsTyped}
                        </div>
                        <div className="text-sm text-gray-600 font-bold tracking-wider">WORDS TYPED</div>
                      </CardContent>
                    </Card>

                    <Card 
                      className="border-2 border-black bg-white text-center"
                      style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                    >
                      <CardContent className="p-6">
                        <div className="text-3xl font-bold text-black font-playfair">
                          {stats.timeSpent}m
                        </div>
                        <div className="text-sm text-gray-600 font-bold tracking-wider">TIME SPENT</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
              {/* Typing Area - 2 columns */}
              <div className="lg:col-span-2 flex flex-col gap-6">
              

              {/* Text Display */}
              <Card 
                className="border-2 border-black bg-gray-50 pt-0"
                style={{ 
                  borderRadius: '0px', 
                  boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                  height: getTextHeight(),
                  minHeight: getTextHeight()
                }}
              >
                <CardContent className="p-6 h-full flex flex-col">
                <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
                    <div className="flex gap-2">
                      <Button
                        variant={length === 'short' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setLength('short')}
                        className="border-2 border-black"
                        style={{ borderRadius: '0px' }}
                      >
                        Short
                      </Button>
                      <Button
                        variant={length === 'medium' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setLength('medium')}
                        className="border-2 border-black"
                        style={{ borderRadius: '0px' }}
                      >
                        Medium
                      </Button>
                      <Button
                        variant={length === 'long' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setLength('long')}
                        className="border-2 border-black"
                        style={{ borderRadius: '0px' }}
                      >
                        Long
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={resetSession}
                        variant="outline"
                        className="border-2 border-black"
                        style={{ borderRadius: '0px' }}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                      
                      {currentSession && (
                        <Button
                          onClick={generateNewText}
                          className="border-2 border-black bg-black text-white"
                          style={{ borderRadius: '0px' }}
                        >
                          Next
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <Progress 
                    value={progress} 
                    className="h-2 mb-6 border border-gray-300" 
                    style={{ borderRadius: '0px' }}
                  />
                  
                  {!currentSession && (
                    <div className="text-center mb-4 text-gray-600 text-sm">
                      {!isFocused ? "Click on the text below to start typing" : 
                       !isActive ? "Start typing to begin your session • Use backspace to correct mistakes" :
                       "Use backspace to correct mistakes"}
                    </div>
                  )}
                  
                  {currentSession && (
                    <div className="text-center mb-4 text-green-600 text-sm font-bold">
                      Session Complete! Press Enter or click Next to continue
                    </div>
                  )}
                  
                  <div 
                    ref={textContainerRef}
                    className={`text-xl leading-relaxed font-mono overflow-y-auto cursor-text select-none p-4 border border-dashed border-gray-300 ${
                      isFocused ? 'border-blue-400 bg-blue-50' : 'hover:border-gray-400'
                    } transition-all duration-200 flex-1`}
                    onClick={handleTextClick}
                    onBlur={handleBlur}
                    tabIndex={0}
                    style={{ 
                      outline: 'none',
                      lineHeight: '1.8',
                      position: 'relative'
                    }}
                  >
                    {/* Smooth animated caret overlay */}
                    <div
                      ref={cursorRef}
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '2px',
                        height: '1em',
                        backgroundColor: '#3b82f6',
                        transform: 'translate(0px, 0px)',
                        willChange: 'transform',
                        zIndex: 10,
                        pointerEvents: 'none',
                      }}
                    />
                    {words.map((word, wordIndex) => (
                      <span key={wordIndex} style={{ whiteSpace: 'nowrap', display: 'inline-block', marginRight: '0.3em' }}>
                        {word.split('').map((char, charIndex) => {
                          const globalIndex = wordStarts[wordIndex] + charIndex;
                          return (
                            <span
                              key={globalIndex}
                              className={`${getCharacterClass(globalIndex)}`}
                              style={{ position: 'relative' }}
                              data-idx={globalIndex}
                            >
                              {char}
                            </span>
                          );
                        })}
                        {wordIndex < words.length - 1 && (
                          <span
                            className={`${getCharacterClass(wordStarts[wordIndex] + word.length)}`}
                            style={{ position: 'relative' }}
                            data-idx={wordStarts[wordIndex] + word.length}
                          >
                            {'\u00A0'}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Today's Sessions - recent to oldest */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold text-black font-playfair border-b border-black pb-1">
                TODAY'S SESSIONS
              </h3>
              {todayEntries.length === 0 ? (
                <div className="text-xs text-gray-600">No sessions yet today.</div>
              ) : (
                <ul className="divide-y divide-gray-200 border border-gray-200 bg-white">
                  {[...todayEntries].reverse().map((e) => (
                    <li key={e.id} className="px-3 py-2 flex items-center justify-between text-sm">
                      <div className="flex items-baseline gap-3">
                        <span className="text-gray-600 text-xs">
                          Session {e.index}
                        </span>
                        <span className="font-semibold">{e.data.wpm} WPM</span>
                        <span className="text-gray-600">{e.data.accuracy}%</span>
                        <span className="text-gray-600">{formatTime(e.data.duration)}</span>
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-[45%]">{e.data.text}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
} 

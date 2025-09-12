"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Keyboard, 
  ArrowLeft, 
  RotateCcw, 
  Target, 
  Timer,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Settings,
  ArrowRight,
  Pencil,
  Layout,
  Focus,
  BarChart3,
  Home
} from "lucide-react";
import { useRouter } from "next/navigation";

interface TypingSession {
  id: string;
  date: string;
  wpm: number;
  accuracy: number;
  duration: number; // in seconds
  mode: string;
  text: string;
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
  const router = useRouter();
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
  }, []);

  // Generate new text when length changes
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

      if (e.key === 'Backspace') {
        if (userInput.length > 0) {
          setUserInput(prev => prev.slice(0, -1));
        }
      } else if (e.key.length === 1) {
        // Start session on first character
        if (!isActive && userInput.length === 0) {
          setIsActive(true);
          setStartTime(Date.now());
        }

        const newInput = userInput + e.key;
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

  const generateNewText = () => {
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
    setTimeout(() => textContainerRef.current?.focus(), 100);
  };

  const completeSession = (finalInput: string) => {
    setIsActive(false);
    
    const duration = elapsedTime;
    const words = finalInput.split(' ').length;
    const wpm = Math.round((words / duration) * 60);
    
    // Calculate accuracy
    let correctChars = 0;
    for (let i = 0; i < Math.min(finalInput.length, currentText.length); i++) {
      if (finalInput[i] === currentText[i]) {
        correctChars++;
      }
    }
    const accuracy = Math.round((correctChars / currentText.length) * 100);

    const session: TypingSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      wpm,
      accuracy,
      duration,
      mode: length,
      text: currentText.substring(0, 50) + '...'
    };

    setCurrentSession(session);
    saveSession(session);
    updateDailyCounter();
  };

  const saveSession = (session: TypingSession) => {
    // Save session to history
    const savedSessions = localStorage.getItem('typing-sessions');
    let sessions: TypingSession[] = savedSessions ? JSON.parse(savedSessions) : [];
    sessions.unshift(session); // Add to beginning
    
    // Keep only last 50 sessions
    sessions = sessions.slice(0, 50);
    localStorage.setItem('typing-sessions', JSON.stringify(sessions));

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
  };

  const updateDailyCounter = () => {
    if (dailyTarget) {
      const updatedTarget = {
        ...dailyTarget,
        completed: dailyTarget.completed + 1
      };
      setDailyTarget(updatedTarget);
      localStorage.setItem('typing-daily-target', JSON.stringify(updatedTarget));
    }
  };

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
    const words = userInput.split(' ').length;
    return Math.round((words / elapsedTime) * 60);
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
      <style jsx>{`
        @keyframes cursor-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .cursor-line {
          animation: cursor-blink 1s infinite;
        }
      `}</style>
      <div className="h-full bg-white font-syne overflow-hidden">
        <div className="h-full overflow-y-auto">
        <div className="w-full p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6 border-b-2 border-black pb-4">

            <div className="flex items-center gap-2">              
              {/* Tab Navigation */}
              <div className="flex border-2 border-black" style={{ borderRadius: '0px' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="border-r-2 border-black rounded-none px-3"
                >
                  <Home className="w-4 h-4 mr-1" />
                  Shine
                </Button>
                <Button
                  variant="ghost"
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
                     Today {dailyTarget?.completed || 0}/{dailyTarget?.target || 'n'}
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
                      lineHeight: '1.8'
                    }}
                  >
                    {currentText.split(' ').map((word, wordIndex) => (
                      <span key={wordIndex} style={{ whiteSpace: 'nowrap', display: 'inline-block', marginRight: '0.3em' }}>
                        {word.split('').map((char, charIndex) => {
                          const globalIndex = currentText.split(' ').slice(0, wordIndex).join(' ').length + (wordIndex > 0 ? 1 : 0) + charIndex;
                          const isCursor = globalIndex === userInput.length && isFocused && !currentSession;
                          return (
                            <span
                              key={globalIndex}
                              className={`${getCharacterClass(globalIndex)}`}
                              style={{ position: 'relative' }}
                            >
                              {isCursor && (
                                <span
                                  className="cursor-line"
                                  style={{
                                    position: 'absolute',
                                    left: '0',
                                    top: '0',
                                    width: '2px',
                                    height: '100%',
                                    backgroundColor: '#3b82f6',
                                    animation: 'cursor-blink 1s infinite',
                                    zIndex: 10
                                  }}
                                />
                              )}
                              {char}
                            </span>
                          );
                        })}
                        {wordIndex < currentText.split(' ').length - 1 && (
                          <span
                            className={`${getCharacterClass(currentText.split(' ').slice(0, wordIndex + 1).join(' ').length)}`}
                            style={{ position: 'relative' }}
                          >
                            {currentText.split(' ').slice(0, wordIndex + 1).join(' ').length === userInput.length && isFocused && !currentSession && (
                              <span
                                className="cursor-line"
                                style={{
                                  position: 'absolute',
                                  left: '0',
                                  top: '0',
                                  width: '2px',
                                  height: '100%',
                                  backgroundColor: '#3b82f6',
                                  animation: 'cursor-blink 1s infinite',
                                  zIndex: 10
                                }}
                              />
                            )}
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
                      lineHeight: '1.8'
                    }}
                  >

                    {currentText.split(' ').map((word, wordIndex) => (
                      <span key={wordIndex} style={{ whiteSpace: 'nowrap', display: 'inline-block', marginRight: '0.3em' }}>
                        {word.split('').map((char, charIndex) => {
                          const globalIndex = currentText.split(' ').slice(0, wordIndex).join(' ').length + (wordIndex > 0 ? 1 : 0) + charIndex;
                          const isCursor = globalIndex === userInput.length && isFocused && !currentSession;
                          return (
                            <span
                              key={globalIndex}
                              className={`${getCharacterClass(globalIndex)}`}
                              style={{ position: 'relative' }}
                            >
                              {isCursor && (
                                <span
                                  className="cursor-line"
                                  style={{
                                    position: 'absolute',
                                    left: '0',
                                    top: '0',
                                    width: '2px',
                                    height: '100%',
                                    backgroundColor: '#3b82f6',
                                    animation: 'cursor-blink 1s infinite',
                                    zIndex: 10
                                  }}
                                />
                              )}
                              {char}
                            </span>
                          );
                        })}
                        {wordIndex < currentText.split(' ').length - 1 && (
                          <span
                            className={`${getCharacterClass(currentText.split(' ').slice(0, wordIndex + 1).join(' ').length)}`}
                            style={{ position: 'relative' }}
                          >
                            {currentText.split(' ').slice(0, wordIndex + 1).join(' ').length === userInput.length && isFocused && !currentSession && (
                              <span
                                className="cursor-line"
                                style={{
                                  position: 'absolute',
                                  left: '0',
                                  top: '0',
                                  width: '2px',
                                  height: '100%',
                                  backgroundColor: '#3b82f6',
                                  animation: 'cursor-blink 1s infinite',
                                  zIndex: 10
                                }}
                              />
                            )}
                            {'\u00A0'}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats and Info - 1 column */}
            <div className="flex flex-col gap-6">
              {/* Current Session Stats */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-black font-playfair border-b-2 border-black pb-2">
                  CURRENT SESSION
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <Card 
                    className="border-2 border-black bg-white text-center"
                    style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                  >
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-black font-playfair">
                        {currentSession ? currentSession.wpm : getCurrentWPM()}
                      </div>
                      <div className="text-xs text-gray-600 font-bold tracking-wider">WPM</div>
                    </CardContent>
                  </Card>

                  <Card 
                    className="border-2 border-black bg-white text-center"
                    style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                  >
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-black font-playfair">
                        {currentSession ? currentSession.accuracy : getCurrentAccuracy()}%
                      </div>
                      <div className="text-xs text-gray-600 font-bold tracking-wider">ACCURACY</div>
                    </CardContent>
                  </Card>

                  <Card 
                    className="border-2 border-black bg-white text-center col-span-2"
                    style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                  >
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-black font-playfair">
                        {formatTime(elapsedTime)}
                      </div>
                      <div className="text-xs text-gray-600 font-bold tracking-wider">TIME</div>
                    </CardContent>
                  </Card>
                </div>
              </div>


            </div>
          </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
} 
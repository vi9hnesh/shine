"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Target, 
  CheckCircle,
  Plus,
  Trash2,
  Settings,
  BarChart3,
  Pencil,
} from "lucide-react";
// import { useRouter } from "next/navigation"; // Unused import

interface Task {
  id: string;
  title: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  isActive: boolean;
  completed: boolean;
}

interface PomodoroSession {
  id: string;
  date: string;
  completedPomodoros: number;
  totalFocusTime: number; // in minutes
  currentStreak: number;
  tasksCompleted: number;
}

interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number; // after how many pomodoros
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4
};

export default function PomodoroApp() {
  const [activeTab, setActiveTab] = useState<'timer' | 'tasks' | 'settings' | 'stats'>('timer');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [todaySession, setTodaySession] = useState<PomodoroSession | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskEstimate, setNewTaskEstimate] = useState('1');
  const [showSettingsEdit, setShowSettingsEdit] = useState(false);
  const [tempSettings, setTempSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    
    // Load sessions
    const savedSessions = localStorage.getItem('pomodoro-sessions');
    if (savedSessions) {
      const sessions: PomodoroSession[] = JSON.parse(savedSessions);
      const todaySessionData = sessions.find(session => 
        new Date(session.date).toDateString() === today
      );
      
      if (todaySessionData) {
        setTodaySession(todaySessionData);
        setCompletedPomodoros(todaySessionData.completedPomodoros);
      } else {
        const newSession: PomodoroSession = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          completedPomodoros: 0,
          totalFocusTime: 0,
          currentStreak: 0,
          tasksCompleted: 0
        };
        setTodaySession(newSession);
      }
    } else {
      const newSession: PomodoroSession = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        completedPomodoros: 0,
        totalFocusTime: 0,
        currentStreak: 0,
        tasksCompleted: 0
      };
      setTodaySession(newSession);
    }

    // Load tasks
    const savedTasks = localStorage.getItem('pomodoro-tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }

    // Load settings
    const savedSettings = localStorage.getItem('pomodoro-settings');
    if (savedSettings) {
      const loadedSettings = JSON.parse(savedSettings);
      setSettings(loadedSettings);
      setTempSettings(loadedSettings);
      setTimeLeft(loadedSettings.workDuration * 60);
    }

    // Load active timer
    const savedTimer = localStorage.getItem('pomodoro-timer');
    if (savedTimer) {
      try {
        const { timeLeft: savedTimeLeft, isActive: savedActive, isBreak: savedBreak, lastUpdated } = JSON.parse(savedTimer);
        const elapsed = Math.floor((Date.now() - lastUpdated) / 1000);
        const updatedTimeLeft = Math.max(0, savedTimeLeft - elapsed);
        setTimeLeft(updatedTimeLeft);
        setIsActive(savedActive && updatedTimeLeft > 0);
        setIsBreak(savedBreak);
      } catch {
        // ignore malformed data
      }
    }
    setHasInitialized(true);
  }, []);

  // Persist timer state
  useEffect(() => {
    if (!hasInitialized) return;
    localStorage.setItem('pomodoro-timer', JSON.stringify({
      timeLeft,
      isActive,
      isBreak,
      lastUpdated: Date.now(),
    }));
  }, [timeLeft, isActive, isBreak, hasInitialized]);

  // Save session to localStorage
  const saveSession = (session: PomodoroSession) => {
    const savedSessions = localStorage.getItem('pomodoro-sessions');
    let sessions: PomodoroSession[] = savedSessions ? JSON.parse(savedSessions) : [];
    
    const today = new Date().toDateString();
    sessions = sessions.filter(s => new Date(s.date).toDateString() !== today);
    sessions.push(session);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    sessions = sessions.filter(s => new Date(s.date) > thirtyDaysAgo);
    
    localStorage.setItem('pomodoro-sessions', JSON.stringify(sessions));
    setTodaySession(session);
  };

  // Save tasks to localStorage
  const saveTasks = (updatedTasks: Task[]) => {
    localStorage.setItem('pomodoro-tasks', JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  // Timer logic
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
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
  }, [isActive, timeLeft]);

  const handleSessionComplete = useCallback(() => {
    setIsActive(false);
    
    if (!isBreak) {
      // Work session completed
      const newCompletedPomodoros = completedPomodoros + 1;
      setCompletedPomodoros(newCompletedPomodoros);
      
      // Update active task
      const activeTask = tasks.find(task => task.isActive);
      if (activeTask) {
        const updatedTasks = tasks.map(task => 
          task.id === activeTask.id 
            ? { ...task, completedPomodoros: task.completedPomodoros + 1 }
            : task
        );
        saveTasks(updatedTasks);
      }
      
      // Update session data
      if (todaySession) {
        const updatedSession: PomodoroSession = {
          ...todaySession,
          completedPomodoros: newCompletedPomodoros,
          totalFocusTime: todaySession.totalFocusTime + settings.workDuration,
          currentStreak: todaySession.currentStreak + 1
        };
        saveSession(updatedSession);
      }
      
      // Start break
      setIsBreak(true);
      if (newCompletedPomodoros % settings.longBreakInterval === 0) {
        setTimeLeft(settings.longBreakDuration * 60);
      } else {
        setTimeLeft(settings.shortBreakDuration * 60);
      }
    } else {
      // Break completed
      setIsBreak(false);
      setTimeLeft(settings.workDuration * 60);
    }
  }, [isBreak, completedPomodoros, tasks, todaySession, settings]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(settings.workDuration * 60);
  };

  const addTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        estimatedPomodoros: parseInt(newTaskEstimate) || 1,
        completedPomodoros: 0,
        isActive: tasks.length === 0, // First task is active by default
        completed: false
      };
      
      // If this is the first task, deactivate others
      const updatedTasks = tasks.map(task => ({ ...task, isActive: false }));
      saveTasks([...updatedTasks, newTask]);
      setNewTaskTitle('');
      setNewTaskEstimate('1');
    }
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    saveTasks(updatedTasks);
  };

  const setActiveTask = (taskId: string) => {
    const updatedTasks = tasks.map(task => ({
      ...task,
      isActive: task.id === taskId
    }));
    saveTasks(updatedTasks);
  };

  const toggleTaskComplete = (taskId: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed }
        : task
    );
    saveTasks(updatedTasks);
  };

  const saveSettings = () => {
    setSettings(tempSettings);
    localStorage.setItem('pomodoro-settings', JSON.stringify(tempSettings));
    setTimeLeft(tempSettings.workDuration * 60);
    setShowSettingsEdit(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentTotal = () => {
    if (isBreak) {
      return completedPomodoros % settings.longBreakInterval === 0 ? 
        settings.longBreakDuration * 60 : 
        settings.shortBreakDuration * 60;
    }
    return settings.workDuration * 60;
  };

  const progress = ((getCurrentTotal() - timeLeft) / getCurrentTotal()) * 100;

  const getSessionType = () => {
    if (isBreak) {
      return completedPomodoros % settings.longBreakInterval === 0 ? "Long Break" : "Short Break";
    }
    return "Focus Session";
  };

  const activeTask = tasks.find(task => task.isActive);
  const completedTasks = tasks.filter(task => task.completed).length;

  return (
    <>
      <style jsx>{`
        @keyframes pulse-border {
          0%, 100% { border-color: #000; }
          50% { border-color: #ef4444; }
        }
        .timer-active {
          animation: pulse-border 2s infinite;
        }
      `}</style>
      <div className="h-full bg-white font-syne overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="w-full p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 border-b-2 border-black pb-4">
              <div className="flex items-center gap-2">
                {/* Tab Navigation */}
                <div className="flex w-full sm:w-auto flex-wrap border-2 border-black" style={{ borderRadius: '0px' }}>
                  <Button
                    variant={activeTab === 'timer' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('timer')}
                    className="border-r-2 border-black rounded-none px-3"
                  >
                    <Timer className="w-4 h-4 mr-1" />
                    Timer
                  </Button>
                  <Button
                    variant={activeTab === 'tasks' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('tasks')}
                    className="border-r-2 border-black rounded-none px-3"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Tasks
                  </Button>
                  <Button
                    variant={activeTab === 'settings' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('settings')}
                    className="border-r-2 border-black rounded-none px-3"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Settings
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

              {/* Daily Progress */}
              <div className="sm:ml-auto flex items-center gap-2 mt-4 sm:mt-0">
                <span className="text-sm font-bold">
                  Today {completedPomodoros}/{completedPomodoros + Math.max(0, (activeTask?.estimatedPomodoros || 0) - (activeTask?.completedPomodoros || 0))}
                </span>
              </div>
            </div>

            {/* Timer Tab */}
            {activeTab === 'timer' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[calc(100vh-180px)]">
                {/* Main Timer */}
                <div className="lg:col-span-2">
                  <Card 
                    className={`border-2 border-black bg-gray-50 h-full ${isActive ? 'timer-active' : ''}`}
                    style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                  >
                    <CardContent className="p-8 h-full flex flex-col justify-center text-center">
                      {/* Session Type */}
                      <div className="mb-6">
                        <div className="border-2 border-black px-4 py-2 bg-black text-white text-lg font-bold tracking-wider inline-block">
                          {getSessionType()}
                        </div>
                      </div>

                      {/* Active Task */}
                      {activeTask && !isBreak && (
                        <div className="mb-6">
                          <div className="text-lg font-bold text-gray-700 mb-2">CURRENT TASK</div>
                          <div className="text-xl font-bold text-black">{activeTask.title}</div>
                          <div className="text-sm text-gray-600">
                            {activeTask.completedPomodoros}/{activeTask.estimatedPomodoros} pomodoros
                          </div>
                        </div>
                      )}

                      {/* Timer Display */}
                      <div className="text-6xl sm:text-8xl lg:text-9xl font-mono font-bold text-black mb-8 font-playfair leading-none">
                        {formatTime(timeLeft)}
                      </div>
                      
                      {/* Progress Bar */}
                      <Progress 
                        value={progress} 
                        className="h-4 mb-8 border-2 border-black max-w-md mx-auto" 
                        style={{ borderRadius: '0px' }}
                      />
                      
                      {/* Controls */}
                      <div className="flex justify-center gap-4">
                        {!isActive ? (
                          <Button 
                            onClick={handleStart} 
                            size="lg" 
                            className="border-2 border-black bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg"
                            style={{ borderRadius: '0px' }}
                          >
                            <Play className="w-6 h-6 mr-2" />
                            Start
                          </Button>
                        ) : (
                          <Button 
                            onClick={handlePause} 
                            variant="outline" 
                            size="lg" 
                            className="border-2 border-black bg-white text-black hover:bg-gray-100 px-8 py-4 text-lg"
                            style={{ borderRadius: '0px' }}
                          >
                            <Pause className="w-6 h-6 mr-2" />
                            Pause
                          </Button>
                        )}
                        
                        <Button 
                          onClick={handleReset} 
                          variant="outline" 
                          size="lg" 
                          className="border-2 border-black bg-white text-black hover:bg-gray-100 px-8 py-4 text-lg"
                          style={{ borderRadius: '0px' }}
                        >
                          <RotateCcw className="w-6 h-6 mr-2" />
                          Reset
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Today's Stats */}
                <div className="flex flex-col gap-4">
                  <Card 
                    className="border-2 border-black bg-white text-center"
                    style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                  >
                    <CardContent className="p-4">
                      <div className="text-3xl font-bold text-black font-playfair">{completedPomodoros}</div>
                      <div className="text-xs text-gray-600 font-bold tracking-wider">SESSIONS TODAY</div>
                    </CardContent>
                  </Card>

                  <Card 
                    className="border-2 border-black bg-white text-center"
                    style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                  >
                    <CardContent className="p-4">
                      <div className="text-3xl font-bold text-black font-playfair">
                        {Math.floor(completedPomodoros / settings.longBreakInterval)}
                      </div>
                      <div className="text-xs text-gray-600 font-bold tracking-wider">CYCLES</div>
                    </CardContent>
                  </Card>

                  <Card 
                    className="border-2 border-black bg-white text-center"
                    style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                  >
                    <CardContent className="p-4">
                      <div className="text-3xl font-bold text-black font-playfair">
                        {todaySession?.totalFocusTime || 0}
                      </div>
                      <div className="text-xs text-gray-600 font-bold tracking-wider">FOCUS MINUTES</div>
                    </CardContent>
                  </Card>

                  <Card 
                    className="border-2 border-black bg-white text-center"
                    style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                  >
                    <CardContent className="p-4">
                      <div className="text-3xl font-bold text-black font-playfair">{completedTasks}</div>
                      <div className="text-xs text-gray-600 font-bold tracking-wider">TASKS DONE</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <div className="space-y-6 lg:h-[calc(100vh-180px)]">
                {/* Add Task */}
                <Card 
                  className="border-2 border-black bg-gray-50"
                  style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-black font-playfair border-b-2 border-black pb-2">
                      ADD TASK
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="What are you working on?"
                        className="flex-1 border-2 border-black"
                        style={{ borderRadius: '0px' }}
                        onKeyDown={(e) => e.key === 'Enter' && addTask()}
                      />
                      <Input
                        type="number"
                        value={newTaskEstimate}
                        onChange={(e) => setNewTaskEstimate(e.target.value)}
                        placeholder="Est."
                        className="w-20 border-2 border-black"
                        style={{ borderRadius: '0px' }}
                        min="1"
                      />
                      <Button
                        onClick={addTask}
                        className="border-2 border-black bg-black text-white"
                        style={{ borderRadius: '0px' }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Task List */}
                <Card 
                  className="border-2 border-black bg-white flex-1"
                  style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-black font-playfair border-b-2 border-black pb-2">
                      TODAY&apos;S TASKS
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {tasks.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          No tasks added yet. Add a task to get started!
                        </div>
                      ) : (
                        tasks.map((task) => (
                          <div
                            key={task.id}
                            className={`p-4 border-2 border-black bg-gray-50 ${
                              task.isActive ? 'bg-yellow-100' : ''
                            } ${task.completed ? 'opacity-50' : ''}`}
                            style={{ borderRadius: '0px' }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className={`font-bold ${task.completed ? 'line-through' : ''}`}>
                                  {task.title}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {task.completedPomodoros}/{task.estimatedPomodoros} pomodoros
                                  {task.isActive && <span className="ml-2 text-blue-600 font-bold">ACTIVE</span>}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant={task.isActive ? 'default' : 'outline'}
                                  onClick={() => setActiveTask(task.id)}
                                  className="border-2 border-black"
                                  style={{ borderRadius: '0px' }}
                                >
                                  <Target className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={task.completed ? 'default' : 'outline'}
                                  onClick={() => toggleTaskComplete(task.id)}
                                  className="border-2 border-black"
                                  style={{ borderRadius: '0px' }}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteTask(task.id)}
                                  className="border-2 border-black"
                                  style={{ borderRadius: '0px' }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6 lg:h-[calc(100vh-180px)]">
                <Card 
                  className="border-2 border-black bg-white"
                  style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-black font-playfair border-b-2 border-black pb-2">
                        TIMER SETTINGS
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSettingsEdit(!showSettingsEdit)}
                        className="border-2 border-black"
                        style={{ borderRadius: '0px' }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {showSettingsEdit ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold mb-2">Work Duration (minutes)</label>
                          <Input
                            type="number"
                            value={tempSettings.workDuration}
                            onChange={(e) => setTempSettings({...tempSettings, workDuration: parseInt(e.target.value) || 25})}
                            className="border-2 border-black"
                            style={{ borderRadius: '0px' }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold mb-2">Short Break (minutes)</label>
                          <Input
                            type="number"
                            value={tempSettings.shortBreakDuration}
                            onChange={(e) => setTempSettings({...tempSettings, shortBreakDuration: parseInt(e.target.value) || 5})}
                            className="border-2 border-black"
                            style={{ borderRadius: '0px' }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold mb-2">Long Break (minutes)</label>
                          <Input
                            type="number"
                            value={tempSettings.longBreakDuration}
                            onChange={(e) => setTempSettings({...tempSettings, longBreakDuration: parseInt(e.target.value) || 15})}
                            className="border-2 border-black"
                            style={{ borderRadius: '0px' }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold mb-2">Long Break Interval</label>
                          <Input
                            type="number"
                            value={tempSettings.longBreakInterval}
                            onChange={(e) => setTempSettings({...tempSettings, longBreakInterval: parseInt(e.target.value) || 4})}
                            className="border-2 border-black"
                            style={{ borderRadius: '0px' }}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={saveSettings}
                            className="border-2 border-black bg-black text-white"
                            style={{ borderRadius: '0px' }}
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => setShowSettingsEdit(false)}
                            variant="outline"
                            className="border-2 border-black"
                            style={{ borderRadius: '0px' }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-black font-playfair">{settings.workDuration}</div>
                          <div className="text-sm text-gray-600 font-bold">WORK MINUTES</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-black font-playfair">{settings.shortBreakDuration}</div>
                          <div className="text-sm text-gray-600 font-bold">SHORT BREAK</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-black font-playfair">{settings.longBreakDuration}</div>
                          <div className="text-sm text-gray-600 font-bold">LONG BREAK</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-black font-playfair">{settings.longBreakInterval}</div>
                          <div className="text-sm text-gray-600 font-bold">BREAK INTERVAL</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Technique Guide */}
                <Card 
                  className="border-2 border-black bg-gray-50"
                  style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-black font-playfair border-b-2 border-black pb-2">
                      POMODORO TECHNIQUE
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-sm text-gray-700">
                      <div>
                        <div className="font-bold text-black mb-1">1. WORK SESSION</div>
                        <div>Focus on a single task for 25 minutes without interruption</div>
                      </div>
                      <div>
                        <div className="font-bold text-black mb-1">2. SHORT BREAK</div>
                        <div>Take a 5-minute break to rest and recharge</div>
                      </div>
                      <div>
                        <div className="font-bold text-black mb-1">3. REPEAT</div>
                        <div>Continue the cycle for 3-4 sessions</div>
                      </div>
                      <div>
                        <div className="font-bold text-black mb-1">4. LONG BREAK</div>
                        <div>After 4 sessions, take a longer 15-30 minute break</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-6 lg:h-[calc(100vh-180px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card 
                    className="border-2 border-black bg-white text-center"
                    style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                  >
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-black font-playfair">{completedPomodoros}</div>
                      <div className="text-sm text-gray-600 font-bold tracking-wider">TODAY&apos;S SESSIONS</div>
                    </CardContent>
                  </Card>
                  <Card 
                    className="border-2 border-black bg-white text-center"
                    style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                  >
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-black font-playfair">{todaySession?.totalFocusTime || 0}</div>
                      <div className="text-sm text-gray-600 font-bold tracking-wider">FOCUS MINUTES</div>
                    </CardContent>
                  </Card>
                  <Card 
                    className="border-2 border-black bg-white text-center"
                    style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                  >
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-black font-playfair">{completedTasks}</div>
                      <div className="text-sm text-gray-600 font-bold tracking-wider">TASKS COMPLETED</div>
                    </CardContent>
                  </Card>
                  <Card 
                    className="border-2 border-black bg-white text-center"
                    style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                  >
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-black font-playfair">
                        {Math.floor(completedPomodoros / settings.longBreakInterval)}
                      </div>
                      <div className="text-sm text-gray-600 font-bold tracking-wider">COMPLETE CYCLES</div>
                    </CardContent>
                  </Card>
                </div>

                <Card 
                  className="border-2 border-black bg-gray-50"
                  style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-black font-playfair border-b-2 border-black pb-2">
                      PRODUCTIVITY INSIGHTS
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">Average Session Length:</span>
                        <span>{settings.workDuration} minutes</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold">Estimated Completion:</span>
                        <span>
                          {activeTask ? 
                            `${Math.max(0, activeTask.estimatedPomodoros - activeTask.completedPomodoros)} sessions remaining` :
                            'No active task'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold">Today&apos;s Progress:</span>
                        <span>{Math.round((completedTasks / Math.max(tasks.length, 1)) * 100)}% tasks completed</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
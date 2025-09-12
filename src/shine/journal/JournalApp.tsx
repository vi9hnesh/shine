"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  BookOpen, 
  Home, 
  PenTool, 
  History, 
  Lightbulb, 
  BarChart3,
  Plus,
  Trash2,
  Heart,
  Calendar,
  Search,
  Filter,
  Quote,
  Sparkles,
  TrendingUp,
  Clock,
  Star,
  Archive
} from "lucide-react";
import { useRouter } from "next/navigation";

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: 'excellent' | 'good' | 'neutral' | 'challenging' | 'difficult';
  tags: string[];
  isFavorite: boolean;
  promptUsed?: string;
  wordCount: number;
}

interface JournalPrompt {
  id: string;
  category: 'reflection' | 'gratitude' | 'growth' | 'creativity' | 'goals';
  text: string;
  isUsed: boolean;
}

interface JournalStats {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  totalWords: number;
  averageWordsPerEntry: number;
  favoriteEntries: number;
}

const JOURNAL_PROMPTS: JournalPrompt[] = [
  // Reflection
  { id: '1', category: 'reflection', text: 'What did I learn about myself today?', isUsed: false },
  { id: '2', category: 'reflection', text: 'How did I handle challenges today?', isUsed: false },
  { id: '3', category: 'reflection', text: 'What would I do differently if I could relive today?', isUsed: false },
  { id: '4', category: 'reflection', text: 'What emotions did I experience most today and why?', isUsed: false },
  
  // Gratitude
  { id: '5', category: 'gratitude', text: 'What are three things I\'m grateful for today?', isUsed: false },
  { id: '6', category: 'gratitude', text: 'Who made a positive impact on my day?', isUsed: false },
  { id: '7', category: 'gratitude', text: 'What small moments brought me joy today?', isUsed: false },
  
  // Growth
  { id: '8', category: 'growth', text: 'How did I step outside my comfort zone today?', isUsed: false },
  { id: '9', category: 'growth', text: 'What skill did I practice or improve today?', isUsed: false },
  { id: '10', category: 'growth', text: 'What feedback did I receive and how can I use it?', isUsed: false },
  
  // Creativity
  { id: '11', category: 'creativity', text: 'What inspired me today?', isUsed: false },
  { id: '12', category: 'creativity', text: 'If I could create anything tomorrow, what would it be?', isUsed: false },
  
  // Goals
  { id: '13', category: 'goals', text: 'What progress did I make toward my goals today?', isUsed: false },
  { id: '14', category: 'goals', text: 'What do I want to accomplish tomorrow?', isUsed: false },
  { id: '15', category: 'goals', text: 'What\'s one small step I can take toward my biggest goal?', isUsed: false }
];

const MOOD_COLORS = {
  excellent: 'bg-green-100 text-green-800 border-green-300',
  good: 'bg-blue-100 text-blue-800 border-blue-300',
  neutral: 'bg-gray-100 text-gray-800 border-gray-300',
  challenging: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  difficult: 'bg-red-100 text-red-800 border-red-300'
};

const MOOD_LABELS = {
  excellent: 'Excellent',
  good: 'Good',
  neutral: 'Neutral',
  challenging: 'Challenging',
  difficult: 'Difficult'
};

export default function JournalApp() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'write' | 'entries' | 'prompts' | 'stats'>('write');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [prompts, setPrompts] = useState<JournalPrompt[]>(JOURNAL_PROMPTS);
  
  // Write tab state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<JournalEntry['mood']>('neutral');
  const [tags, setTags] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  
  // Entries tab state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMood, setFilterMood] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Stats
  const [stats, setStats] = useState<JournalStats>({
    totalEntries: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalWords: 0,
    averageWordsPerEntry: 0,
    favoriteEntries: 0
  });

  // Load data from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('journal-entries');
    if (savedEntries) {
      const loadedEntries: JournalEntry[] = JSON.parse(savedEntries);
      setEntries(loadedEntries);
      calculateStats(loadedEntries);
    }

    const savedPrompts = localStorage.getItem('journal-prompts');
    if (savedPrompts) {
      setPrompts(JSON.parse(savedPrompts));
    }
  }, []);

  // Save entries to localStorage
  const saveEntries = (updatedEntries: JournalEntry[]) => {
    localStorage.setItem('journal-entries', JSON.stringify(updatedEntries));
    setEntries(updatedEntries);
    calculateStats(updatedEntries);
  };

  // Calculate statistics
  const calculateStats = (entriesData: JournalEntry[]) => {
    const totalEntries = entriesData.length;
    const totalWords = entriesData.reduce((sum, entry) => sum + entry.wordCount, 0);
    const favoriteEntries = entriesData.filter(entry => entry.isFavorite).length;
    
    // Calculate streak
    const sortedEntries = [...entriesData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date).toDateString();
      
      if (i === 0) {
        if (entryDate === today || entryDate === yesterday) {
          currentStreak = 1;
          tempStreak = 1;
        }
      } else {
        const prevDate = new Date(sortedEntries[i - 1].date).toDateString();
        const daysDiff = (new Date(prevDate).getTime() - new Date(entryDate).getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysDiff === 1) {
          tempStreak++;
          if (i === 1 || currentStreak > 0) currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
          if (i === 1) currentStreak = 0;
        }
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    setStats({
      totalEntries,
      currentStreak,
      longestStreak,
      totalWords,
      averageWordsPerEntry: totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0,
      favoriteEntries
    });
  };

  // Save new entry
  const saveEntry = () => {
    if (!title.trim() || !content.trim()) return;

    const wordCount = content.trim().split(/\s+/).length;
    
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      title: title.trim(),
      content: content.trim(),
      mood,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      isFavorite: false,
      promptUsed: selectedPrompt,
      wordCount
    };

    const updatedEntries = [newEntry, ...entries];
    saveEntries(updatedEntries);

    // Mark prompt as used
    if (selectedPrompt) {
      const updatedPrompts = prompts.map(prompt => 
        prompt.text === selectedPrompt ? { ...prompt, isUsed: true } : prompt
      );
      setPrompts(updatedPrompts);
      localStorage.setItem('journal-prompts', JSON.stringify(updatedPrompts));
    }

    // Reset form
    setTitle('');
    setContent('');
    setTags('');
    setSelectedPrompt('');
    setMood('neutral');
  };

  // Delete entry
  const deleteEntry = (entryId: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== entryId);
    saveEntries(updatedEntries);
  };

  // Toggle favorite
  const toggleFavorite = (entryId: string) => {
    const updatedEntries = entries.map(entry =>
      entry.id === entryId ? { ...entry, isFavorite: !entry.isFavorite } : entry
    );
    saveEntries(updatedEntries);
  };

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesMood = filterMood === 'all' || entry.mood === filterMood;
    const matchesCategory = filterCategory === 'all' || 
                           (filterCategory === 'favorites' && entry.isFavorite) ||
                           (filterCategory === 'prompted' && entry.promptUsed);
    
    return matchesSearch && matchesMood && matchesCategory;
  });

  // Get prompts by category
  const getPromptsByCategory = (category: string) => {
    return prompts.filter(prompt => category === 'all' || prompt.category === category);
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
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="border-r-2 border-black rounded-none px-3"
                  >
                    <Home className="w-4 h-4 mr-1" />
                    Shine
                  </Button>
                  <Button
                    variant={activeTab === 'write' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('write')}
                    className="border-r-2 border-black rounded-none px-3"
                  >
                    <PenTool className="w-4 h-4 mr-1" />
                    Write
                  </Button>
                  <Button
                    variant={activeTab === 'entries' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('entries')}
                    className="border-r-2 border-black rounded-none px-3"
                  >
                    <BookOpen className="w-4 h-4 mr-1" />
                    Entries
                  </Button>
                  <Button
                    variant={activeTab === 'prompts' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('prompts')}
                    className="border-r-2 border-black rounded-none px-3"
                  >
                    <Lightbulb className="w-4 h-4 mr-1" />
                    Prompts
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
              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm font-bold">
                  {stats.currentStreak} day streak • {stats.totalEntries} entries
                </span>
              </div>
            </div>

            {/* Write Tab */}
            {activeTab === 'write' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
                {/* Main Writing Area */}
                <div className="lg:col-span-2">
                  <Card 
                    className="border-2 border-black bg-gray-50 h-full"
                    style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-black font-playfair border-b-2 border-black pb-2">
                        NEW JOURNAL ENTRY
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 h-[calc(100%-100px)] flex flex-col">
                      {/* Selected Prompt */}
                      {selectedPrompt && (
                        <div className="mb-4 p-3 bg-yellow-50 border-2 border-yellow-300" style={{ borderRadius: '0px' }}>
                          <div className="text-sm font-bold text-yellow-800 mb-1">REFLECTION PROMPT</div>
                          <div className="text-sm text-yellow-700 italic">&ldquo;{selectedPrompt}&rdquo;</div>
                        </div>
                      )}

                      {/* Title */}
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Entry title..."
                        className="mb-4 border-2 border-black text-lg font-bold"
                        style={{ borderRadius: '0px' }}
                      />

                      {/* Content */}
                      <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's on your mind today? How are you feeling? What did you learn?"
                        className="flex-1 border-2 border-black min-h-80 resize-none"
                        style={{ borderRadius: '0px' }}
                      />

                      {/* Metadata */}
                      <div className="mt-4 space-y-3">
                        {/* Mood & Tags Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold mb-2">MOOD</label>
                            <div className="flex gap-2">
                              {Object.entries(MOOD_LABELS).map(([moodKey, label]) => (
                                <Button
                                  key={moodKey}
                                  variant={mood === moodKey ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => setMood(moodKey as JournalEntry['mood'])}
                                  className="border-2 border-black text-xs"
                                  style={{ borderRadius: '0px' }}
                                >
                                  {label}
                                </Button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-bold mb-2">TAGS</label>
                            <Input
                              value={tags}
                              onChange={(e) => setTags(e.target.value)}
                              placeholder="work, personal, goals (comma separated)"
                              className="border-2 border-black"
                              style={{ borderRadius: '0px' }}
                            />
                          </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end">
                          <Button
                            onClick={saveEntry}
                            disabled={!title.trim() || !content.trim()}
                            className="border-2 border-black bg-black text-white hover:bg-gray-800 px-8"
                            style={{ borderRadius: '0px' }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Save Entry
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Stats & Prompts */}
                <div className="flex flex-col gap-4">
                  {/* Today's Stats */}
                  <Card 
                    className="border-2 border-black bg-white"
                    style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-black font-playfair">{stats.currentStreak}</div>
                      <div className="text-xs text-gray-600 font-bold tracking-wider">DAY STREAK</div>
                    </CardContent>
                  </Card>

                  <Card 
                    className="border-2 border-black bg-white"
                    style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-black font-playfair">{stats.totalEntries}</div>
                      <div className="text-xs text-gray-600 font-bold tracking-wider">TOTAL ENTRIES</div>
                    </CardContent>
                  </Card>

                  {/* Quick Prompts */}
                  <Card 
                    className="border-2 border-black bg-white flex-1"
                    style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                  >
                    <CardHeader>
                      <CardTitle className="text-sm font-bold text-black font-playfair border-b-2 border-black pb-2">
                        QUICK PROMPTS
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {prompts.slice(0, 5).map((prompt) => (
                          <Button
                            key={prompt.id}
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPrompt(prompt.text)}
                            className="w-full text-left text-xs p-2 h-auto border-2 border-black whitespace-normal"
                            style={{ borderRadius: '0px' }}
                            disabled={prompt.isUsed}
                          >
                            <Lightbulb className="w-3 h-3 mr-2 flex-shrink-0 mt-0.5" />
                            {prompt.text}
                            {prompt.isUsed && <span className="ml-2 text-gray-400">✓</span>}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Entries Tab */}
            {activeTab === 'entries' && (
              <div className="space-y-6 h-[calc(100vh-180px)]">
                {/* Filters */}
                <Card 
                  className="border-2 border-black bg-gray-50"
                  style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                >
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search entries..."
                          className="pl-10 border-2 border-black"
                          style={{ borderRadius: '0px' }}
                        />
                      </div>
                      <select
                        value={filterMood}
                        onChange={(e) => setFilterMood(e.target.value)}
                        className="border-2 border-black p-2 bg-white"
                        style={{ borderRadius: '0px' }}
                      >
                        <option value="all">All Moods</option>
                        {Object.entries(MOOD_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="border-2 border-black p-2 bg-white"
                        style={{ borderRadius: '0px' }}
                      >
                        <option value="all">All Entries</option>
                        <option value="favorites">Favorites</option>
                        <option value="prompted">Prompted</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Entries List */}
                <Card 
                  className="border-2 border-black bg-white flex-1"
                  style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-black font-playfair border-b-2 border-black pb-2">
                      JOURNAL ENTRIES ({filteredEntries.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {filteredEntries.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          {entries.length === 0 ? 
                            "No entries yet. Start writing your first journal entry!" :
                            "No entries match your filters."
                          }
                        </div>
                      ) : (
                        filteredEntries.map((entry) => (
                          <div
                            key={entry.id}
                            className="p-4 border-2 border-black bg-gray-50"
                            style={{ borderRadius: '0px' }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold text-lg">{entry.title}</h3>
                                  {entry.isFavorite && <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />}
                                </div>
                                <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(entry.date).toLocaleDateString()}
                                  <Badge className={`text-xs ${MOOD_COLORS[entry.mood]} border-2`} style={{ borderRadius: '0px' }}>
                                    {MOOD_LABELS[entry.mood]}
                                  </Badge>
                                  <span className="text-xs">{entry.wordCount} words</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant={entry.isFavorite ? 'default' : 'outline'}
                                  onClick={() => toggleFavorite(entry.id)}
                                  className="border-2 border-black"
                                  style={{ borderRadius: '0px' }}
                                >
                                  <Heart className={`w-4 h-4 ${entry.isFavorite ? 'fill-current' : ''}`} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteEntry(entry.id)}
                                  className="border-2 border-black"
                                  style={{ borderRadius: '0px' }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {entry.promptUsed && (
                              <div className="mb-2 p-2 bg-yellow-50 border border-yellow-300 text-xs">
                                <Quote className="w-3 h-3 inline mr-1" />
                                Prompt: {entry.promptUsed}
                              </div>
                            )}
                            
                            <div className="text-sm text-gray-700 mb-2">
                              {entry.content.length > 200 ? `${entry.content.slice(0, 200)}...` : entry.content}
                            </div>
                            
                            {entry.tags.length > 0 && (
                              <div className="flex gap-1 flex-wrap">
                                {entry.tags.map((tag, index) => (
                                  <Badge 
                                    key={index}
                                    variant="outline" 
                                    className="text-xs border-2 border-black" 
                                    style={{ borderRadius: '0px' }}
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Prompts Tab */}
            {activeTab === 'prompts' && (
              <div className="space-y-6 h-[calc(100vh-180px)]">
                {['reflection', 'gratitude', 'growth', 'creativity', 'goals'].map((category) => (
                  <Card 
                    key={category}
                    className="border-2 border-black bg-white"
                    style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-black font-playfair border-b-2 border-black pb-2 capitalize">
                        {category} Prompts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {getPromptsByCategory(category).map((prompt) => (
                          <Button
                            key={prompt.id}
                            variant="outline"
                            onClick={() => {
                              setSelectedPrompt(prompt.text);
                              setActiveTab('write');
                            }}
                            className="p-4 h-auto text-left border-2 border-black whitespace-normal justify-start"
                            style={{ borderRadius: '0px' }}
                            disabled={prompt.isUsed}
                          >
                            <div className="flex items-start gap-2">
                              <Lightbulb className="w-4 h-4 flex-shrink-0 mt-1" />
                              <div>
                                <div className="text-sm font-medium">{prompt.text}</div>
                                {prompt.isUsed && (
                                  <div className="text-xs text-gray-500 mt-1">Already used ✓</div>
                                )}
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-6 h-[calc(100vh-180px)]">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card 
                    className="border-2 border-black bg-white text-center"
                    style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                  >
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-black font-playfair">{stats.totalEntries}</div>
                      <div className="text-sm text-gray-600 font-bold tracking-wider">TOTAL ENTRIES</div>
                    </CardContent>
                  </Card>

                  <Card 
                    className="border-2 border-black bg-white text-center"
                    style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                  >
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-black font-playfair">{stats.currentStreak}</div>
                      <div className="text-sm text-gray-600 font-bold tracking-wider">CURRENT STREAK</div>
                    </CardContent>
                  </Card>

                  <Card 
                    className="border-2 border-black bg-white text-center"
                    style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                  >
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-black font-playfair">{stats.longestStreak}</div>
                      <div className="text-sm text-gray-600 font-bold tracking-wider">LONGEST STREAK</div>
                    </CardContent>
                  </Card>

                  <Card 
                    className="border-2 border-black bg-white text-center"
                    style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                  >
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-black font-playfair">{stats.totalWords}</div>
                      <div className="text-sm text-gray-600 font-bold tracking-wider">TOTAL WORDS</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Writing Insights */}
                <Card 
                  className="border-2 border-black bg-gray-50"
                  style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-black font-playfair border-b-2 border-black pb-2">
                      WRITING INSIGHTS
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="font-bold">Average Words Per Entry:</span>
                          <span>{stats.averageWordsPerEntry}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold">Favorite Entries:</span>
                          <span>{stats.favoriteEntries}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold">Entries This Month:</span>
                          <span>
                            {entries.filter(entry => {
                              const entryDate = new Date(entry.date);
                              const now = new Date();
                              return entryDate.getMonth() === now.getMonth() && 
                                     entryDate.getFullYear() === now.getFullYear();
                            }).length}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="font-bold">Most Used Mood:</span>
                          <span>
                            {stats.totalEntries > 0 ? (() => {
                              const moodCounts = entries.reduce((acc, entry) => {
                                acc[entry.mood] = (acc[entry.mood] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>);
                              const mostUsed = Object.entries(moodCounts).sort(([,a], [,b]) => b - a)[0];
                              return mostUsed ? MOOD_LABELS[mostUsed[0] as keyof typeof MOOD_LABELS] : 'None';
                            })() : 'None'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold">Prompted Entries:</span>
                          <span>{entries.filter(entry => entry.promptUsed).length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold">Average Streak Length:</span>
                          <span>{stats.longestStreak > 0 ? Math.round(stats.longestStreak / 2) : 0} days</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Mood Distribution */}
                <Card 
                  className="border-2 border-black bg-white"
                  style={{ borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-black font-playfair border-b-2 border-black pb-2">
                      MOOD DISTRIBUTION
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(MOOD_LABELS).map(([moodKey, label]) => {
                        const count = entries.filter(entry => entry.mood === moodKey).length;
                        const percentage = stats.totalEntries > 0 ? (count / stats.totalEntries) * 100 : 0;
                        
                        return (
                          <div key={moodKey} className="flex items-center gap-4">
                            <Badge 
                              className={`${MOOD_COLORS[moodKey as keyof typeof MOOD_COLORS]} border-2 min-w-20 justify-center`} 
                              style={{ borderRadius: '0px' }}
                            >
                              {label}
                            </Badge>
                            <div className="flex-1 bg-gray-200 h-4 border-2 border-black" style={{ borderRadius: '0px' }}>
                              <div 
                                className="h-full bg-black" 
                                style={{ width: `${percentage}%`, borderRadius: '0px' }}
                              />
                            </div>
                            <span className="min-w-12 text-sm font-bold">{count}</span>
                          </div>
                        );
                      })}
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
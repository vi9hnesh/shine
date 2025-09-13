"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Keyboard, 
  Timer, 
  Wind, 
  Heart, 
  Music, 
  FileText,
  Newspaper,
  Mountain,
  Coffee,
  Headphones,
  PenTool,
  Calendar,
  Clock
} from "lucide-react";
import { useRouter } from "next/navigation";

const features = [
  {
    id: "typing",
    title: "Flow",
    description: "Focus-based and calming text drills to center your mind",
    icon: Keyboard,
    coming: false,
    category: "Focus"
  },
  {
    id: "reflect",
    title: "Reflect",
    description: "Lightweight reflection space with thoughtful prompts",
    icon: PenTool,
    coming: false,
    category: "Reflection"
  },
  {
    id: "pomodoro",
    title: "Pomodoro",
    description: "Focused timers with streak tracking and smart breaks",
    icon: Timer,
    coming: false,
    category: "Productivity"
  },
  {
    id: "reads",
    title: "Reads",
    description: "Warrn blog posts and industry insights for growth",
    icon: FileText,
    coming: false,
    category: "Learning"
  },
  {
    id: "breath",
    title: "Breath Breaks",
    description: "Guided breathing exercises and visual relaxation",
    icon: Wind,
    coming: true,
    category: "Wellness"
  },
  {
    id: "gallery",
    title: "Visual Galleries",
    description: "Open source collections of inspiring and calming scenes",
    icon: Mountain,
    coming: true,
    category: "Inspiration"
  },
  {
    id: "newsletter",
    title: "Weekly Newsletter",
    description: "Company culture and editorial content from your team",
    icon: Newspaper,
    coming: false,
    category: "Culture"
  },
  {
    id: "lounge",
    title: "Silent Lounge",
    description: "Metropolitan Museum mat gallery for quiet inspiration",
    icon: Coffee,
    coming: false,
    category: "Focus"
  },
  {
    id: "appreciate",
    title: "Appreciate",
    description: "Anonymous weekly reflection board for team appreciation",
    icon: Heart,
    coming: false,
    category: "Community"
  },
  {
    id: "listen",
    title: "Listen",
    description: "Curated music for productivity and calm states of mind",
    icon: Headphones,
    coming: true,
    category: "Audio"
  }
];

// Enhanced animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 15,
    scale: 0.98
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1
  }
};

const taskbarVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { 
    opacity: 1,
    y: 0
  }
};

export default function ShinePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFeatureClick = (featureId: string) => {
    const implementedFeatures = ['typing', 'reflect', 'reads', 'pomodoro', 'newsletter', 'appreciate', 'lounge'];
    const routeMap: Record<string, string> = {
      'typing': '/typing',
      'reflect': '/journal',
      'reads': '/reads',
      'pomodoro': '/pomodoro',
      'lounge': '/lounge',
      'newsletter': '/newsletter',
      'appreciate': '/appreciate'
    };
    
    if (implementedFeatures.includes(featureId)) {
      router.push(routeMap[featureId]);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="h-screen relative overflow-hidden bg-white font-syne">
      {/* Taskbar with Hero Image */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={taskbarVariants}
        className="relative z-10 border-b-2 border-black bg-white"
      >
        <div className="w-full overflow-hidden">
          <img 
            src="/mountain.png" 
            alt="Shine" 
            width={1200} 
            height={400} 
            className="w-full h-52 object-cover"
          />
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="border-2 border-black px-4 py-2 bg-black text-white text-sm font-bold tracking-wider">
              SHINE OS
            </div>
            <div className="text-xs text-gray-600 font-medium">
              Est. 2025 • Productivity Operating System
            </div>
          </div>
          
          {/* Date & Time in Menu Bar */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border-2 border-black px-3 py-1 bg-white">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">{formatDate(currentTime)}</span>
            </div>
            <div className="flex items-center gap-2 border-2 border-black px-3 py-1 bg-white">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">{formatTime(currentTime)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Desktop Area */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="p-8 h-full">
          {/* Applications Grid */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 w-full"
          >
            <AnimatePresence>
              {features.map((feature, index) => (
                <motion.div 
                  key={feature.id} 
                  className="min-w-0"
                  variants={cardVariants}
                  layout
                  whileHover={{ 
                    y: -2
                  }}
                  whileTap={{ 
                    scale: 0.98
                  }}
                >
                  <Card 
                    className="group cursor-pointer p-0 border-2 border-black bg-white hover:bg-gray-50 transition-colors duration-200 h-full overflow-hidden"
                    onClick={() => handleFeatureClick(feature.id)}
                    style={{
                      borderRadius: '0px',
                      boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)',
                    }}
                  >
                    <CardHeader className="pb-3 p-4">
                      <div className="flex items-start justify-between min-w-0">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <div className="p-2 border border-black bg-white flex-shrink-0">
                            <feature.icon className="w-5 h-5 text-black" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base font-bold text-black mb-1 tracking-tight truncate">
                              {feature.title}
                            </CardTitle>
                          </div>
                        </div>
                        {feature.coming && (
                          <Badge 
                            variant="secondary" 
                            className="border border-black bg-yellow-200 text-black font-medium text-xs tracking-wide flex-shrink-0 ml-2"
                          >
                            SOON
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 p-4">
                      <div className="pt-3 border-t border-black">
                        <CardDescription className="text-gray-700 leading-relaxed text-sm font-normal">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 
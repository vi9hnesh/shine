"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Keyboard, 
  Timer, 
  Wind, 
  Heart, 
  FileText,
  Newspaper,
  Mountain,
  Coffee,
  Headphones,
  PenTool
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
    title: "Breaks",
    description: "Guided breathing exercises and visual relaxation",
    icon: Wind,
    coming: true,
    category: "Wellness"
  },
  {
    id: "gallery",
    title: "Galleries",
    description: "Open source collections of inspiring and calming scenes",
    icon: Mountain,
    coming: true,
    category: "Inspiration"
  },
  {
    id: "newsletter",
    title: "Newsletter",
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

// Professional animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.96
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1
  }
};

// Note: top bar and mountain animations have been removed.

export default function ShinePage() {
  const router = useRouter();

  // Separate effect for preloading to run only once
  useEffect(() => {
    // Preload app routes when homepage loads
    const preloadRoutes = () => {
      const routes = ['/typing', '/journal', '/pomodoro', '/reads', '/newsletter', '/appreciate', '/lounge'];
      routes.forEach(route => router.prefetch(route));
    };

    // Start preloading after initial render
    const timeoutId = setTimeout(preloadRoutes, 100);
    
    return () => clearTimeout(timeoutId);
  }, [router]); // Include router dependency

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


  return (
    <div className="h-screen relative overflow-hidden bg-gray-50 font-sans" style={{
      backgroundImage: `
        linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px),
        linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px'
    }}>
      {/* Masthead: static mountain image (no animation) */}
      <div className="relative z-10 border-b-1 border-gray-900 bg-white shadow-lg">
        <div className="relative w-full">
          <Image
            src="/mountain.png"
            alt="Shine"
            width={1200}
            height={400}
            className="w-full h-48 object-cover opacity-90 filter brightness-110 contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          {/* Simple tagline */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex justify-end w-full">
              <div className="flex items-center justify-end gap-6">
                <div className="text-white font-light">
                  <div className="text-xs opacity-75 tracking-wide font-shine">Designed for Modern Teams</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Area */}
      <div className="relative z-10 flex-1 overflow-y-auto bg-gray-50" style={{
        backgroundImage: `
          linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px),
          linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px'
      }}>
        <div className="max-w-7xl mx-auto p-8 h-full">
          {/* Section Header */}
          <div className="mb-8 border-b-2 border-gray-900 pb-4">
            
          </div>
          
          {/* Applications Grid */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full"
          >
            <AnimatePresence>
              {features.map((feature) => (
                <motion.div 
                  key={feature.id} 
                  className="min-w-0"
                  variants={cardVariants}
                  layout
                  whileHover={{ 
                    y: -1,
                    scale: 1.01,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ 
                    scale: 0.98,
                    transition: { duration: 0.1 }
                  }}
                >
                  <Card 
                    className="group cursor-pointer p-0 border-2 border-gray-900 bg-white hover:bg-gray-50 transition-all duration-300 h-full overflow-hidden hover:shadow-lg hover:border-gray-700"
                    onClick={() => handleFeatureClick(feature.id)}
                    style={{
                      borderRadius: '0px',
                      boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.1)',
                    }}
                  >
                    <CardHeader className="pb-2 p-4">
                      <div className="flex items-center justify-between min-w-0">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="p-2 border-2 border-gray-900 bg-gray-900 flex-shrink-0">
                            <feature.icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-lg text-gray-900 mb-1 truncate font-serif">
                              {feature.title}
                            </CardTitle>
                          </div>
                        </div>
                        {feature.coming && (
                          <Badge 
                            variant="secondary" 
                            className="border border-amber-600 bg-amber-100 text-amber-800 font-bold text-xs tracking-wide flex-shrink-0 ml-2 shadow-sm"
                          >
                            SOON
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 p-4">
                      <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">
                        {feature.category}
                      </div>
                      <CardDescription className="text-gray-700 leading-snug text-md font-light font-open">
                        {feature.description}
                      </CardDescription>
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

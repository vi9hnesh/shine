"use client";

import dynamic from 'next/dynamic';

const TodaySessions = dynamic(() => import('./TodaySessions'), { 
  ssr: false,
  loading: () => <div className="text-gray-500">Loading sessions...</div>
});

export default function TodaySessionsWrapper() {
  return <TodaySessions />;
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ShineLayout from "@/components/layout/shine-layout";
import PageTransition from "@/components/layout/page-transition";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Heart, Home } from "lucide-react";

interface Note {
  id: number;
  message: string;
  upvotes: number;
  userUpvoted: boolean;
}

export default function AppreciatePage() {
  const router = useRouter();

  const sortNotes = (notes: Note[]) =>
    [...notes].sort((a, b) => b.upvotes - a.upvotes);

  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState<Note[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("appreciate-notes");
      if (stored) {
        const parsed = (JSON.parse(stored) as Note[]).map((n) => ({
          id: n.id,
          message: n.message,
          upvotes: n.upvotes ?? 0,
          userUpvoted: n.userUpvoted ?? false,
        }));
        return sortNotes(parsed);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("appreciate-notes", JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    if (message.trim().length === 0) return;
    setNotes((prev) =>
      sortNotes([
        ...prev,
        { id: Date.now(), message: message.trim(), upvotes: 0, userUpvoted: false },
      ])
    );
    setMessage("");
  };

  const toggleUpvote = (id: number) => {
    setNotes((prev) =>
      sortNotes(
        prev.map((note) =>
          note.id === id
            ? {
                ...note,
                upvotes: note.userUpvoted ? note.upvotes - 1 : note.upvotes + 1,
                userUpvoted: !note.userUpvoted,
              }
            : note
        )
      )
    );
  };

  return (
    <ShineLayout>
      <PageTransition>
        <div className="h-full bg-white font-syne overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="w-full p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 border-b-2 border-black pb-4">
              <div className="flex items-center gap-2">
                <div className="flex border-2 border-black" style={{ borderRadius: '0px' }}>
                  <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="border-r-2 border-black rounded-none px-3"
                  >
                    <Home className="w-4 h-4 mr-1" />
                    Shine
                  </Button>
                </div>
                <div className="border-2 border-black px-3 py-1 bg-black text-white text-sm font-bold tracking-wider">
                  APPRECIATE
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Card className="border-2 border-black">
                <CardHeader>
                  <CardTitle>Share appreciation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write a thank-you note..."
                    className="border-2 border-black"
                  />
                  <Button onClick={addNote} className="border-2 border-black">
                    Post
                  </Button>
                </CardContent>
              </Card>

              {notes.length === 0 && (
                <p className="text-sm text-gray-500 text-center">No appreciation notes yet</p>
              )}

              {notes.map((note) => (
                <Card key={note.id} className="border-2 border-black">
                  <CardContent className="flex items-center justify-between">
                    <p className="text-sm text-gray-800">{note.message}</p>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        onClick={() => toggleUpvote(note.id)}
                        className={`border-2 border-black p-1 h-8 w-8 transition-colors ${
                          note.userUpvoted
                            ? "bg-black text-white"
                            : "bg-white text-black hover:bg-black hover:text-white"
                        }`}
                        aria-label="Upvote"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
        </div>
      </PageTransition>
    </ShineLayout>
  );
}

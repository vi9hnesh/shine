"use client";

import { useState, useEffect } from "react";
import ShineLayout from "@/components/layout/shine-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Note {
  id: number;
  message: string;
}

export default function AppreciatePage() {
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("appreciate-notes");
    if (stored) {
      setNotes(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("appreciate-notes", JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    if (message.trim().length === 0) return;
    setNotes((prev) => [...prev, { id: Date.now(), message: message.trim() }]);
    setMessage("");
  };

  return (
    <ShineLayout>
      <div className="p-6 space-y-4">
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

        {notes.map((note) => (
          <Card key={note.id} className="border-2 border-black">
            <CardContent>
              <p className="text-sm text-gray-800">{note.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </ShineLayout>
  );
}

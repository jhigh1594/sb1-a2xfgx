"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabase } from '@/lib/supabase';

const journalPrompts = [
  "What are three things you're grateful for today?",
  "Describe a challenge you're currently facing and how you plan to overcome it.",
  "What's a recent accomplishment you're proud of and why?",
  "If you could change one thing about your day today, what would it be?",
  "Write about a person who has positively influenced your life recently.",
  "What's a new skill or hobby you'd like to learn, and why?",
  "Describe your ideal day from start to finish.",
  "What's a fear you'd like to overcome, and what steps can you take to face it?",
  "Write a letter to your future self, one year from now.",
  "What's a recent mistake you've made, and what did you learn from it?",
];

export default function JournalSection() {
  const [journalEntry, setJournalEntry] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchLatestJournalEntry();
  }, []);

  const fetchLatestJournalEntry = async () => {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('content')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching journal entry:', error);
    } else if (data && data.length > 0) {
      setJournalEntry(data[0].content);
    }
  };

  const handleJournalChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJournalEntry(e.target.value);
  };

  const getNewPrompt = () => {
    const randomPrompt = journalPrompts[Math.floor(Math.random() * journalPrompts.length)];
    setJournalEntry(randomPrompt);
  };

  const saveJournalEntry = async () => {
    if (journalEntry.trim()) {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([{ content: journalEntry }]);

      if (error) {
        console.error('Error saving journal entry:', error);
        setMessage('Failed to save journal entry. Please try again.');
      } else {
        setMessage('Journal entry saved successfully!');
      }
    } else {
      setMessage('Please write something before saving.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Your Journal Entry
            <Button onClick={getNewPrompt}>New Journal Prompt</Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Write your journal entry here..."
            value={journalEntry}
            onChange={handleJournalChange}
            rows={10}
          />
          <Button onClick={saveJournalEntry} className="w-full">
            Save Journal Entry
          </Button>
        </CardContent>
      </Card>
      {message && (
        <Alert variant={message.includes('successfully') ? 'default' : 'destructive'}>
          <AlertTitle>Notification</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DailyPlanProps {
  onUpdate?: () => void;
}

export default function DailyPlan({ onUpdate }: DailyPlanProps) {
  const [topTasks, setTopTasks] = useState(['', '', '']);
  const [additionalTasks, setAdditionalTasks] = useState(['']);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDailyPlan();
  }, []);

  const fetchDailyPlan = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('Fetching daily plan for:', today);
      const { data, error } = await supabase
        .from('daily_plans')
        .select('*')
        .eq('date', today)
        .maybeSingle();

      console.log('Daily plan data:', data);
      console.log('Daily plan error:', error);

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setTopTasks(data.top_tasks || ['', '', '']);
        setAdditionalTasks(data.additional_tasks || ['']);
        setNotes(data.notes || '');
      } else {
        // If no data found, set default empty values
        setTopTasks(['', '', '']);
        setAdditionalTasks(['']);
        setNotes('');
      }
    } catch (error) {
      console.error('Error fetching daily plan:', error);
      setError('Failed to fetch daily plan. Please try again later.');
    }
  };

  const saveDailyPlan = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('daily_plans')
        .upsert({
          date: today,
          top_tasks: topTasks.filter(task => task.trim() !== ''),
          additional_tasks: additionalTasks.filter(task => task.trim() !== ''),
          notes: notes
        }, { onConflict: 'date' });

      if (error) throw error;

      console.log('Daily plan saved successfully');
      setError(null);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error saving daily plan:', error);
      setError('Failed to save daily plan. Please try again.');
    }
  };

  const handleTopTaskChange = (index: number, value: string) => {
    const newTopTasks = [...topTasks];
    newTopTasks[index] = value;
    setTopTasks(newTopTasks);
  };

  const handleAdditionalTaskChange = (index: number, value: string) => {
    const newAdditionalTasks = [...additionalTasks];
    newAdditionalTasks[index] = value;
    setAdditionalTasks(newAdditionalTasks);
  };

  const addAdditionalTask = () => {
    setAdditionalTasks([...additionalTasks, '']);
  };

  const removeAdditionalTask = (index: number) => {
    const newAdditionalTasks = additionalTasks.filter((_, i) => i !== index);
    setAdditionalTasks(newAdditionalTasks);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div>
          <h3 className="text-lg font-semibold mb-2">Top 3 Tasks</h3>
          {topTasks.map((task, index) => (
            <Input
              key={index}
              placeholder={`Task ${index + 1}`}
              value={task}
              onChange={(e) => handleTopTaskChange(index, e.target.value)}
              className="mb-2"
            />
          ))}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Additional Tasks</h3>
          {additionalTasks.map((task, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <Input
                placeholder={`Additional Task ${index + 1}`}
                value={task}
                onChange={(e) => handleAdditionalTaskChange(index, e.target.value)}
                className="flex-grow"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeAdditionalTask(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button onClick={addAdditionalTask} className="w-full">
            <Plus className="h-4 w-4 mr-2" /> Add Additional Task
          </Button>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Notes</h3>
          <Textarea
            placeholder="Any additional notes for today..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </div>
        <Button onClick={saveDailyPlan} className="w-full">Save Daily Plan</Button>
      </CardContent>
    </Card>
  );
}
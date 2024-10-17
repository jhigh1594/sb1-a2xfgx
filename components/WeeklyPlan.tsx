"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Alert, AlertDescription } from "@/components/ui/alert"

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WeeklyPlan() {
  const [weeklyTasks, setWeeklyTasks] = useState<{ [key: string]: string[] }>(
    daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: [''] }), {})
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeeklyPlan();
  }, []);

  const fetchWeeklyPlan = async () => {
    try {
      const currentDate = new Date();
      const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1));
      const endOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 7));

      console.log('Fetching weekly plan for:', startOfWeek.toISOString(), 'to', endOfWeek.toISOString());

      const { data, error } = await supabase
        .from('weekly_plans')
        .select('*')
        .gte('date', startOfWeek.toISOString())
        .lte('date', endOfWeek.toISOString())
        .maybeSingle();

      console.log('Weekly plan data:', data);
      console.log('Weekly plan error:', error);

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setWeeklyTasks(data.tasks || daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: [''] }), {}));
      }
    } catch (error) {
      console.error('Error fetching weekly plan:', error);
      setError('Failed to fetch weekly plan. Please try again later.');
    }
  };

  const saveWeeklyPlan = async () => {
    try {
      const currentDate = new Date();
      const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1));

      const { error } = await supabase
        .from('weekly_plans')
        .upsert({
          date: startOfWeek.toISOString(),
          tasks: weeklyTasks
        }, { onConflict: 'date' });

      if (error) throw error;

      console.log('Weekly plan saved successfully');
      setError(null);
    } catch (error) {
      console.error('Error saving weekly plan:', error);
      setError('Failed to save weekly plan. Please try again.');
    }
  };

  const handleTaskChange = (day: string, index: number, value: string) => {
    const newWeeklyTasks = { ...weeklyTasks };
    newWeeklyTasks[day][index] = value;
    setWeeklyTasks(newWeeklyTasks);
  };

  const addTask = (day: string) => {
    const newWeeklyTasks = { ...weeklyTasks };
    newWeeklyTasks[day] = [...newWeeklyTasks[day], ''];
    setWeeklyTasks(newWeeklyTasks);
  };

  const removeTask = (day: string, index: number) => {
    const newWeeklyTasks = { ...weeklyTasks };
    newWeeklyTasks[day] = newWeeklyTasks[day].filter((_, i) => i !== index);
    setWeeklyTasks(newWeeklyTasks);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Plan</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {daysOfWeek.map((day) => (
          <div key={day} className="mb-4">
            <h3 className="text-lg font-semibold mb-2">{day}</h3>
            {weeklyTasks[day].map((task, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <Input
                  placeholder={`Task for ${day}`}
                  value={task}
                  onChange={(e) => handleTaskChange(day, index, e.target.value)}
                  className="flex-grow"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTask(day, index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button onClick={() => addTask(day)} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Add Task for {day}
            </Button>
          </div>
        ))}
        <Button onClick={saveWeeklyPlan} className="w-full mt-4">Save Weekly Plan</Button>
      </CardContent>
    </Card>
  );
}
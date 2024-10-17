"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SixWeekGoalsProps {
  onUpdate?: () => void;
}

export default function SixWeekGoals({ onUpdate }: SixWeekGoalsProps) {
  const [goals, setGoals] = useState(['']);

  useEffect(() => {
    fetchSixWeekGoals();
  }, []);

  const fetchSixWeekGoals = async () => {
    const { data, error } = await supabase
      .from('six_week_goals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching six week goals:', error);
    } else if (data && data.length > 0) {
      setGoals(data[0].goals || ['']);
    }
  };

  const saveSixWeekGoals = async () => {
    const { data, error } = await supabase
      .from('six_week_goals')
      .insert([{ goals: goals }]);

    if (error) {
      console.error('Error saving six week goals:', error);
    } else {
      console.log('Six week goals saved successfully');
      if (onUpdate) {
        onUpdate();
      }
    }
  };

  const handleGoalChange = (index: number, value: string) => {
    const newGoals = [...goals];
    newGoals[index] = value;
    setGoals(newGoals);
  };

  const addGoal = () => {
    setGoals([...goals, '']);
  };

  const removeGoal = (index: number) => {
    const newGoals = goals.filter((_, i) => i !== index);
    setGoals(newGoals);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>6-Week Goals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input
              placeholder={`Goal ${index + 1}`}
              value={goal}
              onChange={(e) => handleGoalChange(index, e.target.value)}
              className="flex-grow"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeGoal(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button onClick={addGoal} className="w-full">
          <Plus className="h-4 w-4 mr-2" /> Add Goal
        </Button>
        <Button onClick={saveSixWeekGoals} className="w-full">Save 6-Week Goals</Button>
      </CardContent>
    </Card>
  );
}
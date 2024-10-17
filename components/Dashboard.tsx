"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Circle, Flame, Target, Calendar } from 'lucide-react';
import JournalSection from './JournalSection';
import DailyPlan from './DailyPlan';
import WeeklyPlan from './WeeklyPlan';
import SixWeekGoals from './SixWeekGoals';
import { supabase } from '@/lib/supabase';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

interface WeeklyTasks {
  [key: string]: string[];
}

export default function Dashboard() {
  const [streak, setStreak] = useState(5);
  const [dailyTasks, setDailyTasks] = useState<Task[]>([]);
  const [currentGoals, setCurrentGoals] = useState<string[]>([]);
  const [weeklyTasks, setWeeklyTasks] = useState<WeeklyTasks>({});
  const [error, setError] = useState<string | null>(null);
  const orderedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        const response = await fetch('/api/supabase-check');
        const data = await response.json();
        if (data.status !== 'ok') {
          throw new Error(data.message);
        }
      } catch (err: any) {
        console.error('Error checking Supabase connection:', err);
        setError(`Failed to connect to Supabase: ${err.message || 'Unknown error'}. Please try again later.`);
      }
    };

    checkSupabaseConnection();
    fetchDailyTasks();
    fetchCurrentGoals();
    fetchWeeklyTasks();
  }, []);

  const fetchDailyTasks = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_plans')
        .select('*')
        .eq('date', today)
        .single();

      if (error) throw error;

      const topTasks = data.top_tasks.map((task: string, index: number) => ({
        id: index,
        text: task,
        completed: false
      }));

      const additionalTasks = data.additional_tasks.map((task: string, index: number) => ({
        id: topTasks.length + index,
        text: task,
        completed: false
      }));

      setDailyTasks([...topTasks, ...additionalTasks]);
    } catch (error) {
      console.error('Error fetching daily tasks:', error);
      setError('Failed to fetch daily tasks. Please try again later.');
    }
  };

  const fetchCurrentGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('six_week_goals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setCurrentGoals(data[0].goals || []);
      }
    } catch (error) {
      console.error('Error fetching current goals:', error);
      setError('Failed to fetch current goals. Please try again later.');
    }
  };

  const fetchWeeklyTasks = async () => {
    try {
      const currentDate = new Date();
      const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1));
      const endOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 7));

      const { data, error } = await supabase
        .from('weekly_plans')
        .select('*')
        .gte('date', startOfWeek.toISOString())
        .lte('date', endOfWeek.toISOString())
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setWeeklyTasks(data.tasks || {});
      }
    } catch (error) {
      console.error('Error fetching weekly tasks:', error);
      setError('Failed to fetch weekly tasks. Please try again later.');
    }
  };

  const completedTasks = dailyTasks.filter(task => task.completed).length;
  const progress = dailyTasks.length > 0 ? (completedTasks / dailyTasks.length) * 100 : 0;

  const toggleTask = async (id: number) => {
    const updatedTasks = dailyTasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setDailyTasks(updatedTasks);

    try {
      const today = new Date().toISOString().split('T')[0];
      const topTasks = updatedTasks.slice(0, 3).map(task => task.text);
      const additionalTasks = updatedTasks.slice(3).map(task => task.text);

      const { error } = await supabase
        .from('daily_plans')
        .upsert({
          date: today,
          top_tasks: topTasks,
          additional_tasks: additionalTasks
        }, { onConflict: 'date' });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating daily plan:', error);
      setError('Failed to update task status. Please try again.');
    }
  };

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="journal">Journal</TabsTrigger>
        <TabsTrigger value="daily">Daily Plan</TabsTrigger>
        <TabsTrigger value="weekly">Weekly Plan</TabsTrigger>
        <TabsTrigger value="sixweek">6-Week Goals</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        {error && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <p className="text-red-500">{error}</p>
            </CardContent>
          </Card>
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{streak} days</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Progress</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">{completedTasks} of {dailyTasks.length} tasks completed</p>
            </CardContent>
          </Card>
        </div>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Today's Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {dailyTasks.map(task => (
                <li key={task.id} className="flex items-center space-x-2">
                  <button onClick={() => toggleTask(task.id)}>
                    {task.completed ? <CheckCircle className="text-green-500" /> : <Circle />}
                  </button>
                  <span className={task.completed ? 'line-through text-gray-500' : ''}>{task.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="mt-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Current Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {currentGoals.map((goal, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="mt-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Weekly Tasks</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {orderedDays.map((day) => (
              <div key={day} className="mb-4">
                <h4 className="font-semibold mb-2">{day}</h4>
                <ul className="space-y-1">
                  {weeklyTasks[day]?.map((task, index) => (
                    <li key={index}>{task}</li>
                  )) || <li>No tasks</li>}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="journal">
        <JournalSection />
      </TabsContent>

      <TabsContent value="daily">
        <DailyPlan onUpdate={fetchDailyTasks} />
      </TabsContent>

      <TabsContent value="weekly">
        <WeeklyPlan />
      </TabsContent>

      <TabsContent value="sixweek">
        <SixWeekGoals onUpdate={fetchCurrentGoals} />
      </TabsContent>
    </Tabs>
  );
}
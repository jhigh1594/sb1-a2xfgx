"use client"

import Dashboard from '@/components/Dashboard';

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">AI-Powered Journal & Planner</h1>
      <Dashboard />
    </main>
  );
}
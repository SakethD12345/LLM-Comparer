import { NextResponse } from 'next/server';

// Mock leaderboard data
const leaderboard = [
  {
    model: 'GPT-4',
    accuracy: 0.92,
    speed: 1.2,
    complexity: 0.7,
    analyses: 15,
  },
  {
    model: 'Llama-2',
    accuracy: 0.88,
    speed: 1.5,
    complexity: 0.65,
    analyses: 12,
  },
  {
    model: 'Claude',
    accuracy: 0.90,
    speed: 1.1,
    complexity: 0.72,
    analyses: 10,
  },
];

export async function GET() {
  return NextResponse.json({ leaderboard });
} 
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt, model } = await request.json();
    console.log('Received request for model:', model);

    // Forward request to FastAPI backend
    const response = await fetch("http://127.0.0.1:8000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, model }),
    });

    if (!response.ok) {
      throw new Error(`FastAPI request failed: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ text: data.text, model });
  } catch (error) {
    console.error('Detailed error in generate route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate response' },
      { status: 500 }
    );
  }
} 
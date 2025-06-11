import { NextResponse } from 'next/server';
import { queryModel } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const { prompt, model } = await request.json();
    
    if (!prompt || !model) {
      return NextResponse.json(
        { error: 'Prompt and model are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const response = await queryModel(prompt, model, apiKey);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in generate route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
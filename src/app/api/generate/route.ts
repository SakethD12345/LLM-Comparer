import { NextResponse } from 'next/server';
import { queryModel } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const { prompt, model } = await request.json();
    console.log('Received request for model:', model);
    
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      console.error('API key not found in environment variables');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    console.log('Making request to Hugging Face API...');
    const response = await queryModel(prompt, model, apiKey);
    console.log('Received response:', response);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Detailed error in generate route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate response' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt, model, conversation_history, backend = 'ollama' } = await request.json();
    console.log('Received request for model:', model);
    console.log('Using backend:', backend);
    console.log('Conversation history length:', conversation_history?.length || 0);

    // Prepare the request body
    const requestBody: any = { prompt, model };
    
    // Add conversation history if provided
    if (conversation_history && Array.isArray(conversation_history)) {
      requestBody.conversation_history = conversation_history;
    }

    // Determine which backend to use
    const backendUrl = backend === 'litellm' 
      ? "http://127.0.0.1:8001/generate"  // LiteLLM backend
      : "http://127.0.0.1:8000/generate"; // Ollama backend

    // Forward request to appropriate backend
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend request failed:`, errorText);
      throw new Error(`Backend request failed: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ 
      text: data.text, 
      model,
      backend,
      usage: data.usage || null 
    });
  } catch (error) {
    console.error('Detailed error in generate route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate response' },
      { status: 500 }
    );
  }
}

// New endpoint to get available models from LiteLLM
export async function GET() {
  try {
    const response = await fetch("http://127.0.0.1:8001/models");
    
    if (!response.ok) {
      // Fallback to Ollama models if LiteLLM is not running
      return NextResponse.json({
        models: [
          { provider: "ollama", model: "llama2", display_name: "Llama 2", requires_api_key: false },
          { provider: "ollama", model: "mistral", display_name: "Mistral", requires_api_key: false },
          { provider: "ollama", model: "codellama", display_name: "Code Llama", requires_api_key: false }
        ]
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Return default Ollama models if LiteLLM backend is not available
    return NextResponse.json({
      models: [
        { provider: "ollama", model: "llama2", display_name: "Llama 2", requires_api_key: false },
        { provider: "ollama", model: "mistral", display_name: "Mistral", requires_api_key: false },
        { provider: "ollama", model: "codellama", display_name: "Code Llama", requires_api_key: false }
      ]
    });
  }
} 
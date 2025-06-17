# 🤖 LLM Comparer

A modern web application for comparing responses from different Large Language Models (LLMs) using Ollama for local inference. Built with Next.js, TypeScript, Tailwind CSS, and FastAPI.

## Features

- Side-by-side model comparison
- Local model inference using Ollama
- Advanced response analysis:
  - Semantic similarity scoring
  - Readability metrics
  - Sentiment analysis
  - Key phrase extraction
- Response history tracking
- Modern, responsive UI
- Type-safe development

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://www.python.org/) (v3.8 or higher)
- [Ollama](https://ollama.ai/) installed on your system

## Setup

1. Install Ollama:
   - Follow the [official installation guide](https://ollama.ai/download) for your operating system
   - Pull the models you want to use:
     ```bash
     ollama pull llama2
     ollama pull mistral
     # Add any other models you want to use
     ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Install Node.js dependencies:
   ```bash
   npm install
   ```

4. Start the FastAPI backend:
   ```bash
   python ollama_backend.py
   ```

5. In a new terminal, start the Next.js development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Select two models from the dropdown menus
2. Enter your prompt in the text area
3. Click "Generate" to get responses from both models
4. Use the "Compare Responses" button to analyze the differences between responses
5. View detailed analysis including:
   - Similarity score
   - Readability metrics
   - Sentiment analysis
   - Key phrases

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- FastAPI
- Ollama for local model inference
- Python (for advanced analysis)
- Machine Learning Libraries:
  - scikit-learn
  - NLTK
  - pandas
  - spaCy
  - TextBlob

## Project Structure

```
src/
├── app/           # Next.js app directory
├── components/    # React components
├── lib/          # Core functionality and API
│   ├── api.py    # FastAPI backend
│   └── advanced_analysis.py  # Response analysis
└── types/        # TypeScript type definitions
```

## Development

1. Start the FastAPI backend in development mode:
   ```bash
   uvicorn src.lib.api:app --reload
   ```

2. Start the Next.js development server:
   ```bash
   npm run dev
   ```

3. Run tests:
   ```bash
   npm test
   ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

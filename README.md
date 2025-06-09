# LLM Comparer

A modern web application that allows users to compare responses from different Large Language Models (LLMs) side by side. This tool helps in evaluating and analyzing the performance, quality, and characteristics of various LLM outputs.

## Features (Planned)

- Side-by-side comparison of LLM responses
- Support for multiple open-source LLMs and free tiers
- Customizable prompts and parameters
- Response analysis and metrics
- Save and share comparison results
- Beautiful, responsive UI

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Hugging Face Inference API 
- Local LLM support
- GitHub Pages

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Add your Hugging Face API token to `.env.local` (free tier)
5. Run the development server:
   ```bash
   npm run dev
   ```

## License

MIT
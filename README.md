# 🤖 LLM Comparer

A modern web application for comparing responses from different Large Language Models (LLMs) using Ollama for local inference. Built with Next.js, TypeScript, Tailwind CSS, and FastAPI with advanced NLP analysis capabilities.

## Features

- **Side-by-side model comparison** with real-time response generation
- **Local model inference** using Ollama
- **Two-tier analysis system**:
  - **Basic Analysis**: Sentiment analysis, readability metrics, key phrase extraction
  - **Advanced Analysis**: Named Entity Recognition (NER), topic modeling, semantic similarity using TF-IDF and LSI
- **Response history tracking** with local storage
- **Modern, responsive UI** with beautiful gradients and animations
- **Type-safe development** with TypeScript

## Advanced Analysis Features

### 🧠 Advanced Text Analysis
- **Named Entity Recognition**: Extract and compare entities (people, places, organizations) from responses
- **Topic Modeling**: Use Latent Dirichlet Allocation (LDA) to identify and compare topics
- **Semantic Similarity**: Multiple similarity metrics including TF-IDF, LSI, and word overlap
- **Text Complexity Analysis**: Flesch reading ease, vocabulary diversity, sentence structure analysis

### 📊 Analysis Metrics
- **Similarity Scores**: TF-IDF, LSI, and average similarity percentages
- **Entity Overlap**: Common entities between responses with overlap ratios
- **Topic Distribution**: Percentage breakdown of topics for each response
- **Complexity Comparison**: Readability scores and vocabulary analysis

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://www.python.org/) (v3.8 or higher)
- [Ollama](https://ollama.ai/) installed on your system

## Quick Setup

### Option 1: Automated Setup (Recommended)
```bash
# Clone the repository
git clone https://github.com/SakethD12345/LLM-Comparer.git
cd LLM-Comparer

# Run the automated setup script
python setup.py
```

### Option 2: Manual Setup

1. **Install Ollama**:
   - Follow the [official installation guide](https://ollama.ai/download) for your operating system
   - Pull the models you want to use:
     ```bash
     ollama pull llama2
     ollama pull mistral
     # Add any other models you want to use
     ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Download required models**:
   ```bash
   # Download spaCy English model for NER
   python -m spacy download en_core_web_sm
   
   # Download NLTK data (handled automatically by the code)
   python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet')"
   ```

4. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

5. **Start the FastAPI backend**:
   ```bash
   python ollama_backend.py
   ```

6. **Start the Next.js development server**:
   ```bash
   npm run dev
   ```

7. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## Usage

1. **Select Models**: Choose two different models from the dropdown menus
2. **Enter Prompt**: Type your prompt in the text area
3. **Generate Responses**: Click "Generate Response" to get responses from both models
4. **Choose Analysis Type**:
   - **Basic**: Quick sentiment and readability analysis
   - **Advanced**: Comprehensive NLP analysis with NER and topic modeling
5. **Compare Responses**: Click the analysis button to view detailed comparisons
6. **Review Results**: Explore similarity scores, entities, topics, and complexity metrics

## Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hooks** for state management

### Backend
- **FastAPI** for API endpoints
- **Ollama** for local LLM inference
- **Python** for advanced analysis

### Machine Learning & NLP
- **scikit-learn**: TF-IDF, LDA, LSI, cosine similarity
- **spaCy**: Named Entity Recognition
- **NLTK**: Text preprocessing, tokenization, stopwords
- **pandas**: Data manipulation
- **numpy**: Numerical computations

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── analyze/       # Basic analysis endpoint
│   │   └── advanced-analyze/  # Advanced analysis endpoint
│   └── page.tsx           # Main page component
├── components/            # React components
│   ├── ModelPanel.tsx     # Model selection and response display
│   ├── AnalysisResults.tsx        # Basic analysis results
│   └── AdvancedAnalysisResults.tsx # Advanced analysis results
├── lib/                   # Core functionality
│   ├── api.ts            # API client functions
│   ├── advanced_analysis.py      # Basic analysis script
│   └── advanced_text_analysis.py # Advanced NLP analysis
└── types/                 # TypeScript type definitions
```

## Development

### Starting Development Servers
```bash
# Terminal 1: FastAPI backend
python ollama_backend.py

# Terminal 2: Next.js frontend
npm run dev
```

### Running Tests
```bash
npm test
```

### Code Quality
```bash
# Format Python code
black src/lib/*.py

# Format TypeScript/JavaScript code
npm run format

# Lint code
npm run lint
```

## Advanced Features Explained

### Named Entity Recognition (NER)
Uses spaCy's `en_core_web_sm` model to identify and categorize entities like:
- **PERSON**: Names of people
- **ORG**: Organizations
- **GPE**: Countries, cities
- **LOC**: Non-GPE locations
- **DATE**: Dates and times

### Topic Modeling
Implements Latent Dirichlet Allocation (LDA) to:
- Identify 5 main topics in the responses
- Show top words for each topic
- Display topic distribution percentages
- Compare dominant topics between responses

### Semantic Similarity
Calculates multiple similarity metrics:
- **TF-IDF**: Term frequency-inverse document frequency similarity
- **LSI**: Latent Semantic Indexing similarity
- **Word Overlap**: Jaccard similarity of word sets
- **Average**: Combined similarity score

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

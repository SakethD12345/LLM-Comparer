export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">LLM Comparer</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 border rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Model 1</h2>
            <textarea
              className="w-full h-64 p-4 border rounded-lg"
              placeholder="Enter your prompt here..."
            />
          </div>
          <div className="p-6 border rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Model 2</h2>
            <textarea
              className="w-full h-64 p-4 border rounded-lg"
              placeholder="Enter your prompt here..."
            />
          </div>
        </div>
      </div>
    </main>
  );
} 
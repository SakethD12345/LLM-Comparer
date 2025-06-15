from analysis import ResponseAnalyzer

def main():
    # Initialize the analyzer
    analyzer = ResponseAnalyzer()
    
    # Example responses from different models
    response1 = """
    The quick brown fox jumps over the lazy dog. This is a test response from model 1.
    The response demonstrates basic text generation capabilities.
    """
    
    response2 = """
    A swift brown fox leaps over a sleeping canine. This is model 2's response to the same prompt.
    It shows how different models can express the same idea in various ways.
    """
    
    # Analyze the responses
    analysis = analyzer.analyze_responses(response1, response2)
    
    # Print the results
    print("\nResponse Analysis Results:")
    print("=" * 50)
    
    print("\nSimilarity Score:", analysis['similarity_score'])
    
    print("\nResponse 1 Metrics:")
    for metric, value in analysis['response1_metrics'].items():
        print(f"- {metric}: {value:.2f}")
    
    print("\nResponse 2 Metrics:")
    for metric, value in analysis['response2_metrics'].items():
        print(f"- {metric}: {value:.2f}")
    
    print("\nDifferences:")
    for diff, value in analysis['differences'].items():
        print(f"- {diff}: {value:.2f}")

if __name__ == "__main__":
    main() 
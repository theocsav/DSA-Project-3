from django.http import JsonResponse
from .algorithm import IsolationForestAnalyzer

def analyze(request):
    """
    Run Isolation Forest analysis on the transaction data.
    
    Query parameters:
    - trees: Number of trees in the forest
    - sample_size: Sample size for each tree 
    - threshold: Anomaly score threshold
    """
    # Get parameters from request
    tree_count = int(request.GET.get('trees', 50))
    sample_size = int(request.GET.get('sample_size', 512))
    threshold = float(request.GET.get('threshold', 0.56))
    
    # Run analysis
    results = IsolationForestAnalyzer.run_analysis(
        tree_count=tree_count,
        sample_size=sample_size,
        threshold=threshold
    )
    
    return JsonResponse(results)
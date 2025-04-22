from django.http import JsonResponse
from .algorithm import IsolationForestAnalyzer

def analyze(request):
    """
    API endpoint to run Isolation Forest analysis on transaction data
    """
    # Get parameters from request, use defaults if not provided
    tree_count = int(request.GET.get('tree_count', 120))
    sample_size = int(request.GET.get('sample_size', 256))
    threshold = float(request.GET.get('threshold', 0.55))
    
    # Run the analysis
    results = IsolationForestAnalyzer.run_analysis(
        tree_count=tree_count,
        sample_size=sample_size,
        threshold=threshold
    )
    
    # Return results as JSON
    return JsonResponse(results)

def predict(request):
    """
    API endpoint to make predictions using the trained Isolation Forest model
    """
    # Get threshold from request if provided, otherwise use default from saved model
    threshold = None
    if 'threshold' in request.GET:
        threshold = float(request.GET.get('threshold'))
    
    # Run prediction on the entire training dataset
    results = IsolationForestAnalyzer.predict_on_training_data(threshold=threshold)
    
    # Return results as JSON
    return JsonResponse(results)
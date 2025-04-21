from django.shortcuts import render
from django.http import JsonResponse
from .algorithm import RandomForestAnalyzer

def random_forest_analyze(request):
    """
    API endpoint to run Random Forest analysis on transaction data
    """
    # Get parameters from request, use defaults if not provided
    n_trees = int(request.GET.get('n_trees', 100))
    max_depth = int(request.GET.get('max_depth', 10))
    min_samples_split = int(request.GET.get('min_samples_split', 2))
    
    # Run the analysis
    results = RandomForestAnalyzer.run_analysis(
        n_trees=n_trees, 
        max_depth=max_depth, 
        min_samples_split=min_samples_split
    )
    
    # Return results as JSON
    return JsonResponse(results)

def random_forest_predict(request):
    """
    API endpoint to run Random Forest prediction on all training data
    """
    # Run the prediction on the entire training dataset
    results = RandomForestAnalyzer.predict_with_saved_model('training_data')
    
    # Return results as JSON
    return JsonResponse(results)
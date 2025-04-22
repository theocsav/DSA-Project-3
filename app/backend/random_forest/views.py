from django.shortcuts import render
from django.http import JsonResponse
from .algorithm import RandomForestAnalyzer
import os
import pandas as pd
import numpy as np
import random
import math
import time
from django.http import HttpResponse
from transactions.models import Transaction


def export_first_100(request):
    transactions= Transaction.objects.all().values()[:100]
    df= pd.DataFrame(list(transactions))
    # df.to_csv(file_path, index=False)
    response= HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'inline; filename="ran_100_transactions.csv"'
    df.to_csv(path_or_buf=response, index=False)
    
    return response


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
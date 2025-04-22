from django.http import JsonResponse
from .algorithm import IsolationForestAnalyzer
import os
from transactions.models import Transaction
from django.http import HttpResponse
import pandas as pd



def export_to_csv(request):

    transactions = Transaction.objects.all().values()
    df = pd.DataFrame(list(transactions))

    first_100 = df.head(100)
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'inline; filename="iso_100_transactions.csv"'
    
    first_100.to_csv(response, index=False) #dont include index column in export
    # print(f"100 points exported to: {os.path.abspath(file_path)}") #prints the absolute path so user knows wher it is at
    return response


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
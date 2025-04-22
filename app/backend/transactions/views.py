from django.http import JsonResponse
from .models import Transaction

def db_stats(request):
    """
    Returns basic statistics about the transaction database.
    Used to verify data was imported correctly.
    """
    total_count = Transaction.objects.count()
    fraud_count = Transaction.objects.filter(is_fraud=1).count()
    
    # Get sample data points
    sample = list(Transaction.objects.all()[:5].values())
    
    # Get distribution by category
    category_counts = {}
    for cat in Transaction.objects.values_list('category', flat=True).distinct():
        category_counts[cat] = Transaction.objects.filter(category=cat).count()
    
    return JsonResponse({
        'total_transactions': total_count,
        'fraud_count': fraud_count,
        'fraud_percentage': round(fraud_count / total_count * 100, 2) if total_count > 0 else 0,
        'sample_transactions': sample,
        'category_distribution': category_counts
    })
from django.urls import path
from . import views

urlpatterns = [
    path('analyze/', views.analyze, name='isolation_forest_analyze'),
    path('export-csv/', views.export_to_csv, name='iso_export_first100_csv'),
]
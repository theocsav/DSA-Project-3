from django.urls import path
from . import views

urlpatterns = [
    path('analyze/', views.random_forest_analyze, name='random_forest_analyze'),
    path('export-csv/', views.export_first_100, name='export_ran_first1oo_csv'),
]
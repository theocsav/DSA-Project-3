from django.urls import path
from . import views

urlpatterns = [
    path('analyze/', views.random_forest_analyze, name='random_forest_analyze'),
]
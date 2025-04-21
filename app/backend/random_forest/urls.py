from django.urls import path
from . import views

urlpatterns = [
    path('analyze/', views.random_forest_analyze, name='random_forest_analyze'),
    path('predict/', views.random_forest_predict, name='random_forest_predict'),
]
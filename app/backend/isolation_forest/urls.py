from django.urls import path
from . import views

urlpatterns = [
    path('analyze/', views.analyze, name='isolation_forest_analyze'),
    path('predict/', views.predict, name='isolation_forest_predict'),
]
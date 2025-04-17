from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.db_stats, name='db_stats'),
]
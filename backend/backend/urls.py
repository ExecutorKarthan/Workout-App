from django.urls import path
from .views import login_view, assign_workout, get_workouts, update_workout_progress, get_clients_and_exercises

urlpatterns = [
    path('api/login/', login_view),
    path('api/assign_workout/', assign_workout),
    path('api/get_workouts/', get_workouts),
    path('api/update_workout_progress/', update_workout_progress),
    path('api/clients_exercises/', get_clients_and_exercises),
]
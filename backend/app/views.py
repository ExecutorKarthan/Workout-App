from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from pymongo import MongoClient
from bson.objectid import ObjectId
import jwt
import datetime

SECRET_KEY = 'your_secret_key_here'

client = MongoClient('mongodb://localhost:27017/')
db = client['fitness_app']
users = db['users']
workouts = db['workouts']
exercises = db['exercises']

def seed_data():
    if users.count_documents({}) == 0:
        users.insert_many([
            {'username': 'trainer1', 'password': 'pass123', 'role': 'trainer'},
            {'username': 'clientA', 'password': 'pass123', 'role': 'client'},
            {'username': 'clientB', 'password': 'pass123', 'role': 'client'}
        ])
    if exercises.count_documents({}) == 0:
        exercises.insert_many([
            {'name': 'Push Ups', 'description': 'Do push-ups with proper form.'},
            {'name': 'Plank', 'description': 'Hold a plank for a set time.'},
            {'name': 'Jumping Jacks', 'description': 'Full-body warm-up exercise.'}
        ])

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        user = users.find_one({'username': username, 'password': password})
        if user:
            token = jwt.encode({
                'user_id': str(user['_id']),
                'role': user['role'],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=12)
            }, SECRET_KEY, algorithm='HS256')
            return JsonResponse({'success': True, 'token': token, 'role': user['role']})
        else:
            return JsonResponse({'success': False}, status=401)

@csrf_exempt
def assign_workout(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        workouts.insert_one(data)
        return JsonResponse({'success': True})

@csrf_exempt
def get_workouts(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        token = data.get('token')
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            user_id = payload['user_id']
        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token expired'}, status=403)
        result = list(workouts.find({'clientId': user_id}))
        for r in result:
            r['_id'] = str(r['_id'])
        return JsonResponse({'workouts': result})

@csrf_exempt
def update_workout_progress(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        workout_id = data.get('workoutId')
        progress = data.get('progress')
        workouts.update_one({'_id': ObjectId(workout_id)}, {'$set': {'progress': progress}})
        return JsonResponse({'success': True})

@csrf_exempt
def get_clients_and_exercises(request):
    if request.method == 'GET':
        token = request.headers.get('Authorization')
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            if payload['role'] != 'trainer':
                return JsonResponse({'error': 'Unauthorized'}, status=403)
        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token expired'}, status=403)
        clients = list(users.find({'role': 'client'}))
        exercises_list = list(exercises.find())
        for c in clients:
            c['_id'] = str(c['_id'])
        for e in exercises_list:
            e['_id'] = str(e['_id'])
        return JsonResponse({ 'clients': clients, 'exercises': exercises_list })
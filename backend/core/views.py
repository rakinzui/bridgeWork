from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.response import Response
from .serializers import RegisterSerializer,TaskSerializer,UserSerializer,BrokerRequestSerializer
from .models import Task,BrokerRequest
from rest_framework import generics
from rest_framework.views import APIView

def ping(reqeust):
    return JsonResponse({"message":"pong"})

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'ユーザー登録が完了しました。'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TaskListCreateView(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer


class TaskRetrieveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
class TaskDetailView(generics.RetrieveAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_task(request):
    serializer = TaskSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(client=request.user) 
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_client_tasks(request):
    tasks = Task.objects.filter(client=request.user).order_by("-created_at")
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_broker_requests(request, task_id):
    task = get_object_or_404(Task, id=task_id, client=request.user)
    requests = BrokerRequest.objects.filter(task=task)
    serializer = BrokerRequestSerializer(requests, many=True)
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def approve_broker_request(request, request_id):
    broker_request = get_object_or_404(BrokerRequest, id=request_id)
    task = broker_request.task

    if task.client != request.user:
        return Response({"error": "権限がありません"}, status=403)

    broker_request.status = "approved"
    broker_request.save()

    task.broker = broker_request.broker
    task.save()

    return Response({"message": "承認しました"})
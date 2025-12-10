from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.response import Response
from .serializers import RegisterSerializer,TaskSerializer,UserSerializer,coordinatorRequestSerializer
from .models import Task,coordinatorRequest
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
    print("取得したタスク内容", tasks)
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_coordinator_requests(request, task_id):
    task = get_object_or_404(Task, id=task_id, client=request.user)
    requests = coordinatorRequest.objects.filter(task=task)
    serializer = coordinatorRequestSerializer(requests, many=True)
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def approve_coordinator_request(request, request_id):
    coordinator_request = get_object_or_404(coordinatorRequest, id=request_id)
    task = coordinator_request.task

    if task.client != request.user:
        return Response({"error": "権限がありません"}, status=403)

    coordinator_request.status = "approved"
    coordinator_request.save()

    task.coordinator = coordinator_request.coordinator
    task.save()

    return Response({"message": "承認しました"})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def apply_coordinator(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    user = request.user

    from .choices import REQUEST_STATUS_CHOICES
    try:
        # Check if already applied
        existing_request = coordinatorRequest.objects.filter(task=task, coordinator=user).first()
        if existing_request:
            return Response({"error": "すでに応募済みです"}, status=status.HTTP_400_BAD_REQUEST)

        # Get initial status safely
        initial_status = "pending"

        br = coordinatorRequest.objects.create(
            task=task,
            coordinator=user,
            message=request.data.get("message", ""),
            status=initial_status
        )
    except Exception as e:
        return Response({"error": f"応募処理中にエラーが発生しました: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({
        "message": "応募完了",
        "coordinator_username": user.username,
        "request_id": br.id
    }, status=status.HTTP_201_CREATED)

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_task_status(request, task_id):
    try:
        task = Task.objects.get(id=task_id, client=request.user)
    except Task.DoesNotExist:
        return Response({"detail": "タスクが見つからないか、権限がありません"}, status=status.HTTP_404_NOT_FOUND)
    
    if task.status != "open":
        return Response({"detail": "このタスクの状態は更新できません"}, status=status.HTTP_400_BAD_REQUEST)

    new_status = request.data.get("status")
    if new_status not in ["completed", "canceled"]:
        return Response({"detail": "不正なステータス"}, status=status.HTTP_400_BAD_REQUEST)

    task.status = new_status
    task.save()
    return Response({"detail": "ステータスが更新されました", "status": task.status})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_coordinator_requests(request):
    """
    依頼者用：获取自己发布的所有任务对应的仲介申请
    """
    user = request.user

    # 获取依赖者自己的任务
    tasks = Task.objects.filter(client=user)

    # 获取这些任务对应的所有 coordinatorRequest，并预加载 task 和 coordinator
    coordinator_requests = coordinatorRequest.objects.filter(task__in=tasks).select_related('task', 'coordinator')

    # 序列化
    serializer = coordinatorRequestSerializer(coordinator_requests, many=True)
    data = serializer.data

    # append task title and id_number
    for item, br in zip(data, coordinator_requests):
        item["task_title"] = br.task.title
        item["task_id_number"] = br.task.id_number

    return Response(data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def approve_coordinator_request(request, request_id):
    """仲介者申請を承認する"""
    coordinator_request = get_object_or_404(coordinatorRequest, id=request_id)

    # 依頼者本人しか承認できないようチェック
    if coordinator_request.task.client != request.user:
        return Response({"error": "権限がありません"}, status=403)

    # 状態更新
    coordinator_request.status = "approved"
    # タスクに仲介人をセット
    task = coordinator_request.task
    task.coordinator = coordinator_request.coordinator
    task.save()
    coordinator_request.save()

    return Response({"message": "承認しました"})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reject_coordinator_request(request, request_id):
    """仲介者申請を拒否する"""
    coordinator_request = get_object_or_404(coordinatorRequest, id=request_id)

    # 依頼者本人しか拒否できないようチェック
    if coordinator_request.task.client != request.user:
        return Response({"error": "権限がありません"}, status=403)

    coordinator_request.status = "rejected"
    coordinator_request.save()

    return Response({"message": "拒否しました"})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def coordinator_my_tasks(request):
    """仲介人用：自分が担当するタスク一覧"""
    user = request.user
    tasks = Task.objects.filter(coordinator=user).order_by("-updated_at")
    serializer = TaskSerializer(tasks, many=True)
    data = serializer.data
    
    for item, task in zip(data, tasks):
        item["client_username"] = task.client.username
        item["client_id"] = task.client.id
    
    
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def coordinator_my_applications(request):
    """仲介人用：自分が応募した仲介申請一覧"""
    user = request.user
    applications = coordinatorRequest.objects.filter(coordinator=user).select_related("task")
    serializer = coordinatorRequestSerializer(applications, many=True)

    data = serializer.data
    for item, br in zip(data, applications):
        item["task_title"] = br.task.title
        item["task_id_number"] = br.task.id_number
        item["client_username"] = br.task.client.username
    print("仲介人の応募一覧データ:", data)
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_worker_requests(request):
    """仲介人用：実行人からの応募一覧（仲介人が担当するタスク）"""
    user = request.user

    # 仲介人が担当するタスクを取得
    tasks = Task.objects.filter(coordinator=user)

    # 実行人の応募リクエスト（workerRequest）を取得 ※まだモデルは無いので空処理
    worker_requests = []  # TODO: workerRequest 実装後に置き換え

    return Response(worker_requests)
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.response import Response
from .serializers import RegisterSerializer,TaskSerializer,UserSerializer,coordinatorRequestSerializer,workerRequestSerializer
from .models import Task,coordinatorRequest,workerRequest
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

    # すでに応募しているか確認
    existing_request = coordinatorRequest.objects.filter(task=task, coordinator=user).first()
    if existing_request:
        return Response({"detail": "すでに仲介者として応募済みです"}, status=400)

    cr = coordinatorRequest.objects.create(
        task=task,
        coordinator=user,
        message=request.data.get("message", ""),
        status="pending"
    )

    return Response({
        "detail": "仲介者として応募が完了しました",
        "request_id": cr.id
    }, status=201)

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
def worker_my_tasks(request):
    """実行人用：自分が担当するタスク一覧"""
    user = request.user
    print("実行人ユーザー情報", user)
    tasks = Task.objects.filter(worker=user).order_by("-updated_at")
    serializer = TaskSerializer(tasks, many=True)
    data = serializer.data

    for item, task in zip(data, tasks):
        item["client_username"] = task.client.username
        item["client_id"] = task.client.id
        item["coordinator_username"] = task.coordinator.username if task.coordinator else None
        
    print("実行人の担当タスク一覧データ:", data)

    return Response(data)

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

    # 仲介人が担当するタスク
    tasks = Task.objects.filter(coordinator=user)

    # それらのタスクに対する workerRequest を取得
    worker_requests = workerRequest.objects.filter(task__in=tasks).select_related("task", "worker")

    serializer = workerRequestSerializer(worker_requests, many=True)
    data = serializer.data

    # task title, id_number, worker username を追加
    for item, wr in zip(data, worker_requests):
        item["task_title"] = wr.task.title
        item["task_id_number"] = wr.task.id_number
        item["worker_username"] = wr.worker.username
        item["client_username"] = wr.task.client.username

    return Response(data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def apply_worker(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    user = request.user

    # すでに応募しているか確認
    existing = workerRequest.objects.filter(task=task, worker=user).first()
    if existing:
        return Response({"detail": "すでに実行人として応募済みです"}, status=400)

    wr = workerRequest.objects.create(
        task=task,
        worker=user,
        message=request.data.get("message", ""),
        status="pending"
    )

    return Response({
        "detail": "実行人として応募が完了しました",
        "request_id": wr.id
    }, status=201)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def approve_worker_request(request, request_id):
    """仲介人：実行人応募を承認する"""
    wr = get_object_or_404(workerRequest, id=request_id)

    if wr.task.coordinator != request.user:
        return Response({"error": "権限がありません"}, status=403)

    wr.status = "approved"
    wr.save()

    task = wr.task
    task.worker = wr.worker
    task.save()

    return Response({"message": "承認しました"})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reject_worker_request(request, request_id):
    """仲介人：実行人応募を拒否する"""
    wr = get_object_or_404(workerRequest, id=request_id)

    if wr.task.coordinator != request.user:
        return Response({"error": "権限がありません"}, status=403)

    wr.status = "rejected"
    wr.save()

    return Response({"message": "拒否しました"})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def worker_my_applications(request):
    """実行人用：自分が応募した実行人申請一覧"""
    user = request.user
    applications = workerRequest.objects.filter(worker=user).select_related("task")
    serializer = workerRequestSerializer(applications, many=True)

    data = serializer.data
    for item, br in zip(data, applications):
        item["task_title"] = br.task.title
        item["task_id_number"] = br.task.id_number
        item["coordinator_username"] = (
            br.task.coordinator.username if br.task.coordinator else None
        )
        item["client_username"] = br.task.client.username

    return Response(data)
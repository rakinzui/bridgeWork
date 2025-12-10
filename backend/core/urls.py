from django.urls import path
from .views import (
    register_user,
    TaskListCreateView,
    TaskDetailView,
    MeView,
    create_task,
    list_client_tasks,
    list_coordinator_requests,
    approve_coordinator_request,
    update_task_status,
    apply_coordinator,
    reject_coordinator_request,
    coordinator_my_tasks,
    coordinator_my_applications,
    list_worker_requests
    
)

urlpatterns = [
    path("register/", register_user, name="register_user"),
    path("tasks/", TaskListCreateView.as_view(), name="task-list-create"),
    path("tasks/<int:pk>/", TaskDetailView.as_view(), name="task-detail"),
    path("me/", MeView.as_view(), name="me"),
    path("client/tasks/create/", create_task, name="client-task-create"),
    path("client/tasks/list/", list_client_tasks, name="client-task-list"),
    path("client/coordinator-requests/", list_coordinator_requests, name="client-coordinator-requests-list"),
    path("client/coordinator-requests/<int:request_id>/approve/", approve_coordinator_request, name="client-coordinator-requests-approve"),
    path("coordinator/tasks/<int:task_id>/apply/", apply_coordinator, name="coordinator-apply"),
    path("client/coordinator-requests/<int:request_id>/reject/", reject_coordinator_request, name="client-coordinator-requests-reject"),
    path("client/tasks/update/<int:task_id>/", update_task_status, name="update_task_status"),
    path("coordinator/tasks/", coordinator_my_tasks, name="coordinator-my-tasks"),
    path("coordinator/applications/", coordinator_my_applications, name="coordinator-my-applications"),
    path("coordinator/worker-requests/", list_worker_requests, name="coordinator-worker-requests"),
]

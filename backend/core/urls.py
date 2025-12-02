from django.urls import path
from .views import (
    register_user,
    TaskListCreateView,
    TaskDetailView,
    MeView,
    create_task,
    list_client_tasks,
    list_broker_requests,
    approve_broker_request,
    update_task_status
)

urlpatterns = [
    path("register/", register_user, name="register_user"),
    path("tasks/", TaskListCreateView.as_view(), name="task-list-create"),
    path("tasks/<int:pk>/", TaskDetailView.as_view(), name="task-detail"),
    path("me/", MeView.as_view(), name="me"),
    path("client/tasks/create/", create_task, name="client-task-create"),
    path("client/tasks/list/", list_client_tasks, name="client-task-list"),
    path("client/broker-requests/", list_broker_requests, name="client-broker-requests-list"),
    path("client/broker-requests/<int:request_id>/approve/", approve_broker_request, name="client-broker-requests-approve"),
    path("client/tasks/update/<int:task_id>/", update_task_status, name="update_task_status"),
]

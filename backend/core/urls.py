from django.urls import path
from .views import (
    register_user,TaskListCreateView,TaskRetrieveUpdateDeleteView,MeView,TaskDetailView,
    create_task,list_client_tasks,list_broker_requests,approve_broker_request
)
urlpatterns = [
    path('register/', register_user, name='register_user'),
    path("tasks/", TaskListCreateView.as_view()),
    path("tasks/<int:pk>/", TaskRetrieveUpdateDeleteView.as_view()),
    path("me/", MeView.as_view(), name="me"),
    path("tasks/<int:pk>/", TaskDetailView.as_view(), name="task-detail"),
    path("client/tasks/", create_task),
    path("client/tasks/list/", list_client_tasks),
    path("client/broker-requests/<int:task_id>/", list_broker_requests),
    path("client/broker-requests/<int:request_id>/approve/", approve_broker_request),
]

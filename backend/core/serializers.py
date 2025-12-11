from rest_framework import serializers
from .models import CustomUser, Task, coordinatorRequest, workerRequest

class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'password2', 'role']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': '密码不一致'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = CustomUser.objects.create_user(**validated_data)
        return user
    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ("id", "username","role")

class TaskSerializer(serializers.ModelSerializer):
    client = UserSerializer(read_only=True)
    coordinator = UserSerializer(read_only=True)
    worker = UserSerializer(read_only=True)

    class Meta:
        model = Task
        fields = "__all__"
        
class coordinatorRequestSerializer(serializers.ModelSerializer):
    coordinator_name = serializers.CharField(source="coordinator.username", read_only=True)
    task_title = serializers.CharField(source="task.title", read_only=True)
    task_id_number = serializers.CharField(source="task.id_number", read_only=True)

    class Meta:
        model = coordinatorRequest
        fields = [
            "id",
            "task",
            "coordinator",
            "status",
            "created_at",
            "coordinator_name",
            "message",
            "task_title",
            "task_id_number",
        ]


class workerRequestSerializer(serializers.ModelSerializer):
    worker_name = serializers.CharField(source="worker.username", read_only=True)
    task_title = serializers.CharField(source="task.title", read_only=True)
    task_id_number = serializers.CharField(source="task.id_number", read_only=True)

    class Meta:
        model = workerRequest
        fields = [
            "id",
            "task",
            "worker",
            "status",
            "created_at",
            "worker_name",
            "task_title",
            "task_id_number",
        ]
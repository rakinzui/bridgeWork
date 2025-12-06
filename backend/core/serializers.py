from rest_framework import serializers
from .models import CustomUser,Task,coordinatorRequest

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

    class Meta:
        model = coordinatorRequest
        fields = "__all__"
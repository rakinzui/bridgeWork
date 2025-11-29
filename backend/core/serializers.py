from rest_framework import serializers
from .models import CustomUser,Task,BrokerRequest

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
    client_name = serializers.CharField(source="client.username", read_only=True)
    broker_name = serializers.CharField(source="broker.username", read_only=True)
    worker_name = serializers.CharField(source="worker.username", read_only=True)

    class Meta:
        model = Task
        fields = "__all__"
        
class BrokerRequestSerializer(serializers.ModelSerializer):
    broker_name = serializers.CharField(source="broker.username", read_only=True)

    class Meta:
        model = BrokerRequest
        fields = "__all__"
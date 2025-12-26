from django.contrib.auth.models import AbstractUser
from django.db import models

import random
from django.db import models
from .choices import (ROLE_CHOICES, TASK_TYPE_CHOICES, STATUS_CHOICES, REQUEST_STATUS_CHOICES)

def generate_8digit_id():
    """生成唯一8位数字ID"""
    while True:
        number = random.randint(10000000, 99999999)
        if not Task.objects.filter(id_number=number).exists():
            return number

class CustomUser(AbstractUser):
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')
    credit_score = models.IntegerField(
        default=50,
    )

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    

class Task(models.Model):

    id_number = models.BigIntegerField(unique=True, default=generate_8digit_id, editable=False)
    # 委託人（client）: CustomUserのrole='client'に限定
    client = models.ForeignKey(
        'CustomUser',
        on_delete=models.CASCADE,
        related_name='client_tasks',
        limit_choices_to={'role': 'client'},
        verbose_name='発注者'
    )
    # 中間人（coordinator）: CustomUserのrole='coordinator'に限定、null許可
    coordinator = models.ForeignKey(
        'CustomUser',
        on_delete=models.SET_NULL,
        related_name='coordinator_tasks',
        limit_choices_to={'role': 'coordinator'},
        null=True,
        blank=True,
        verbose_name='仲介者'
    )
    # 受託人（worker）: CustomUserのrole='worker'に限定、null許可
    worker = models.ForeignKey(
        'CustomUser',
        on_delete=models.SET_NULL,
        related_name='worker_tasks',
        limit_choices_to={'role': 'worker'},
        null=True,
        blank=True,
        verbose_name='受注者'
    )
    title = models.CharField(max_length=255, verbose_name="タイトル")
    task_type = models.CharField(max_length=30, choices=TASK_TYPE_CHOICES)
    price = models.PositiveIntegerField(verbose_name='報酬', help_text='金額（円、整数）')
    description = models.TextField(blank=True)  # 詳細説明
    skill_required = models.TextField(blank=True)  # 応募要件
    deadline = models.DateField()  # 納期
    note = models.TextField(blank=True)  # 備考
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.id_number} - {self.get_task_type_display()}"
    # ステータス: open, in_progress, completed, canceled

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='open',
        verbose_name='ステータス'
    )

    class Meta:
        db_table = 'task'
        
class coordinatorRequest(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="coordinator_requests")
    coordinator = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    message = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=REQUEST_STATUS_CHOICES,
        default="pending"
    )
    created_at = models.DateTimeField(auto_now_add=True)


# 中間人（仲介者）プロフィール
class CoordinatorProfile(models.Model):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="coordinator_profile",
        limit_choices_to={'role': 'coordinator'},
        verbose_name="仲介者ユーザー"
    )
    level = models.PositiveIntegerField(default=1, verbose_name="レベル")
    commission_rate = models.PositiveIntegerField(default=5, verbose_name="報酬率(%)")
    credit_score = models.IntegerField(default=0, verbose_name="信用スコア")
    banned = models.BooleanField(default=False, verbose_name="利用停止")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"CoordinatorProfile({self.user.username}, Lv{self.level}, {self.commission_rate}%)"
    

class workerRequest(models.Model):
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="worker_requests"
    )
    worker = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE
    )
    message = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=REQUEST_STATUS_CHOICES,  # ★受注者応募も同じ pending/approved/rejected
        default="pending"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"WorkerRequest #{self.id} - Task {self.task.id_number}"
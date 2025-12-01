from django.contrib.auth.models import AbstractUser
from django.db import models

import random
from django.db import models

def generate_8digit_id():
    """生成唯一8位数字ID"""
    while True:
        number = random.randint(10000000, 99999999)
        if not Task.objects.filter(id_number=number).exists():
            return number

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('client', '依頼人'),
        ('broker', '中間人'),
        ('worker', '受託人'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    

class Task(models.Model):
    TASK_TYPE_CHOICES = [
        ('software_dev', 'ソフトウェア開発'),
        ('video_edit', 'ビデオ編集'),
        ('graphic_design', 'グラフィックデザイン'),
        ('writing', 'ライティング/コンテンツ作成'),
        ('translation', '翻訳'),
        ('consulting', 'オンラインコンサルティング'),
        ('digital_marketing', 'デジタルマーケティング'),
        ('data_analysis', 'データ分析'),
    ]

    id_number = models.BigIntegerField(unique=True, default=generate_8digit_id, editable=False)
    # 委託人（client）: CustomUserのrole='client'に限定
    client = models.ForeignKey(
        'CustomUser',
        on_delete=models.CASCADE,
        related_name='client_tasks',
        limit_choices_to={'role': 'client'},
        verbose_name='依頼人'
    )
    # 中間人（broker）: CustomUserのrole='broker'に限定、null許可
    broker = models.ForeignKey(
        'CustomUser',
        on_delete=models.SET_NULL,
        related_name='broker_tasks',
        limit_choices_to={'role': 'broker'},
        null=True,
        blank=True,
        verbose_name='中間人'
    )
    # 受託人（worker）: CustomUserのrole='worker'に限定、null許可
    worker = models.ForeignKey(
        'CustomUser',
        on_delete=models.SET_NULL,
        related_name='worker_tasks',
        limit_choices_to={'role': 'worker'},
        null=True,
        blank=True,
        verbose_name='受託人'
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
    STATUS_CHOICES = [
        ('open', '公開中'),
        ('in_progress', '進行中'),
        ('completed', '完了'),
        ('canceled', 'キャンセル'),
    ]
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='open',
        verbose_name='ステータス'
    )

    class Meta:
        db_table = 'task'
        
class BrokerRequest(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="broker_requests")
    broker = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    message = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=[("pending", "未承認"), ("approved", "承認済み"), ("rejected", "拒否")],
        default="pending"
    )
    created_at = models.DateTimeField(auto_now_add=True)
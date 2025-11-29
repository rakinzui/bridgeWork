import sys
import pathlib

# backend/manage.py が backend 配下にあるため backend をプロジェクトルートとして扱う
BACKEND_DIR = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BACKEND_DIR))

import os
import django
import random
from django.utils import timezone

# Django 設定読み込み
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import Task, CustomUser

def run():
    
    # CustomUser.objects.all().delete()
    Task.objects.all().delete()
    # テスト用ユーザーを作成
    clients = []
    for i in range(1, 6):
        user, created = CustomUser.objects.get_or_create(username=f'client{i}', defaults={'role':'client'})
        clients.append(user)
    brokers = []
    for i in range(1, 4):
        user, created = CustomUser.objects.get_or_create(username=f'broker{i}', defaults={'role':'broker'})
        brokers.append(user)
    workers = []
    for i in range(1, 6):
        user, created = CustomUser.objects.get_or_create(username=f'worker{i}', defaults={'role':'worker'})
        workers.append(user)

    task_types = [
        'software_dev', 'video_edit', 'graphic_design', 'writing',
        'translation', 'consulting', 'digital_marketing', 'data_analysis'
    ]

    for i in range(30):
        Task.objects.create(
            client=random.choice(clients),
            broker=random.choice(brokers + [None]),
            worker=random.choice(workers + [None]),
            task_type=random.choice(task_types),
            price=round(random.uniform(5000, 50000), 2),
            description=f'テスト用の詳細説明 {i+1}',
            skill_required=f'テスト用の応募要件 {i+1}',
            deadline=timezone.now().date(),
            note=f'テスト用の備考 {i+1}',
            status=random.choice(['open', 'in_progress', 'completed', 'canceled'])
        )

    print("30件のTaskデータを作成しました。")

if __name__ == "__main__":
    run()
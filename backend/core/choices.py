# core/choices.py

# ユーザーの役割
ROLE_CHOICES = [
    ('client', '依頼人'),
    ('coordinator', '仲介人'),
    ('worker', '実行人'),
]

# タスク種類
TASK_TYPE_CHOICES = [
    ('software_dev', 'ソフトウェア開発'),
    ('video_edit', '動画編集'),
    ('writing', 'ライティング/コンテンツ作成'),
    ('translation', '翻訳'),
]

# タスクステータス
STATUS_CHOICES = [
    ('open', '公開中'),
    ('in_progress', '進行中'),
    ('completed', '完了'),
    ('canceled', '取り下げ'),
]

# 仲介リクエストステータス
REQUEST_STATUS_CHOICES = [
    ("pending", "処理待ち"),
    ("approved", "承認済み"),
    ("rejected", "拒否"),
]
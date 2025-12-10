export const ROLE_CHOICES = [
  { value: 'client', label: '依頼人' },
  { value: 'coordinator', label: '仲介人' },
  { value: 'worker', label: '実行人'},
];

export const TASK_TYPE_CHOICES = [
  { value: 'software_dev', label: 'ソフトウェア開発' },
  { value: 'video_edit', label: '動画編集' },
  { value: 'writing', label: 'ライティング/コンテンツ作成' },
  { value: 'translation', label: '翻訳' },
];

export const STATUS_CHOICES = [
  { value: 'open', label: '公開中' },
  { value: 'in_progress', label: '進行中'},
  { value: 'completed', label: '完了' },
  { value: 'canceled', label: '取り下げ' },
];

export const REQUEST_STATUS_CHOICES = [
  { value: 'pending', label: '処理待ち' },
  { value: 'approved', label: '承認済み' },
  { value: 'rejected', label: '拒否' },
];
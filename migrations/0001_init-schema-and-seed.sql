-- Migration number: 0001 	 2025-07-06T19:01:59.068Z
-- 学習ログテーブル
CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  content TEXT NOT NULL,
  duration INTEGER NOT NULL,
  memo TEXT,
  ai_comment TEXT,
  created_at TEXT NOT NULL
);

-- ユーザーテーブル（任意だが将来用の拡張に備えて用意）
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT
);

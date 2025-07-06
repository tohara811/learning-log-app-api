-- Migration number: 0001 	 2025-07-06T19:01:59.068Z
ALTER TABLE users ADD COLUMN password_hash TEXT;

-- ============================================================
-- Royal Chess - PostgreSQL Seed Data (v2)
-- 1 Admin (manage only, no games) + 14 Players
-- Run after: rails db:create && rails db:migrate
-- Then open in pgAdmin → Query Tool → Execute (F5)
--
-- IMPORTANT: After inserting, run in Rails console:
--   User.update_all(password_digest: BCrypt::Password.create("password123"))
-- ============================================================

-- Clear existing data (safe re-run)
DELETE FROM games;
DELETE FROM daily_stats;
DELETE FROM users;

-- Reset sequences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE games_id_seq RESTART WITH 1;
ALTER SEQUENCE daily_stats_id_seq RESTART WITH 1;

-- ==================== ADMIN (1 account, does not play) ====================
INSERT INTO users (username, email, password_digest, role, rating, games_played, wins, losses, draws, created_at, updated_at) VALUES
('admin', 'admin@royalchess.com', 'PLACEHOLDER_MUST_UPDATE_VIA_CONSOLE', 'admin', 0, 0, 0, 0, 0, NOW() - INTERVAL '200 days', NOW());

-- ==================== PLAYERS (14 accounts) ====================
INSERT INTO users (username, email, password_digest, role, rating, games_played, wins, losses, draws, created_at, updated_at) VALUES
('queen_victoria', 'victoria@example.com', 'PLACEHOLDER_MUST_UPDATE_VIA_CONSOLE', 'player', 1620, 189, 98, 72, 19, NOW() - INTERVAL '150 days', NOW()),
('knight_rider', 'knight@example.com', 'PLACEHOLDER_MUST_UPDATE_VIA_CONSOLE', 'player', 1480, 156, 78, 60, 18, NOW() - INTERVAL '120 days', NOW()),
('bishop_blaze', 'bishop@example.com', 'PLACEHOLDER_MUST_UPDATE_VIA_CONSOLE', 'player', 1340, 98, 45, 42, 11, NOW() - INTERVAL '90 days', NOW()),
('rook_master', 'rook@example.com', 'PLACEHOLDER_MUST_UPDATE_VIA_CONSOLE', 'player', 1560, 167, 89, 61, 17, NOW() - INTERVAL '110 days', NOW()),
('pawn_storm', 'pawn@example.com', 'PLACEHOLDER_MUST_UPDATE_VIA_CONSOLE', 'player', 1050, 45, 15, 25, 5, NOW() - INTERVAL '30 days', NOW()),
('castling_king', 'castling@example.com', 'PLACEHOLDER_MUST_UPDATE_VIA_CONSOLE', 'player', 1200, 78, 35, 35, 8, NOW() - INTERVAL '60 days', NOW()),
('endgame_emma', 'emma@example.com', 'PLACEHOLDER_MUST_UPDATE_VIA_CONSOLE', 'player', 1710, 201, 118, 64, 19, NOW() - INTERVAL '160 days', NOW()),
('blitz_bolt', 'blitz@example.com', 'PLACEHOLDER_MUST_UPDATE_VIA_CONSOLE', 'player', 1420, 134, 62, 55, 17, NOW() - INTERVAL '100 days', NOW()),
('check_charlie', 'charlie@example.com', 'PLACEHOLDER_MUST_UPDATE_VIA_CONSOLE', 'player', 980, 32, 10, 18, 4, NOW() - INTERVAL '15 days', NOW()),
('stalemate_sam', 'sam@example.com', 'PLACEHOLDER_MUST_UPDATE_VIA_CONSOLE', 'player', 1150, 56, 22, 24, 10, NOW() - INTERVAL '45 days', NOW()),
('gambit_grace', 'grace@example.com', 'PLACEHOLDER_MUST_UPDATE_VIA_CONSOLE', 'player', 1580, 178, 95, 63, 20, NOW() - INTERVAL '140 days', NOW()),
('tempo_thomas', 'thomas@example.com', 'PLACEHOLDER_MUST_UPDATE_VIA_CONSOLE', 'player', 1390, 112, 52, 48, 12, NOW() - INTERVAL '85 days', NOW()),
('zugzwang_zara', 'zara@example.com', 'PLACEHOLDER_MUST_UPDATE_VIA_CONSOLE', 'player', 1660, 195, 108, 67, 20, NOW() - INTERVAL '155 days', NOW()),
('dragon_slayer', 'dragon@example.com', 'PLACEHOLDER_MUST_UPDATE_VIA_CONSOLE', 'player', 1780, 220, 130, 70, 20, NOW() - INTERVAL '170 days', NOW());

-- ==================== GAMES (all belong to players, NOT admin) ====================
INSERT INTO games (user_id, mode, difficulty, player_color, winner, result, moves, total_moves, created_at, updated_at) VALUES
((SELECT id FROM users WHERE username='queen_victoria'), 'pvp', NULL, 'w', 'w', 'win', 'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O h3 Nb8 d4 Nbd7', 20, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
((SELECT id FROM users WHERE username='knight_rider'), 'pvp', NULL, 'w', 'b', 'loss', 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3 h6 Bh4 b6 cxd5 Nxd5', 16, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
((SELECT id FROM users WHERE username='bishop_blaze'), 'pvp', NULL, 'b', 'b', 'win', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be2 e5 Nb3 Be7', 14, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
((SELECT id FROM users WHERE username='rook_master'), 'pvp', NULL, 'w', 'w', 'win', 'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4 exd4 cxd4 Bb4+ Nc3', 13, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
((SELECT id FROM users WHERE username='endgame_emma'), 'pvp', NULL, 'b', NULL, 'draw', 'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5 O-O Nc6', 14, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
((SELECT id FROM users WHERE username='dragon_slayer'), 'pvp', NULL, 'w', 'w', 'win', 'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Bc5 Be3 Qf6 c3 Nge7 Bc4 Ne5 Be2 Qg6', 16, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
((SELECT id FROM users WHERE username='gambit_grace'), 'pvp', NULL, 'b', 'w', 'loss', 'e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 g6 Nc3 Bg7 Be3 Nf6 Bc4 O-O Bb3 d6', 16, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
((SELECT id FROM users WHERE username='zugzwang_zara'), 'pvp', NULL, 'w', 'b', 'loss', 'd4 Nf6 c4 e6 Nc3 Bb4 Qc2 O-O a3 Bxc3+ Qxc3 b6 Bg5 Bb7', 14, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
((SELECT id FROM users WHERE username='blitz_bolt'), 'pvp', NULL, 'b', NULL, 'draw', 'c4 e5 Nc3 Nf6 Nf3 Nc6 g3 d5 cxd5 Nxd5 Bg2 Nb6 O-O Be7 d3 O-O', 16, NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
((SELECT id FROM users WHERE username='tempo_thomas'), 'pvp', NULL, 'w', 'w', 'win', 'e4 e6 d4 d5 Nc3 Bb4 e5 c5 a3 Bxc3+ bxc3 Ne7 Qg4 O-O', 14, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
-- AI games
((SELECT id FROM users WHERE username='queen_victoria'), 'ai', 'hard', 'w', 'w', 'win', 'e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Nxe4 d4 Nd6 Bxc6 dxc6 dxe5 Nf5 Qxd8+ Kxd8', 18, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
((SELECT id FROM users WHERE username='knight_rider'), 'ai', 'medium', 'w', 'w', 'win', 'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 Nf3 O-O e3 Nbd7', 12, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
((SELECT id FROM users WHERE username='rook_master'), 'ai', 'easy', 'b', 'b', 'win', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6', 10, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
((SELECT id FROM users WHERE username='pawn_storm'), 'ai', 'hard', 'w', 'b', 'loss', 'e4 e5 Nf3 Nc6 Bc4 Nf6 d3 Be7 O-O O-O Re1 d6 c3 Na5 Bb5 c6 Ba4', 18, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
((SELECT id FROM users WHERE username='castling_king'), 'ai', 'easy', 'w', 'w', 'win', 'e4 e5 Qh5 Nc6 Bc4 Nf6 Qxf7#', 7, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
((SELECT id FROM users WHERE username='endgame_emma'), 'ai', 'hard', 'b', NULL, 'draw', 'e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 d4 d5 Bd3 Bd6 O-O O-O c4 c6', 16, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
((SELECT id FROM users WHERE username='blitz_bolt'), 'ai', 'medium', 'w', 'w', 'win', 'd4 d5 c4 e6 Nf3 Nf6 g3 Be7 Bg2 O-O O-O dxc4 Qc2 a6 Qxc4', 16, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
((SELECT id FROM users WHERE username='gambit_grace'), 'ai', 'hard', 'w', 'w', 'win', 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6 Be3 e5 Nb3 Be6', 14, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
((SELECT id FROM users WHERE username='zugzwang_zara'), 'ai', 'medium', 'b', 'b', 'win', 'd4 Nf6 c4 e6 Nf3 b6 g3 Ba6 b3 Bb4+ Bd2 Be7', 12, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
((SELECT id FROM users WHERE username='dragon_slayer'), 'ai', 'hard', 'w', 'w', 'win', 'e4 e5 d4 exd4 Qxd4 Nc6 Qe3 Nf6 Nc3 Bb4 Bd2 O-O', 12, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days');

-- ==================== DAILY STATS ====================
INSERT INTO daily_stats (date, new_users, games_played, pvp_games, ai_games, avg_game_length, active_users, created_at, updated_at) VALUES
(CURRENT_DATE - INTERVAL '13 days', 3, 42, 25, 17, 34, 18, NOW(), NOW()),
(CURRENT_DATE - INTERVAL '12 days', 2, 38, 22, 16, 31, 15, NOW(), NOW()),
(CURRENT_DATE - INTERVAL '11 days', 5, 56, 32, 24, 28, 22, NOW(), NOW()),
(CURRENT_DATE - INTERVAL '10 days', 1, 35, 20, 15, 36, 14, NOW(), NOW()),
(CURRENT_DATE - INTERVAL '9 days', 4, 67, 38, 29, 30, 28, NOW(), NOW()),
(CURRENT_DATE - INTERVAL '8 days', 2, 45, 27, 18, 33, 19, NOW(), NOW()),
(CURRENT_DATE - INTERVAL '7 days', 6, 89, 52, 37, 29, 34, NOW(), NOW()),
(CURRENT_DATE - INTERVAL '6 days', 3, 58, 34, 24, 32, 24, NOW(), NOW()),
(CURRENT_DATE - INTERVAL '5 days', 4, 72, 42, 30, 27, 30, NOW(), NOW()),
(CURRENT_DATE - INTERVAL '4 days', 2, 48, 28, 20, 35, 20, NOW(), NOW()),
(CURRENT_DATE - INTERVAL '3 days', 5, 95, 55, 40, 26, 38, NOW(), NOW()),
(CURRENT_DATE - INTERVAL '2 days', 3, 68, 40, 28, 31, 26, NOW(), NOW()),
(CURRENT_DATE - INTERVAL '1 day', 7, 120, 70, 50, 24, 42, NOW(), NOW()),
(CURRENT_DATE, 4, 85, 48, 37, 28, 34, NOW(), NOW());

-- ============================================================
-- AFTER RUNNING THIS SQL, open Rails console and run:
--   User.update_all(password_digest: BCrypt::Password.create("password123"))
--
-- Admin login:  admin / password123 → goes to /admin
-- Player login: queen_victoria / password123 → goes to game
-- ============================================================

# Royal Chess — Hướng Dẫn Cài Đặt & Triển Khai

## Yêu Cầu Hệ Thống

| Phần mềm | Phiên bản |
|-----------|-----------|
| Ruby | >= 3.1 (khuyến nghị 3.2+) |
| Rails | 7.x |
| PostgreSQL | >= 14 |
| Node.js hoặc Bun | Node >= 18 / Bun >= 1.0 |
| Bundler | >= 2.0 |
| ngrok (tuỳ chọn) | Bản mới nhất |

---

## Bước 1 — Cài Đặt Backend

```bash
cd chess-backend
bundle install
```

Nếu gặp lỗi `pg` gem trên Windows, cần cài PostgreSQL trước và đảm bảo `pg_config` có trong PATH.

---

## Bước 2 — Cấu Hình Database

Mở file `config/database.yml`, kiểm tra thông tin:

```yaml
username: postgres
password: postgres123    # đổi theo mật khẩu PostgreSQL của bạn
host: localhost
port: 5432
```

---

## Bước 3 — Tạo Database & Chạy Migration

```bash
rails db:create
rails db:migrate
```

Sau lệnh này sẽ có database `royal_chess_development` với 3 bảng: `users`, `games`, `daily_stats`.

---

## Bước 4 — Import Dữ Liệu Mẫu

### Cách 1: Dùng pgAdmin (GUI)

1. Mở **pgAdmin 4**
2. Kết nối PostgreSQL → Mở database `royal_chess_development`
3. Click phải → **Query Tool**
4. Bấm icon **Open File** → Chọn file `seed_data.sql`
5. Bấm **Execute (F5)**

### Cách 2: Dùng command line

```bash
psql -U postgres -d royal_chess_development -f seed_data.sql
```

---

## Bước 5 — Cập Nhật Mật Khẩu (BẮT BUỘC)

File SQL chứa placeholder cho password. Phải chạy lệnh này để tạo hash BCrypt thật:

```bash
cd chess-backend
rails console
```

Trong console, gõ:

```ruby
User.update_all(password_digest: BCrypt::Password.create("password123"))
```

Gõ `exit` để thoát. Tất cả tài khoản giờ có mật khẩu `password123`.

---

## Bước 6 — Build Frontend

```bash
cd chess-frontend
bun install          # hoặc npm install
bun run build        # hoặc npm run build
```

Sau khi build xong, thư mục `dist/` sẽ chứa `index.html` + `assets/`.

---

## Bước 7 — Copy Frontend Vào Backend

```bash
# Tạo thư mục public nếu chưa có
mkdir -p chess-backend/public

# Copy toàn bộ file build vào
cp -r chess-frontend/dist/* chess-backend/public/
```

Trên Windows PowerShell:

```powershell
New-Item -ItemType Directory -Force -Path chess-backend\public
Copy-Item -Recurse -Force chess-frontend\dist\* chess-backend\public\
```

Sau bước này `chess-backend/public/` sẽ có:

```
public/
├── index.html
└── assets/
    ├── index-xxxxx.js
    └── index-xxxxx.css
```

---

## Bước 8 — Chạy Server

```bash
cd chess-backend
rails server -p 4000
```

Mở trình duyệt: **http://localhost:4000**

Frontend và Backend chạy chung 1 port. Không cần chạy 2 server riêng.

---

## Bước 9 — Deploy Ngrok (tuỳ chọn)

Mở terminal mới:

```bash
ngrok http 4000
```

Ngrok sẽ cấp URL dạng `https://xxxx.ngrok-free.app` — chia sẻ cho người khác truy cập.

---

## Tài Khoản Đăng Nhập

### Admin (1 tài khoản duy nhất)

| Username | Password | Sau khi login |
|----------|----------|---------------|
| `admin` | `password123` | → `/admin` (Dashboard) |

Admin **chỉ quản lý**, không chơi cờ.

### Players (14 tài khoản)

| Username | Password |
|----------|----------|
| `queen_victoria` | `password123` |
| `knight_rider` | `password123` |
| `bishop_blaze` | `password123` |
| `rook_master` | `password123` |
| `pawn_storm` | `password123` |
| `castling_king` | `password123` |
| `endgame_emma` | `password123` |
| `blitz_bolt` | `password123` |
| `check_charlie` | `password123` |
| `stalemate_sam` | `password123` |
| `gambit_grace` | `password123` |
| `tempo_thomas` | `password123` |
| `zugzwang_zara` | `password123` |
| `dragon_slayer` | `password123` |

Player đăng nhập → vào trang chơi cờ. Có thể tự đăng ký tài khoản mới qua tab Register.

---

## Cấu Trúc Thư Mục

```
chess-backend/
├── app/
│   ├── controllers/
│   │   ├── application_controller.rb       ← JWT auth + role guard
│   │   └── api/v1/
│   │       ├── auth_controller.rb          ← Login / Register / Me
│   │       ├── games_controller.rb         ← CRUD games (player)
│   │       └── admin/
│   │           ├── dashboard_controller.rb ← Stats + charts data
│   │           └── users_controller.rb     ← CRUD users (admin)
│   ├── models/
│   │   ├── user.rb                         ← BCrypt, rating, stats
│   │   ├── game.rb                         ← PvP/AI, moves notation
│   │   └── daily_stat.rb                   ← Daily analytics
│   └── services/
│       ├── jwt_service.rb                  ← JWT encode/decode
│       └── chess_ai_service.rb             ← Ruby chess engine
├── config/
│   ├── database.yml                        ← PostgreSQL config
│   ├── routes.rb                           ← API endpoints + SPA fallback
│   └── initializers/
│       └── cors.rb                         ← CORS policy
├── db/
│   ├── migrate/                            ← 3 migration files
│   └── schema.rb
└── public/                                 ← Frontend build output goes here

chess-frontend/
├── src/
│   ├── App.jsx                             ← Router + auth guards
│   ├── components/
│   │   ├── Sidebar.jsx                     ← Player sidebar (pixel)
│   │   ├── AdminSidebar.jsx                ← Admin sidebar (elegant)
│   │   ├── ChessBoard.jsx                  ← Interactive board
│   │   └── MoveHistory.jsx                 ← Move list + captured
│   ├── pages/
│   │   ├── AuthPage.jsx                    ← Login / Register
│   │   ├── HomePage.jsx                    ← Player home
│   │   ├── PvPPage.jsx                     ← Player vs Player
│   │   ├── AIPage.jsx                      ← Player vs AI
│   │   ├── HistoryPage.jsx                 ← Player game history
│   │   ├── AdminDashboard.jsx              ← Admin charts (DB data)
│   │   ├── AdminUsers.jsx                  ← Admin CRUD users
│   │   └── AdminGames.jsx                  ← Admin all games
│   ├── stores/
│   │   ├── authStore.js                    ← JWT token + user state
│   │   └── gameStore.js                    ← Game state persistence
│   └── utils/
│       ├── chessEngine.js                  ← Full chess logic + AI
│       └── icons.js                        ← Hand-crafted SVG icons
└── dist/                                   ← Build output
```

---

## API Endpoints

### Auth (public)

| Method | Path | Mô tả |
|--------|------|-------|
| POST | `/api/v1/auth/register` | Đăng ký `{email, username, password}` |
| POST | `/api/v1/auth/login` | Đăng nhập `{username, password}` → JWT |
| GET | `/api/v1/auth/me` | Lấy thông tin user hiện tại |

### Games (cần token)

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/api/v1/games` | Danh sách ván của user |
| GET | `/api/v1/games/:id` | Chi tiết 1 ván |
| POST | `/api/v1/games` | Lưu ván mới |

### Admin (cần token + role=admin)

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/api/v1/admin/stats` | Toàn bộ data dashboard |
| GET | `/api/v1/admin/games` | Tất cả ván (có filter mode) |
| GET | `/api/v1/admin/daily` | Daily stats (param: days) |
| GET | `/api/v1/admin/users` | Danh sách users |
| POST | `/api/v1/admin/users` | Tạo player mới |
| PUT | `/api/v1/admin/users/:id` | Sửa player |
| DELETE | `/api/v1/admin/users/:id` | Xóa player |

---

## Xử Lý Sự Cố

### Lỗi "BCrypt::Errors::InvalidHash"

Chưa cập nhật mật khẩu sau khi import SQL. Chạy:

```bash
rails console
User.update_all(password_digest: BCrypt::Password.create("password123"))
exit
```

### Lỗi "uninitialized constant Api::V1::AuthController"

File `config/initializers/inflections.rb` đang set `inflect.acronym "API"`. Xóa nội dung file đó hoặc để trống.

### Lỗi "uninitialized constant JwtService"

Kiểm tra `config/application.rb` có dòng:

```ruby
config.autoload_paths += %W[#{config.root}/app/services]
config.eager_load_paths += %W[#{config.root}/app/services]
```

### Lỗi CORS khi frontend gọi API

Kiểm tra `config/initializers/cors.rb`. Trong development, đảm bảo origin `http://localhost:4000` được phép.

### Lỗi foreign key khi import SQL

File SQL dùng `SELECT id FROM users WHERE username=...` nên không bị lệch ID. Nếu vẫn lỗi, chạy phần DELETE ở đầu file trước rồi import lại.

### Frontend trắng trang sau khi build

Kiểm tra đã copy `dist/*` vào `chess-backend/public/` chưa. Kiểm tra `config/routes.rb` có dòng SPA fallback:

```ruby
get '*path', to: proc { [200, { 'Content-Type' => 'text/html' }, [File.read(Rails.root.join('public/index.html'))]] },
  constraints: ->(req) { !req.path.start_with?('/api') && !req.path.start_with?('/up') }
```

### Lỗi "relation daily_stats already exists"

File SQL cũ có `CREATE TABLE IF NOT EXISTS`. File mới đã xóa dòng này. Dùng file `seed_data.sql` mới nhất.

---

## Tóm Tắt Lệnh Chạy Nhanh

```bash
# 1. Backend
cd chess-backend
bundle install
rails db:create
rails db:migrate

# 2. Import data (pgAdmin hoặc psql)
# Rồi chạy:
rails console
User.update_all(password_digest: BCrypt::Password.create("password123"))
exit

# 3. Frontend
cd chess-frontend
bun install
bun run build

# 4. Copy frontend vào backend
cp -r chess-frontend/dist/* chess-backend/public/

# 5. Chạy
cd chess-backend
rails server -p 4000

# 6. Mở http://localhost:4000
# 7. (Tuỳ chọn) ngrok http 4000
```

---

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | SolidJS + Vite |
| Backend | Ruby on Rails 7 (API mode) |
| Database | PostgreSQL |
| Auth | JWT + BCrypt |
| Chess AI | Minimax + Alpha-Beta (JS + Ruby) |
| Icons | Hand-crafted SVG (không dùng thư viện) |
| Style Player | Pixel art (Press Start 2P + VT323) |
| Style Admin | Elegant dark (Inter + DM Sans) |

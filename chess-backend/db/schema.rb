# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2024_01_01_000003) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "daily_stats", force: :cascade do |t|
    t.date "date", null: false
    t.integer "new_users", default: 0, null: false
    t.integer "games_played", default: 0, null: false
    t.integer "pvp_games", default: 0, null: false
    t.integer "ai_games", default: 0, null: false
    t.integer "avg_game_length", default: 0, null: false
    t.integer "active_users", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["date"], name: "index_daily_stats_on_date", unique: true
  end

  create_table "games", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "mode", null: false
    t.string "difficulty"
    t.string "player_color"
    t.string "winner"
    t.string "result", null: false
    t.text "moves"
    t.integer "total_moves", default: 0, null: false
    t.integer "duration_seconds"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_at"], name: "index_games_on_created_at"
    t.index ["mode"], name: "index_games_on_mode"
    t.index ["result"], name: "index_games_on_result"
    t.index ["user_id", "mode"], name: "index_games_on_user_id_and_mode"
    t.index ["user_id", "result"], name: "index_games_on_user_id_and_result"
    t.index ["user_id"], name: "index_games_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "username", null: false
    t.string "email", null: false
    t.string "password_digest", null: false
    t.string "role", default: "player", null: false
    t.integer "rating", default: 1200, null: false
    t.integer "games_played", default: 0, null: false
    t.integer "wins", default: 0, null: false
    t.integer "losses", default: 0, null: false
    t.integer "draws", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["rating"], name: "index_users_on_rating"
    t.index ["role"], name: "index_users_on_role"
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  add_foreign_key "games", "users"
end

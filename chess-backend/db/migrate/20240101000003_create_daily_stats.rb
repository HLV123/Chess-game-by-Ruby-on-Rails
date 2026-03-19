class CreateDailyStats < ActiveRecord::Migration[7.1]
  def change
    create_table :daily_stats do |t|
      t.date    :date,             null: false
      t.integer :new_users,        null: false, default: 0
      t.integer :games_played,     null: false, default: 0
      t.integer :pvp_games,        null: false, default: 0
      t.integer :ai_games,         null: false, default: 0
      t.integer :avg_game_length,  null: false, default: 0
      t.integer :active_users,     null: false, default: 0

      t.timestamps
    end

    add_index :daily_stats, :date, unique: true
  end
end

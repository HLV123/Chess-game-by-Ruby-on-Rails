class CreateGames < ActiveRecord::Migration[7.1]
  def change
    create_table :games do |t|
      t.references :user,         null: false, foreign_key: true
      t.string     :mode,         null: false  # 'pvp' or 'ai'
      t.string     :difficulty                 # 'easy', 'medium', 'hard' (AI only)
      t.string     :player_color               # 'w' or 'b'
      t.string     :winner                     # 'w', 'b', or null (draw)
      t.string     :result,       null: false  # 'win', 'loss', 'draw'
      t.text       :moves                      # Space-separated algebraic notation
      t.integer    :total_moves,  null: false, default: 0
      t.integer    :duration_seconds           # Game duration

      t.timestamps
    end

    add_index :games, :mode
    add_index :games, :result
    add_index :games, :created_at
    add_index :games, [:user_id, :mode]
    add_index :games, [:user_id, :result]
  end
end

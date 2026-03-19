class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users do |t|
      t.string  :username,        null: false
      t.string  :email,           null: false
      t.string  :password_digest, null: false
      t.string  :role,            null: false, default: "player"
      t.integer :rating,          null: false, default: 1200
      t.integer :games_played,    null: false, default: 0
      t.integer :wins,            null: false, default: 0
      t.integer :losses,          null: false, default: 0
      t.integer :draws,           null: false, default: 0

      t.timestamps
    end

    add_index :users, :username, unique: true
    add_index :users, :email,    unique: true
    add_index :users, :role
    add_index :users, :rating
  end
end

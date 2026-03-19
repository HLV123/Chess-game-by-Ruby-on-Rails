class DailyStat < ApplicationRecord
  validates :date, presence: true, uniqueness: true
  validates :new_users, :games_played, :pvp_games, :ai_games, :avg_game_length, :active_users,
            numericality: { greater_than_or_equal_to: 0 }

  scope :recent,     -> { order(date: :desc) }
  scope :last_days,  ->(n) { where("date >= ?", n.days.ago.to_date).order(date: :asc) }
  scope :last_week,  -> { last_days(7) }
  scope :last_month, -> { last_days(30) }

  def self.record_new_user
    find_or_create_by!(date: Date.current).increment!(:new_users)
  end

  def self.record_active_user
    stat = find_or_create_by!(date: Date.current)
    stat.update!(active_users: User.active_since(Time.current.beginning_of_day).count)
  end

  def self.record_game(mode)
    stat = find_or_create_by!(date: Date.current)
    stat.increment!(:games_played)
    stat.increment!(:pvp_games) if mode == "pvp"
    stat.increment!(:ai_games)  if mode == "ai"
  end
end

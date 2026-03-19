class Game < ApplicationRecord
  belongs_to :user

  validates :mode, presence: true, inclusion: { in: %w[pvp ai] }
  validates :result, presence: true, inclusion: { in: %w[win loss draw] }
  validates :total_moves, numericality: { greater_than_or_equal_to: 0 }
  validates :difficulty, inclusion: { in: %w[easy medium hard] }, allow_nil: true
  validates :player_color, inclusion: { in: %w[w b] }, allow_nil: true
  validates :winner, inclusion: { in: %w[w b] }, allow_nil: true

  scope :pvp_games,  -> { where(mode: "pvp") }
  scope :ai_games,   -> { where(mode: "ai") }
  scope :victories,  -> { where(result: "win") }
  scope :defeats,    -> { where(result: "loss") }
  scope :draws,      -> { where(result: "draw") }
  scope :recent,     -> { order(created_at: :desc) }
  scope :today,      -> { where("created_at >= ?", Time.current.beginning_of_day) }
  scope :this_week,  -> { where("created_at >= ?", 7.days.ago.beginning_of_day) }
  scope :this_month, -> { where("created_at >= ?", 30.days.ago.beginning_of_day) }

  after_create :update_user_stats
  after_create :update_daily_stats

  def move_list
    return [] if moves.blank?
    moves.split(" ")
  end

  def as_public_json
    {
      id: id, mode: mode, difficulty: difficulty, player_color: player_color,
      winner: winner, result: result, moves: moves, total_moves: total_moves,
      duration_seconds: duration_seconds, created_at: created_at
    }
  end

  private

  def update_user_stats
    user.update_stats_after_game!(result)
  end

  def update_daily_stats
    DailyStat.record_game(mode)
  end
end

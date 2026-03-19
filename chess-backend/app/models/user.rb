class User < ApplicationRecord
  has_secure_password

  has_many :games, dependent: :destroy

  validates :username, presence: true,
                       uniqueness: { case_sensitive: false },
                       length: { minimum: 3, maximum: 30 },
                       format: { with: /\A[a-zA-Z0-9_]+\z/, message: "only allows letters, numbers and underscores" }

  validates :email, presence: true,
                    uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }

  validates :password, length: { minimum: 6 }, if: -> { new_record? || !password.nil? }

  validates :role, inclusion: { in: %w[player admin] }
  validates :rating, numericality: { greater_than_or_equal_to: 0 }

  scope :players,      -> { where(role: "player") }
  scope :admins,       -> { where(role: "admin") }
  scope :by_rating,    -> { order(rating: :desc) }
  scope :active_since, ->(time) { where("updated_at >= ?", time) }
  scope :recent,       -> { order(created_at: :desc) }

  before_save :downcase_email

  def admin?
    role == "admin"
  end

  def win_rate
    return 0 if games_played.zero?
    ((wins.to_f / games_played) * 100).round(1)
  end

  # Fix [B1]: Single atomic update to avoid partial state on crash
  def update_stats_after_game!(result)
    attrs = { games_played: games_played + 1 }

    case result
    when "win"
      attrs[:wins] = wins + 1
      attrs[:rating] = [rating + 15, 100].max
    when "loss"
      attrs[:losses] = losses + 1
      attrs[:rating] = [rating - 15, 100].max
    when "draw"
      attrs[:draws] = draws + 1
    end

    update!(attrs)
  end

  def as_public_json
    {
      id: id,
      username: username,
      email: email,
      role: role,
      rating: rating,
      games_played: games_played,
      wins: wins,
      losses: losses,
      draws: draws,
      win_rate: win_rate,
      created_at: created_at
    }
  end

  private

  def downcase_email
    self.email = email.downcase
  end
end

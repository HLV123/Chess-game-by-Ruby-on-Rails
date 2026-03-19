FactoryBot.define do
  factory :user do
    sequence(:username) { |n| "player_#{n}" }
    sequence(:email) { |n| "player#{n}@example.com" }
    password { "password123" }
    role { "player" }
    rating { 1200 }
    games_played { 0 }
    wins { 0 }
    losses { 0 }
    draws { 0 }

    trait :admin do
      role { "admin" }
      rating { 1800 }
    end

    trait :experienced do
      games_played { 100 }
      wins { 55 }
      losses { 35 }
      draws { 10 }
      rating { 1500 }
    end
  end
end

FactoryBot.define do
  factory :game do
    association :user
    mode { "pvp" }
    result { "win" }
    winner { "w" }
    total_moves { 30 }
    moves { "e4 e5 Nf3 Nc6 Bb5 a6" }

    trait :pvp do
      mode { "pvp" }
    end

    trait :ai_easy do
      mode { "ai" }
      difficulty { "easy" }
      player_color { "w" }
    end

    trait :ai_medium do
      mode { "ai" }
      difficulty { "medium" }
      player_color { "w" }
    end

    trait :ai_hard do
      mode { "ai" }
      difficulty { "hard" }
      player_color { "b" }
    end

    trait :loss do
      result { "loss" }
      winner { "b" }
    end

    trait :draw do
      result { "draw" }
      winner { nil }
    end
  end
end

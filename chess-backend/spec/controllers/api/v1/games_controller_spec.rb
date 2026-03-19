require "rails_helper"

RSpec.describe "Api::V1::Games", type: :request do
  let(:user) { create(:user) }

  describe "GET /api/v1/games" do
    before do
      create_list(:game, 3, user: user)
      create(:game) # another user's game
    end

    it "returns only current user's games" do
      get "/api/v1/games", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["games"].length).to eq(3)
    end

    it "returns 401 without auth" do
      get "/api/v1/games"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "POST /api/v1/games" do
    let(:game_params) do
      {
        game: {
          mode: "pvp",
          result: "win",
          winner: "w",
          total_moves: 32,
          moves: "e4 e5 Nf3 Nc6"
        }
      }
    end

    it "creates a game" do
      post "/api/v1/games", params: game_params, headers: auth_headers(user), as: :json

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["game"]["mode"]).to eq("pvp")
      expect(json["game"]["result"]).to eq("win")
    end

    it "updates user stats" do
      expect {
        post "/api/v1/games", params: game_params, headers: auth_headers(user), as: :json
      }.to change { user.reload.games_played }.by(1)
       .and change { user.reload.wins }.by(1)
    end

    it "creates AI game with difficulty" do
      ai_params = {
        game: {
          mode: "ai", difficulty: "hard", player_color: "w",
          result: "loss", winner: "b", total_moves: 45, moves: "d4 d5"
        }
      }
      post "/api/v1/games", params: ai_params, headers: auth_headers(user), as: :json

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["game"]["difficulty"]).to eq("hard")
    end

    it "returns error for invalid params" do
      post "/api/v1/games",
        params: { game: { mode: "invalid", result: "win", total_moves: 0 } },
        headers: auth_headers(user), as: :json

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "GET /api/v1/games/:id" do
    let!(:game) { create(:game, user: user) }

    it "returns the game" do
      get "/api/v1/games/#{game.id}", headers: auth_headers(user)
      expect(response).to have_http_status(:ok)
    end

    it "returns 404 for other user's game" do
      other_game = create(:game)
      get "/api/v1/games/#{other_game.id}", headers: auth_headers(user)
      expect(response).to have_http_status(:not_found)
    end
  end
end

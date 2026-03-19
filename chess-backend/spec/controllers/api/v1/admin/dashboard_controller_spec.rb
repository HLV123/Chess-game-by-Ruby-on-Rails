require "rails_helper"

RSpec.describe "Api::V1::Admin::Dashboard", type: :request do
  let(:admin) { create(:user, :admin) }
  let(:player) { create(:user) }

  describe "GET /api/v1/admin/stats" do
    before do
      create_list(:user, 5)
      create_list(:game, 10, user: admin)
      create_list(:game, 5, :ai_medium, user: player)
    end

    it "returns stats for admin" do
      get "/api/v1/admin/stats", headers: auth_headers(admin)

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["stats"]["totalUsers"]).to be >= 7
      expect(json["stats"]["totalGames"]).to eq(15)
      expect(json["users"]).to be_an(Array)
      expect(json["game_mode_distribution"]).to be_an(Array)
      expect(json["rating_distribution"]).to be_an(Array)
      expect(json["activity_heatmap"]).to be_an(Array)
      expect(json["activity_heatmap"].length).to eq(28)
    end

    it "returns 403 for regular player" do
      get "/api/v1/admin/stats", headers: auth_headers(player)
      expect(response).to have_http_status(:forbidden)
    end

    it "returns 401 without auth" do
      get "/api/v1/admin/stats"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "GET /api/v1/admin/users" do
    before { create_list(:user, 25) }

    it "paginates users" do
      get "/api/v1/admin/users", params: { page: 1, per_page: 10 }, headers: auth_headers(admin)

      json = JSON.parse(response.body)
      expect(json["users"].length).to eq(10)
      expect(json["total"]).to be >= 25
      expect(json["total_pages"]).to be >= 3
    end
  end

  describe "GET /api/v1/admin/games" do
    before do
      create_list(:game, 5, :pvp, user: admin)
      create_list(:game, 3, :ai_hard, user: admin)
    end

    it "returns all games" do
      get "/api/v1/admin/games", headers: auth_headers(admin)

      json = JSON.parse(response.body)
      expect(json["games"].length).to eq(8)
    end

    it "filters by mode" do
      get "/api/v1/admin/games", params: { mode: "ai" }, headers: auth_headers(admin)

      json = JSON.parse(response.body)
      expect(json["games"].length).to eq(3)
    end
  end

  describe "GET /api/v1/admin/daily" do
    before do
      3.times do |i|
        DailyStat.create!(date: i.days.ago.to_date, new_users: i + 1, games_played: (i + 1) * 10)
      end
    end

    it "returns daily stats" do
      get "/api/v1/admin/daily", params: { days: 7 }, headers: auth_headers(admin)

      json = JSON.parse(response.body)
      expect(json["daily_stats"].length).to eq(3)
    end
  end
end

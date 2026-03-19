require "rails_helper"

RSpec.describe "Api::V1::Auth", type: :request do
  describe "POST /api/v1/auth/register" do
    let(:valid_params) { { username: "newplayer", email: "new@example.com", password: "secret123" } }

    it "creates a user and returns token" do
      post "/api/v1/auth/register", params: valid_params, as: :json

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["token"]).to be_present
      expect(json["user"]["username"]).to eq("newplayer")
      expect(json["user"]["email"]).to eq("new@example.com")
      expect(json["user"]["role"]).to eq("player")
    end

    it "returns error for duplicate username" do
      create(:user, username: "newplayer")
      post "/api/v1/auth/register", params: valid_params, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json["error"]).to include("Username")
    end

    it "returns error for short password" do
      post "/api/v1/auth/register", params: valid_params.merge(password: "ab"), as: :json

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "POST /api/v1/auth/login" do
    let!(:user) { create(:user, username: "testuser", password: "secret123") }

    it "returns token for valid credentials" do
      post "/api/v1/auth/login", params: { username: "testuser", password: "secret123" }, as: :json

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["token"]).to be_present
      expect(json["user"]["username"]).to eq("testuser")
    end

    it "is case insensitive for username" do
      post "/api/v1/auth/login", params: { username: "TESTUSER", password: "secret123" }, as: :json
      expect(response).to have_http_status(:ok)
    end

    it "returns error for wrong password" do
      post "/api/v1/auth/login", params: { username: "testuser", password: "wrong" }, as: :json

      expect(response).to have_http_status(:unauthorized)
      json = JSON.parse(response.body)
      expect(json["error"]).to eq("Invalid username or password")
    end

    it "returns error for non-existent user" do
      post "/api/v1/auth/login", params: { username: "nobody", password: "secret123" }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "GET /api/v1/auth/me" do
    let(:user) { create(:user) }

    it "returns current user with valid token" do
      get "/api/v1/auth/me", headers: auth_headers(user)

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["user"]["id"]).to eq(user.id)
    end

    it "returns 401 without token" do
      get "/api/v1/auth/me"
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns 401 with invalid token" do
      get "/api/v1/auth/me", headers: { "Authorization" => "Bearer garbage" }
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

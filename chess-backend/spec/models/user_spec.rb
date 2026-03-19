require "rails_helper"

RSpec.describe User, type: :model do
  describe "validations" do
    subject { build(:user) }

    it { is_expected.to be_valid }

    it "requires username" do
      subject.username = nil
      expect(subject).not_to be_valid
    end

    it "requires unique username" do
      create(:user, username: "taken")
      subject.username = "taken"
      expect(subject).not_to be_valid
    end

    it "requires email" do
      subject.email = nil
      expect(subject).not_to be_valid
    end

    it "requires valid email format" do
      subject.email = "invalid"
      expect(subject).not_to be_valid
    end

    it "requires unique email" do
      create(:user, email: "taken@example.com")
      subject.email = "taken@example.com"
      expect(subject).not_to be_valid
    end

    it "requires password minimum 6 chars" do
      subject.password = "short"
      expect(subject).not_to be_valid
    end

    it "validates role inclusion" do
      subject.role = "superadmin"
      expect(subject).not_to be_valid
    end

    it "downcases email before save" do
      subject.email = "TEST@EXAMPLE.COM"
      subject.save!
      expect(subject.reload.email).to eq("test@example.com")
    end
  end

  describe "#admin?" do
    it "returns true for admin role" do
      user = build(:user, :admin)
      expect(user.admin?).to be true
    end

    it "returns false for player role" do
      user = build(:user)
      expect(user.admin?).to be false
    end
  end

  describe "#win_rate" do
    it "returns 0 when no games played" do
      user = build(:user, games_played: 0)
      expect(user.win_rate).to eq(0)
    end

    it "calculates correctly" do
      user = build(:user, games_played: 100, wins: 60)
      expect(user.win_rate).to eq(60.0)
    end
  end

  describe "#update_stats_after_game!" do
    let(:user) { create(:user, rating: 1200, wins: 5, losses: 3, draws: 1, games_played: 9) }

    it "increments wins and rating on win" do
      user.update_stats_after_game!("win")
      expect(user.reload.wins).to eq(6)
      expect(user.rating).to eq(1215)
      expect(user.games_played).to eq(10)
    end

    it "increments losses and decreases rating on loss" do
      user.update_stats_after_game!("loss")
      expect(user.reload.losses).to eq(4)
      expect(user.rating).to eq(1185)
    end

    it "increments draws on draw" do
      user.update_stats_after_game!("draw")
      expect(user.reload.draws).to eq(2)
    end
  end

  describe "scopes" do
    before do
      create(:user, role: "admin")
      create(:user, role: "player")
      create(:user, role: "player", rating: 1800)
    end

    it ".admins returns only admins" do
      expect(User.admins.count).to eq(1)
    end

    it ".players returns only players" do
      expect(User.players.count).to eq(2)
    end

    it ".by_rating orders descending" do
      ratings = User.by_rating.pluck(:rating)
      expect(ratings).to eq(ratings.sort.reverse)
    end
  end
end

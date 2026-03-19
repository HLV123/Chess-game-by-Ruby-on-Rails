require "rails_helper"

RSpec.describe Game, type: :model do
  describe "validations" do
    subject { build(:game) }

    it { is_expected.to be_valid }

    it "requires mode" do
      subject.mode = nil
      expect(subject).not_to be_valid
    end

    it "validates mode inclusion" do
      subject.mode = "invalid"
      expect(subject).not_to be_valid
    end

    it "requires result" do
      subject.result = nil
      expect(subject).not_to be_valid
    end

    it "validates difficulty when present" do
      subject.mode = "ai"
      subject.difficulty = "impossible"
      expect(subject).not_to be_valid
    end

    it "allows nil difficulty for pvp" do
      subject.mode = "pvp"
      subject.difficulty = nil
      expect(subject).to be_valid
    end
  end

  describe "scopes" do
    let(:user) { create(:user) }

    before do
      create(:game, :pvp, user: user)
      create(:game, :ai_easy, user: user)
      create(:game, :pvp, :loss, user: user)
      create(:game, :pvp, :draw, user: user)
    end

    it ".pvp_games" do
      expect(Game.pvp_games.count).to eq(3)
    end

    it ".ai_games" do
      expect(Game.ai_games.count).to eq(1)
    end

    it ".victories" do
      expect(Game.victories.count).to eq(2)
    end

    it ".defeats" do
      expect(Game.defeats.count).to eq(1)
    end

    it ".draws" do
      expect(Game.draws.count).to eq(1)
    end
  end

  describe "#move_list" do
    it "splits moves into array" do
      game = build(:game, moves: "e4 e5 Nf3 Nc6")
      expect(game.move_list).to eq(%w[e4 e5 Nf3 Nc6])
    end

    it "returns empty array for nil moves" do
      game = build(:game, moves: nil)
      expect(game.move_list).to eq([])
    end
  end

  describe "callbacks" do
    it "updates user stats after create" do
      user = create(:user, games_played: 0, wins: 0)
      create(:game, user: user, result: "win")
      user.reload
      expect(user.games_played).to eq(1)
      expect(user.wins).to eq(1)
    end
  end
end

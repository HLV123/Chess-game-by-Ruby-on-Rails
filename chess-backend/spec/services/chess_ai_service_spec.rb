require "rails_helper"

RSpec.describe ChessAiService do
  describe ".initial_board" do
    it "creates standard 8x8 board" do
      board = described_class.initial_board
      expect(board.length).to eq(8)
      expect(board[0].length).to eq(8)
    end

    it "places white pieces on rows 6-7" do
      board = described_class.initial_board
      expect(board[7][4].type).to eq(:K)
      expect(board[7][4].color).to eq(:w)
      expect(board[6][0].type).to eq(:P)
      expect(board[6][0].color).to eq(:w)
    end

    it "places black pieces on rows 0-1" do
      board = described_class.initial_board
      expect(board[0][4].type).to eq(:K)
      expect(board[0][4].color).to eq(:b)
      expect(board[1][3].type).to eq(:P)
      expect(board[1][3].color).to eq(:b)
    end

    it "leaves middle rows empty" do
      board = described_class.initial_board
      (2..5).each do |r|
        8.times do |c|
          expect(board[r][c]).to be_nil
        end
      end
    end
  end

  describe ".get_ai_move" do
    let(:board) { described_class.initial_board }
    let(:board_state) do
      {
        board: board.map { |row| row.map { |p| p ? { "type" => p.type.to_s, "color" => p.color.to_s } : nil } },
        turn: "w",
        castling: { "wK" => true, "wQ" => true, "bK" => true, "bQ" => true }
      }
    end

    it "returns a valid move for easy difficulty" do
      move = described_class.get_ai_move(board_state, "easy")
      expect(move).to be_present
      expect(move[:from]).to be_a(String)
      expect(move[:to]).to be_a(String)
    end

    it "returns a valid move for medium difficulty" do
      move = described_class.get_ai_move(board_state, "medium")
      expect(move).to be_present
    end

    it "returns a valid move for hard difficulty" do
      move = described_class.get_ai_move(board_state, "hard")
      expect(move).to be_present
    end
  end
end

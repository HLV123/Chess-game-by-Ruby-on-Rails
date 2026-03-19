
class ChessAiService
  PIECES = { king: :K, queen: :Q, rook: :R, bishop: :B, knight: :N, pawn: :P }.freeze
  WHITE = :w
  BLACK = :b

  PIECE_VALUES = {
    K: 20_000, Q: 900, R: 500, B: 330, N: 320, P: 100
  }.freeze

  PST_PAWN = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ].freeze

  PST_KNIGHT = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ].freeze

  PST_BISHOP = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ].freeze

  PST_ROOK = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
  ].freeze

  PST_QUEEN = [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ].freeze

  PST_KING = [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
  ].freeze

  PST = {
    P: PST_PAWN, N: PST_KNIGHT, B: PST_BISHOP,
    R: PST_ROOK, Q: PST_QUEEN,  K: PST_KING
  }.freeze

  Piece = Struct.new(:type, :color)
  Move  = Struct.new(:from_row, :from_col, :to_row, :to_col, :special)

  class << self
    def initial_board
      board = Array.new(8) { Array.new(8, nil) }
      back_row = [:R, :N, :B, :Q, :K, :B, :N, :R]

      8.times do |c|
        board[0][c] = Piece.new(back_row[c], BLACK)
        board[1][c] = Piece.new(:P, BLACK)
        board[6][c] = Piece.new(:P, WHITE)
        board[7][c] = Piece.new(back_row[c], WHITE)
      end
      board
    end

    def get_ai_move(board_state, difficulty = "medium")
      depth = case difficulty
              when "easy"   then 1
              when "medium" then 3
              when "hard"   then 4
              else 3
              end

      board    = parse_board(board_state[:board])
      turn     = board_state[:turn].to_sym
      castling = board_state[:castling]

      moves = all_legal_moves(board, turn, castling)
      return nil if moves.empty?

      if difficulty == "easy" && rand < 0.3
        chosen = moves.sample
        return format_move(chosen)
      end

      maximizing = turn == WHITE
      best_move  = nil
      best_eval  = maximizing ? -Float::INFINITY : Float::INFINITY

      ordered = order_moves(board, moves)
      ordered.each do |move|
        new_board = apply_move_to_board(deep_clone_board(board), move)
        eval = minimax(new_board, depth - 1, -Float::INFINITY, Float::INFINITY, !maximizing, castling)

        if maximizing
          if eval > best_eval
            best_eval = eval
            best_move = move
          end
        else
          if eval < best_eval
            best_eval = eval
            best_move = move
          end
        end
      end

      format_move(best_move)
    end

    private

    def in_bounds?(r, c)
      r >= 0 && r < 8 && c >= 0 && c < 8
    end

    def deep_clone_board(board)
      board.map { |row| row.map { |cell| cell&.dup } }
    end

    def find_king(board, color)
      8.times do |r|
        8.times do |c|
          p = board[r][c]
          return [r, c] if p && p.type == :K && p.color == color
        end
      end
      nil
    end

    def square_attacked?(board, row, col, by_color)
      # Knight
      [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].each do |dr, dc|
        nr, nc = row + dr, col + dc
        next unless in_bounds?(nr, nc)
        p = board[nr][nc]
        return true if p && p.type == :N && p.color == by_color
      end

      [[0,1],[0,-1],[1,0],[-1,0]].each do |dr, dc|
        (1..7).each do |i|
          nr, nc = row + dr*i, col + dc*i
          break unless in_bounds?(nr, nc)
          p = board[nr][nc]
          if p
            return true if p.color == by_color && (p.type == :R || p.type == :Q)
            break
          end
        end
      end

      [[1,1],[1,-1],[-1,1],[-1,-1]].each do |dr, dc|
        (1..7).each do |i|
          nr, nc = row + dr*i, col + dc*i
          break unless in_bounds?(nr, nc)
          p = board[nr][nc]
          if p
            return true if p.color == by_color && (p.type == :B || p.type == :Q)
            break
          end
        end
      end

      pawn_dir = by_color == WHITE ? 1 : -1
      [-1, 1].each do |dc|
        nr, nc = row + pawn_dir, col + dc
        next unless in_bounds?(nr, nc)
        p = board[nr][nc]
        return true if p && p.type == :P && p.color == by_color
      end

      (-1..1).each do |dr|
        (-1..1).each do |dc|
          next if dr == 0 && dc == 0
          nr, nc = row + dr, col + dc
          next unless in_bounds?(nr, nc)
          p = board[nr][nc]
          return true if p && p.type == :K && p.color == by_color
        end
      end

      false
    end

    def in_check?(board, color)
      king = find_king(board, color)
      return false unless king
      enemy = color == WHITE ? BLACK : WHITE
      square_attacked?(board, king[0], king[1], enemy)
    end

    def pseudo_moves(board, row, col, castling = nil)
      piece = board[row][col]
      return [] unless piece

      moves = []
      color = piece.color
      enemy = color == WHITE ? BLACK : WHITE

      case piece.type
      when :P
        dir = color == WHITE ? -1 : 1
        start_row = color == WHITE ? 6 : 1
        promo_row = color == WHITE ? 0 : 7

        nr = row + dir
        if in_bounds?(nr, col) && board[nr][col].nil?
          if nr == promo_row
            [:Q, :R, :B, :N].each { |pt| moves << Move.new(row, col, nr, col, { type: :promotion, piece: pt }) }
          else
            moves << Move.new(row, col, nr, col, nil)
          end
  
          nr2 = row + 2*dir
          if row == start_row && board[nr2][col].nil?
            moves << Move.new(row, col, nr2, col, { type: :double_pawn })
          end
        end

        [-1, 1].each do |dc|
          nr, nc = row + dir, col + dc
          next unless in_bounds?(nr, nc)
          target = board[nr][nc]
          if target && target.color == enemy
            if nr == promo_row
              [:Q, :R, :B, :N].each { |pt| moves << Move.new(row, col, nr, nc, { type: :promotion, piece: pt }) }
            else
              moves << Move.new(row, col, nr, nc, nil)
            end
          end
        end

      when :N
        [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].each do |dr, dc|
          nr, nc = row + dr, col + dc
          next unless in_bounds?(nr, nc)
          target = board[nr][nc]
          moves << Move.new(row, col, nr, nc, nil) if target.nil? || target.color == enemy
        end

      when :B
        [[1,1],[1,-1],[-1,1],[-1,-1]].each do |dr, dc|
          (1..7).each do |i|
            nr, nc = row + dr*i, col + dc*i
            break unless in_bounds?(nr, nc)
            target = board[nr][nc]
            if target.nil?
              moves << Move.new(row, col, nr, nc, nil)
            else
              moves << Move.new(row, col, nr, nc, nil) if target.color == enemy
              break
            end
          end
        end

      when :R
        [[0,1],[0,-1],[1,0],[-1,0]].each do |dr, dc|
          (1..7).each do |i|
            nr, nc = row + dr*i, col + dc*i
            break unless in_bounds?(nr, nc)
            target = board[nr][nc]
            if target.nil?
              moves << Move.new(row, col, nr, nc, nil)
            else
              moves << Move.new(row, col, nr, nc, nil) if target.color == enemy
              break
            end
          end
        end

      when :Q
        [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]].each do |dr, dc|
          (1..7).each do |i|
            nr, nc = row + dr*i, col + dc*i
            break unless in_bounds?(nr, nc)
            target = board[nr][nc]
            if target.nil?
              moves << Move.new(row, col, nr, nc, nil)
            else
              moves << Move.new(row, col, nr, nc, nil) if target.color == enemy
              break
            end
          end
        end

      when :K
        (-1..1).each do |dr|
          (-1..1).each do |dc|
            next if dr == 0 && dc == 0
            nr, nc = row + dr, col + dc
            next unless in_bounds?(nr, nc)
            target = board[nr][nc]
            moves << Move.new(row, col, nr, nc, nil) if target.nil? || target.color == enemy
          end
        end

        if castling
          castle_row = color == WHITE ? 7 : 0
          ks_key = color == WHITE ? "wK" : "bK"
          qs_key = color == WHITE ? "wQ" : "bQ"

          if castling[ks_key] && row == castle_row && col == 4
            if board[castle_row][5].nil? && board[castle_row][6].nil? &&
               board[castle_row][7]&.type == :R && board[castle_row][7]&.color == color
              unless square_attacked?(board, castle_row, 4, enemy) ||
                     square_attacked?(board, castle_row, 5, enemy) ||
                     square_attacked?(board, castle_row, 6, enemy)
                moves << Move.new(castle_row, 4, castle_row, 6, { type: :castle, side: :K })
              end
            end
          end

          if castling[qs_key] && row == castle_row && col == 4
            if board[castle_row][3].nil? && board[castle_row][2].nil? && board[castle_row][1].nil? &&
               board[castle_row][0]&.type == :R && board[castle_row][0]&.color == color
              unless square_attacked?(board, castle_row, 4, enemy) ||
                     square_attacked?(board, castle_row, 3, enemy) ||
                     square_attacked?(board, castle_row, 2, enemy)
                moves << Move.new(castle_row, 4, castle_row, 2, { type: :castle, side: :Q })
              end
            end
          end
        end
      end

      moves
    end

    def legal_moves(board, row, col, castling = nil)
      piece = board[row][col]
      return [] unless piece

      pseudo_moves(board, row, col, castling).select do |move|
        test_board = deep_clone_board(board)
        apply_move_to_board(test_board, move)
        !in_check?(test_board, piece.color)
      end
    end

    def all_legal_moves(board, color, castling = nil)
      moves = []
      8.times do |r|
        8.times do |c|
          p = board[r][c]
          next unless p && p.color == color
          moves.concat(legal_moves(board, r, c, castling))
        end
      end
      moves
    end

    def apply_move_to_board(board, move)
      piece = board[move.from_row][move.from_col]
      board[move.to_row][move.to_col] = piece
      board[move.from_row][move.from_col] = nil

      if move.special
        case move.special[:type]
        when :castle
          cr = move.to_row
          if move.special[:side] == :K
            board[cr][5] = board[cr][7]
            board[cr][7] = nil
          else
            board[cr][3] = board[cr][0]
            board[cr][0] = nil
          end
        when :promotion
          board[move.to_row][move.to_col] = Piece.new(move.special[:piece], piece.color)
        when :en_passant
          cap_row = piece.color == WHITE ? move.to_row + 1 : move.to_row - 1
          board[cap_row][move.to_col] = nil
        end
      end

      board
    end

    def evaluate(board)
      score = 0
      8.times do |r|
        8.times do |c|
          p = board[r][c]
          next unless p
          val = PIECE_VALUES[p.type] || 0
          pst = PST[p.type]
          pst_row = p.color == WHITE ? r : 7 - r
          pst_val = pst ? pst[pst_row][c] : 0
          total = val + pst_val
          score += p.color == WHITE ? total : -total
        end
      end
      score
    end

    def order_moves(board, moves)
      moves.sort_by do |m|
        score = 0
        target = board[m.to_row][m.to_col]
        attacker = board[m.from_row][m.from_col]
        if target
          score -= (PIECE_VALUES[target.type] || 0) - (PIECE_VALUES[attacker.type] || 0) / 10
        end
        score -= 800 if m.special&.dig(:type) == :promotion
        score
      end
    end

    def minimax(board, depth, alpha, beta, maximizing, castling)
      color = maximizing ? WHITE : BLACK
      moves = all_legal_moves(board, color, castling)

      if depth == 0 || moves.empty?
        if moves.empty?
          return in_check?(board, color) ? (maximizing ? -100_000 : 100_000) : 0
        end
        return evaluate(board)
      end

      if maximizing
        max_eval = -Float::INFINITY
        order_moves(board, moves).each do |move|
          new_board = apply_move_to_board(deep_clone_board(board), move)
          val = minimax(new_board, depth - 1, alpha, beta, false, castling)
          max_eval = [max_eval, val].max
          alpha = [alpha, val].max
          break if beta <= alpha
        end
        max_eval
      else
        min_eval = Float::INFINITY
        order_moves(board, moves).each do |move|
          new_board = apply_move_to_board(deep_clone_board(board), move)
          val = minimax(new_board, depth - 1, alpha, beta, true, castling)
          min_eval = [min_eval, val].min
          beta = [beta, val].min
          break if beta <= alpha
        end
        min_eval
      end
    end

    def parse_board(board_data)
      return initial_board if board_data.nil?

      board_data.map do |row|
        row.map do |cell|
          if cell.nil?
            nil
          else
            Piece.new(cell["type"].to_sym, cell["color"].to_sym)
          end
        end
      end
    end

    def format_move(move)
      return nil unless move
      cols = %w[a b c d e f g h]
      {
        from: "#{cols[move.from_col]}#{8 - move.from_row}",
        to: "#{cols[move.to_col]}#{8 - move.to_row}",
        from_row: move.from_row,
        from_col: move.from_col,
        to_row: move.to_row,
        to_col: move.to_col,
        special: move.special
      }
    end
  end
end

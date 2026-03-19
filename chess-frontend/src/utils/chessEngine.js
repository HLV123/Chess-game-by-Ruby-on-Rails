// ============================================================
// Chess Engine - Full rules, move generation, and basic AI
// ============================================================

const PIECES = {
  KING: 'K', QUEEN: 'Q', ROOK: 'R', BISHOP: 'B', KNIGHT: 'N', PAWN: 'P'
};
const COLORS = { WHITE: 'w', BLACK: 'b' };

// Initial board setup
function createInitialBoard() {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  const backRow = [PIECES.ROOK, PIECES.KNIGHT, PIECES.BISHOP, PIECES.QUEEN, PIECES.KING, PIECES.BISHOP, PIECES.KNIGHT, PIECES.ROOK];

  for (let c = 0; c < 8; c++) {
    board[0][c] = { type: backRow[c], color: COLORS.BLACK };
    board[1][c] = { type: PIECES.PAWN, color: COLORS.BLACK };
    board[6][c] = { type: PIECES.PAWN, color: COLORS.WHITE };
    board[7][c] = { type: backRow[c], color: COLORS.WHITE };
  }
  return board;
}

function createGameState() {
  return {
    board: createInitialBoard(),
    turn: COLORS.WHITE,
    castling: { wK: true, wQ: true, bK: true, bQ: true },
    enPassant: null, // {row, col}
    halfMoves: 0,
    fullMoves: 1,
    moveHistory: [],
    capturedPieces: { w: [], b: [] },
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    isDraw: false,
    gameOver: false,
    winner: null,
    lastMove: null,
    positionHistory: [],
  };
}

function cloneBoard(board) {
  return board.map(row => row.map(cell => cell ? { ...cell } : null));
}

function cloneState(state) {
  return {
    ...state,
    board: cloneBoard(state.board),
    castling: { ...state.castling },
    enPassant: state.enPassant ? { ...state.enPassant } : null,
    moveHistory: [...state.moveHistory],
    capturedPieces: { w: [...state.capturedPieces.w], b: [...state.capturedPieces.b] },
    lastMove: state.lastMove ? { ...state.lastMove } : null,
    positionHistory: [...state.positionHistory],
  };
}

function inBounds(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function findKing(board, color) {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c] && board[r][c].type === PIECES.KING && board[r][c].color === color)
        return { row: r, col: c };
  return null;
}

function isSquareAttacked(board, row, col, byColor) {
  // Knight attacks
  const knightMoves = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  for (const [dr, dc] of knightMoves) {
    const nr = row + dr, nc = col + dc;
    if (inBounds(nr, nc) && board[nr][nc]?.type === PIECES.KNIGHT && board[nr][nc]?.color === byColor)
      return true;
  }

  // Sliding pieces (Rook/Queen straight, Bishop/Queen diagonal)
  const straightDirs = [[0,1],[0,-1],[1,0],[-1,0]];
  const diagDirs = [[1,1],[1,-1],[-1,1],[-1,-1]];

  for (const [dr, dc] of straightDirs) {
    for (let i = 1; i < 8; i++) {
      const nr = row + dr*i, nc = col + dc*i;
      if (!inBounds(nr, nc)) break;
      const piece = board[nr][nc];
      if (piece) {
        if (piece.color === byColor && (piece.type === PIECES.ROOK || piece.type === PIECES.QUEEN))
          return true;
        break;
      }
    }
  }

  for (const [dr, dc] of diagDirs) {
    for (let i = 1; i < 8; i++) {
      const nr = row + dr*i, nc = col + dc*i;
      if (!inBounds(nr, nc)) break;
      const piece = board[nr][nc];
      if (piece) {
        if (piece.color === byColor && (piece.type === PIECES.BISHOP || piece.type === PIECES.QUEEN))
          return true;
        break;
      }
    }
  }

  // Pawn attacks
  const pawnDir = byColor === COLORS.WHITE ? 1 : -1;
  for (const dc of [-1, 1]) {
    const nr = row + pawnDir, nc = col + dc;
    if (inBounds(nr, nc) && board[nr][nc]?.type === PIECES.PAWN && board[nr][nc]?.color === byColor)
      return true;
  }

  // King attacks
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr, nc = col + dc;
      if (inBounds(nr, nc) && board[nr][nc]?.type === PIECES.KING && board[nr][nc]?.color === byColor)
        return true;
    }
  }

  return false;
}

function isInCheck(board, color) {
  const king = findKing(board, color);
  if (!king) return false;
  const enemy = color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
  return isSquareAttacked(board, king.row, king.col, enemy);
}

// Generate pseudo-legal moves for a piece
function getPseudoMoves(state, row, col) {
  const { board, castling, enPassant } = state;
  const piece = board[row][col];
  if (!piece) return [];
  const moves = [];
  const color = piece.color;
  const enemy = color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;

  function addMove(tr, tc, special) {
    moves.push({ fromRow: row, fromCol: col, toRow: tr, toCol: tc, special });
  }

  switch (piece.type) {
    case PIECES.PAWN: {
      const dir = color === COLORS.WHITE ? -1 : 1;
      const startRow = color === COLORS.WHITE ? 6 : 1;
      const promoRow = color === COLORS.WHITE ? 0 : 7;

      // Forward
      if (inBounds(row + dir, col) && !board[row + dir][col]) {
        if (row + dir === promoRow) {
          ['Q','R','B','N'].forEach(p => addMove(row + dir, col, { type: 'promotion', piece: p }));
        } else {
          addMove(row + dir, col);
        }
        // Double forward
        if (row === startRow && !board[row + 2*dir][col]) {
          addMove(row + 2*dir, col, { type: 'double_pawn' });
        }
      }
      // Captures
      for (const dc of [-1, 1]) {
        const nr = row + dir, nc = col + dc;
        if (!inBounds(nr, nc)) continue;
        if (board[nr][nc] && board[nr][nc].color === enemy) {
          if (nr === promoRow) {
            ['Q','R','B','N'].forEach(p => addMove(nr, nc, { type: 'promotion', piece: p }));
          } else {
            addMove(nr, nc);
          }
        }
        // En passant
        if (enPassant && enPassant.row === nr && enPassant.col === nc) {
          addMove(nr, nc, { type: 'en_passant' });
        }
      }
      break;
    }
    case PIECES.KNIGHT: {
      const knightMoves = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
      for (const [dr, dc] of knightMoves) {
        const nr = row + dr, nc = col + dc;
        if (inBounds(nr, nc) && (!board[nr][nc] || board[nr][nc].color === enemy))
          addMove(nr, nc);
      }
      break;
    }
    case PIECES.BISHOP: {
      for (const [dr, dc] of [[1,1],[1,-1],[-1,1],[-1,-1]]) {
        for (let i = 1; i < 8; i++) {
          const nr = row + dr*i, nc = col + dc*i;
          if (!inBounds(nr, nc)) break;
          if (!board[nr][nc]) { addMove(nr, nc); continue; }
          if (board[nr][nc].color === enemy) addMove(nr, nc);
          break;
        }
      }
      break;
    }
    case PIECES.ROOK: {
      for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
        for (let i = 1; i < 8; i++) {
          const nr = row + dr*i, nc = col + dc*i;
          if (!inBounds(nr, nc)) break;
          if (!board[nr][nc]) { addMove(nr, nc); continue; }
          if (board[nr][nc].color === enemy) addMove(nr, nc);
          break;
        }
      }
      break;
    }
    case PIECES.QUEEN: {
      for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]) {
        for (let i = 1; i < 8; i++) {
          const nr = row + dr*i, nc = col + dc*i;
          if (!inBounds(nr, nc)) break;
          if (!board[nr][nc]) { addMove(nr, nc); continue; }
          if (board[nr][nc].color === enemy) addMove(nr, nc);
          break;
        }
      }
      break;
    }
    case PIECES.KING: {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = row + dr, nc = col + dc;
          if (inBounds(nr, nc) && (!board[nr][nc] || board[nr][nc].color === enemy))
            addMove(nr, nc);
        }
      }
      // Castling
      const ksKey = color === COLORS.WHITE ? 'wK' : 'bK';
      const qsKey = color === COLORS.WHITE ? 'wQ' : 'bQ';
      const castleRow = color === COLORS.WHITE ? 7 : 0;
      if (castling[ksKey] && row === castleRow && col === 4) {
        if (!board[castleRow][5] && !board[castleRow][6] &&
            board[castleRow][7]?.type === PIECES.ROOK && board[castleRow][7]?.color === color) {
          if (!isSquareAttacked(board, castleRow, 4, enemy) &&
              !isSquareAttacked(board, castleRow, 5, enemy) &&
              !isSquareAttacked(board, castleRow, 6, enemy)) {
            addMove(castleRow, 6, { type: 'castle', side: 'K' });
          }
        }
      }
      if (castling[qsKey] && row === castleRow && col === 4) {
        if (!board[castleRow][3] && !board[castleRow][2] && !board[castleRow][1] &&
            board[castleRow][0]?.type === PIECES.ROOK && board[castleRow][0]?.color === color) {
          if (!isSquareAttacked(board, castleRow, 4, enemy) &&
              !isSquareAttacked(board, castleRow, 3, enemy) &&
              !isSquareAttacked(board, castleRow, 2, enemy)) {
            addMove(castleRow, 2, { type: 'castle', side: 'Q' });
          }
        }
      }
      break;
    }
  }
  return moves;
}

// Apply move to state (mutates the provided state)
function applyMove(state, move) {
  const { board, castling } = state;
  const piece = board[move.fromRow][move.fromCol];
  const captured = board[move.toRow][move.toCol];
  const color = piece.color;
  const enemy = color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;

  // Record move
  const moveRecord = {
    ...move,
    piece: piece.type,
    color: color,
    captured: captured ? captured.type : null,
    notation: '',
  };

  // Handle captures
  if (captured) {
    state.capturedPieces[enemy].push(captured.type);
  }

  // Move piece
  board[move.toRow][move.toCol] = { ...piece };
  board[move.fromRow][move.fromCol] = null;

  // Special moves
  if (move.special) {
    switch (move.special.type) {
      case 'en_passant': {
        const capturedRow = color === COLORS.WHITE ? move.toRow + 1 : move.toRow - 1;
        state.capturedPieces[enemy].push(PIECES.PAWN);
        board[capturedRow][move.toCol] = null;
        moveRecord.captured = PIECES.PAWN;
        break;
      }
      case 'castle': {
        const castleRow = move.toRow;
        if (move.special.side === 'K') {
          board[castleRow][5] = board[castleRow][7];
          board[castleRow][7] = null;
        } else {
          board[castleRow][3] = board[castleRow][0];
          board[castleRow][0] = null;
        }
        break;
      }
      case 'promotion': {
        board[move.toRow][move.toCol] = { type: move.special.piece, color };
        break;
      }
      case 'double_pawn': {
        state.enPassant = {
          row: color === COLORS.WHITE ? move.fromRow - 1 : move.fromRow + 1,
          col: move.fromCol,
        };
        break;
      }
    }
  }

  if (!move.special || move.special.type !== 'double_pawn') {
    state.enPassant = null;
  }

  // Update castling rights
  if (piece.type === PIECES.KING) {
    if (color === COLORS.WHITE) { castling.wK = false; castling.wQ = false; }
    else { castling.bK = false; castling.bQ = false; }
  }
  if (piece.type === PIECES.ROOK) {
    if (color === COLORS.WHITE) {
      if (move.fromRow === 7 && move.fromCol === 0) castling.wQ = false;
      if (move.fromRow === 7 && move.fromCol === 7) castling.wK = false;
    } else {
      if (move.fromRow === 0 && move.fromCol === 0) castling.bQ = false;
      if (move.fromRow === 0 && move.fromCol === 7) castling.bK = false;
    }
  }
  // If rook captured
  if (move.toRow === 0 && move.toCol === 0) castling.bQ = false;
  if (move.toRow === 0 && move.toCol === 7) castling.bK = false;
  if (move.toRow === 7 && move.toCol === 0) castling.wQ = false;
  if (move.toRow === 7 && move.toCol === 7) castling.wK = false;

  // Half-move clock
  if (piece.type === PIECES.PAWN || captured) state.halfMoves = 0;
  else state.halfMoves++;

  if (color === COLORS.BLACK) state.fullMoves++;

  // Generate notation
  moveRecord.notation = generateNotation(state, moveRecord, move);

  state.moveHistory.push(moveRecord);
  state.lastMove = { fromRow: move.fromRow, fromCol: move.fromCol, toRow: move.toRow, toCol: move.toCol };

  // Switch turn
  state.turn = enemy;

  // Check game status
  state.isCheck = isInCheck(board, enemy);
  const legalMoves = getAllLegalMoves(state);
  if (legalMoves.length === 0) {
    state.gameOver = true;
    if (state.isCheck) {
      state.isCheckmate = true;
      state.winner = color;
    } else {
      state.isStalemate = true;
      state.isDraw = true;
    }
  }

  // 50-move rule
  if (state.halfMoves >= 100) {
    state.gameOver = true;
    state.isDraw = true;
  }

  // Store position for repetition
  state.positionHistory.push(boardToString(board));
  // Threefold repetition
  const posStr = boardToString(board);
  const count = state.positionHistory.filter(p => p === posStr).length;
  if (count >= 3) {
    state.gameOver = true;
    state.isDraw = true;
  }

  return state;
}

function boardToString(board) {
  return board.map(row => row.map(c => c ? c.color + c.type : '--').join('')).join('|');
}

function generateNotation(state, record, move) {
  if (move.special?.type === 'castle') {
    return move.special.side === 'K' ? 'O-O' : 'O-O-O';
  }
  const cols = 'abcdefgh';
  let n = '';
  if (record.piece !== PIECES.PAWN) n += record.piece;
  else if (record.captured) n += cols[move.fromCol];
  if (record.captured) n += 'x';
  n += cols[move.toCol] + (8 - move.toRow);
  if (move.special?.type === 'promotion') n += '=' + move.special.piece;
  if (state.isCheckmate) n += '#';
  else if (isInCheck(state.board, state.turn === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE)) n += '+';
  return n;
}

function getLegalMoves(state, row, col) {
  const piece = state.board[row][col];
  if (!piece || piece.color !== state.turn) return [];

  const pseudoMoves = getPseudoMoves(state, row, col);
  return pseudoMoves.filter(move => {
    const testState = cloneState(state);
    const testPiece = testState.board[move.fromRow][move.fromCol];
    testState.board[move.toRow][move.toCol] = testPiece;
    testState.board[move.fromRow][move.fromCol] = null;

    if (move.special?.type === 'en_passant') {
      const capturedRow = testPiece.color === COLORS.WHITE ? move.toRow + 1 : move.toRow - 1;
      testState.board[capturedRow][move.toCol] = null;
    }
    if (move.special?.type === 'castle') {
      const castleRow = move.toRow;
      if (move.special.side === 'K') {
        testState.board[castleRow][5] = testState.board[castleRow][7];
        testState.board[castleRow][7] = null;
      } else {
        testState.board[castleRow][3] = testState.board[castleRow][0];
        testState.board[castleRow][0] = null;
      }
    }

    return !isInCheck(testState.board, piece.color);
  });
}

function getAllLegalMoves(state) {
  const moves = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (state.board[r][c]?.color === state.turn)
        moves.push(...getLegalMoves(state, r, c));
  return moves;
}

// ============================================================
// AI Engine (Minimax with Alpha-Beta Pruning)
// ============================================================

const PIECE_VALUES = {
  [PIECES.PAWN]: 100,
  [PIECES.KNIGHT]: 320,
  [PIECES.BISHOP]: 330,
  [PIECES.ROOK]: 500,
  [PIECES.QUEEN]: 900,
  [PIECES.KING]: 20000,
};

// Piece-square tables for positional evaluation
const PST_PAWN = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0],
];

const PST_KNIGHT = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50],
];

const PST_BISHOP = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20],
];

const PST_ROOK = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  5,  5,  0,  0,  0],
];

const PST_QUEEN = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [-5,  0,  5,  5,  5,  5,  0, -5],
  [0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20],
];

const PST_KING_MID = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [20, 20,  0,  0,  0,  0, 20, 20],
  [20, 30, 10,  0,  0, 10, 30, 20],
];

const PST = {
  [PIECES.PAWN]: PST_PAWN,
  [PIECES.KNIGHT]: PST_KNIGHT,
  [PIECES.BISHOP]: PST_BISHOP,
  [PIECES.ROOK]: PST_ROOK,
  [PIECES.QUEEN]: PST_QUEEN,
  [PIECES.KING]: PST_KING_MID,
};

function evaluateBoard(state) {
  if (state.isCheckmate) {
    return state.winner === COLORS.WHITE ? 100000 : -100000;
  }
  if (state.isDraw || state.isStalemate) return 0;

  let score = 0;
  const { board } = state;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const val = PIECE_VALUES[piece.type];
      const pst = PST[piece.type];
      const pstRow = piece.color === COLORS.WHITE ? r : 7 - r;
      const pstVal = pst ? pst[pstRow][c] : 0;
      if (piece.color === COLORS.WHITE) {
        score += val + pstVal;
      } else {
        score -= val + pstVal;
      }
    }
  }

  // Mobility bonus
  const savedTurn = state.turn;
  state.turn = COLORS.WHITE;
  const whiteMoves = getAllLegalMoves(state).length;
  state.turn = COLORS.BLACK;
  const blackMoves = getAllLegalMoves(state).length;
  state.turn = savedTurn;
  score += (whiteMoves - blackMoves) * 5;

  return score;
}

function orderMoves(state, moves) {
  return moves.sort((a, b) => {
    let scoreA = 0, scoreB = 0;
    const capA = state.board[a.toRow]?.[a.toCol];
    const capB = state.board[b.toRow]?.[b.toCol];
    if (capA) scoreA += PIECE_VALUES[capA.type] - PIECE_VALUES[state.board[a.fromRow][a.fromCol].type] / 10;
    if (capB) scoreB += PIECE_VALUES[capB.type] - PIECE_VALUES[state.board[b.fromRow][b.fromCol].type] / 10;
    if (a.special?.type === 'promotion') scoreA += 800;
    if (b.special?.type === 'promotion') scoreB += 800;
    return scoreB - scoreA;
  });
}

function minimax(state, depth, alpha, beta, maximizing) {
  if (depth === 0 || state.gameOver) {
    return evaluateBoard(state);
  }

  const moves = orderMoves(state, getAllLegalMoves(state));
  if (moves.length === 0) return evaluateBoard(state);

  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newState = cloneState(state);
      applyMove(newState, move);
      const eval_ = minimax(newState, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, eval_);
      alpha = Math.max(alpha, eval_);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newState = cloneState(state);
      applyMove(newState, move);
      const eval_ = minimax(newState, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function getAIMove(state, difficulty = 'medium') {
  const depthMap = { easy: 1, medium: 3, hard: 4 };
  const depth = depthMap[difficulty] || 3;
  const isMaximizing = state.turn === COLORS.WHITE;
  const moves = getAllLegalMoves(state);
  if (moves.length === 0) return null;

  // Easy: some randomness
  if (difficulty === 'easy' && Math.random() < 0.3) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  let bestMove = null;
  let bestEval = isMaximizing ? -Infinity : Infinity;

  for (const move of orderMoves(state, moves)) {
    const newState = cloneState(state);
    applyMove(newState, move);
    const eval_ = minimax(newState, depth - 1, -Infinity, Infinity, !isMaximizing);

    if (isMaximizing) {
      if (eval_ > bestEval) { bestEval = eval_; bestMove = move; }
    } else {
      if (eval_ < bestEval) { bestEval = eval_; bestMove = move; }
    }
  }

  return bestMove;
}

// Utility exports
const COL_NAMES = ['a','b','c','d','e','f','g','h'];
function squareName(row, col) {
  return COL_NAMES[col] + (8 - row);
}

export {
  PIECES, COLORS,
  createGameState, cloneState,
  getLegalMoves, getAllLegalMoves,
  applyMove, isInCheck,
  getAIMove, evaluateBoard,
  squareName, COL_NAMES,
};

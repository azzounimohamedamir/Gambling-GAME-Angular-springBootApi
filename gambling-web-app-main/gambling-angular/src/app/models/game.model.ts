export interface PlayGameRequest {
  guess: string;
  betAmount: number;
}

export interface GameResult {
  id: number;
  guess: string;
  correctNumber: string;
  correctPositions: number;
  betAmount: number;
  winAmount: number;
  isWin: boolean;
  timestamp: Date;
}

export interface GameHistory {
  id: number;
  guess: string;
  correctNumber: string;
  correctPositions: number;
  betAmount: number;
  winAmount: number;
  isWin: boolean;
  timestamp: Date;
}

export interface GameStatistics {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  totalWinnings: number;
  totalBets: number;
  netProfit: number;
  averageCorrectPositions: number;
}
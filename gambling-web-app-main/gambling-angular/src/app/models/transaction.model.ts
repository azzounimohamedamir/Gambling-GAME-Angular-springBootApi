export interface DepositRequest {
  amount: number;
}

export interface WithdrawRequest {
  amount: number;
}

export interface TransferRequest {
  recipientUsername: string;
  amount: number;
}

export interface TransactionResponse {
  success: boolean;
  message: string;
  newBalance: number;
}
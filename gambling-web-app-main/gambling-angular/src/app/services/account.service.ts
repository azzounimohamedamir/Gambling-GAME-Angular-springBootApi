import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  DepositRequest, 
  WithdrawRequest, 
  TransferRequest, 
  TransactionResponse 
} from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'http://localhost:7777/api/account';

  constructor(private http: HttpClient) {}

  deposit(request: DepositRequest): Observable<TransactionResponse> {
    return this.http.post<TransactionResponse>(`${this.apiUrl}/deposit`, request);
  }

  withdraw(request: WithdrawRequest): Observable<TransactionResponse> {
    return this.http.post<TransactionResponse>(`${this.apiUrl}/withdraw`, request);
  }

  transfer(request: TransferRequest): Observable<TransactionResponse> {
    return this.http.post<TransactionResponse>(`${this.apiUrl}/transfer`, request);
  }
}
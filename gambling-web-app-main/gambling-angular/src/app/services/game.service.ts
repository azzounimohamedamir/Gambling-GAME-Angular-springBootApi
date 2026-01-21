import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlayGameRequest, GameResult, GameStatistics, GameHistory } from '../models/game.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost:7777/api/games';

  constructor(private http: HttpClient) {}

  playGame(request: PlayGameRequest): Observable<GameResult> {
    return this.http.post<GameResult>(`${this.apiUrl}/play`, request);
  }

  getGameHistory(): Observable<GameHistory[]> {
    return this.http.get<GameHistory[]>(`${this.apiUrl}/history/all`);
  }

  getStatistics(): Observable<GameStatistics> {
    return this.http.get<GameStatistics>(`${this.apiUrl}/statistics`);
  }
}
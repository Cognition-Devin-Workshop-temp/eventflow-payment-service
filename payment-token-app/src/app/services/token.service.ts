import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TokenizedAccount {
  token_id: string;
  masked_account: string;
  masked_routing: string;
  customer_id: string;
  created_at: string;
  is_active: boolean;
}

export interface TokenizeRequest {
  account_number: string;
  routing_number: string;
  customer_id: string;
}

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  tokenizeAccount(request: TokenizeRequest): Observable<TokenizedAccount> {
    return this.http.post<TokenizedAccount>(`${this.baseUrl}/tokens`, request);
  }

  getTokens(customerId: string): Observable<TokenizedAccount[]> {
    return this.http.get<TokenizedAccount[]>(
      `${this.baseUrl}/tokens?customer_id=${encodeURIComponent(customerId)}`
    );
  }
}

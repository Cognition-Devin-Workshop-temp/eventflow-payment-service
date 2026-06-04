import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TokenizedAccount {
  token_id: string;
  masked_account: string;
  masked_routing: string;
  customer_id: string;
  created_at: string;
  is_active: boolean;
}

@Injectable({ providedIn: 'root' })
export class TokenService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  tokenizeAccount(
    accountNumber: string,
    routingNumber: string,
    customerId: string
  ): Observable<TokenizedAccount> {
    return this.http.post<TokenizedAccount>(`${this.apiUrl}/tokens`, {
      account_number: accountNumber,
      routing_number: routingNumber,
      customer_id: customerId
    });
  }

  getTokens(customerId: string): Observable<TokenizedAccount[]> {
    return this.http.get<TokenizedAccount[]>(
      `${this.apiUrl}/tokens?customer_id=${encodeURIComponent(customerId)}`
    );
  }
}

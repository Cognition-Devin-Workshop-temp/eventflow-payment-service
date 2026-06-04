import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private readonly baseUrl = '/api/tokens';

  constructor(private http: HttpClient) {}

  tokenizeAccount(
    accountNumber: string,
    routingNumber: string,
    customerId: string
  ): Observable<TokenizedAccount> {
    return this.http.post<TokenizedAccount>(this.baseUrl, {
      account_number: accountNumber,
      routing_number: routingNumber,
      customer_id: customerId,
    });
  }

  getTokens(customerId: string): Observable<TokenizedAccount[]> {
    const params = new HttpParams().set('customer_id', customerId);
    return this.http.get<TokenizedAccount[]>(this.baseUrl, { params });
  }
}

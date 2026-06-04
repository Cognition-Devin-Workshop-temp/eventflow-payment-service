import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TokenService, TokenizedAccount } from '../../services/token.service';

@Component({
  selector: 'app-token-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatCardModule],
  templateUrl: './token-list.component.html',
  styleUrl: './token-list.component.scss',
})
export class TokenListComponent implements OnChanges {
  @Input() customerId = '';
  @Input() refreshKey = 0;
  @Output() tokenSelected = new EventEmitter<TokenizedAccount>();

  displayedColumns = ['token_id', 'masked_account', 'masked_routing', 'created_at', 'is_active', 'actions'];
  tokens: TokenizedAccount[] = [];

  constructor(private tokenService: TokenService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['customerId'] || changes['refreshKey']) && this.customerId) {
      this.loadTokens();
    }
  }

  loadTokens(): void {
    if (!this.customerId) return;
    this.tokenService.getTokens(this.customerId).subscribe({
      next: (tokens) => (this.tokens = tokens),
    });
  }

  useToken(token: TokenizedAccount): void {
    this.tokenSelected.emit(token);
  }
}

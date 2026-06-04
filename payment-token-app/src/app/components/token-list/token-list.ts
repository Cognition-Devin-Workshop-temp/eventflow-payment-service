import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TokenService, TokenizedAccount } from '../../services/token.service';

@Component({
  selector: 'app-token-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './token-list.html',
  styleUrl: './token-list.scss',
})
export class TokenListComponent implements OnChanges {
  @Input() customerId = '';
  @Input() refreshTrigger = 0;
  @Output() tokenSelected = new EventEmitter<TokenizedAccount>();

  tokens: TokenizedAccount[] = [];
  displayedColumns = ['token_id', 'masked_account', 'masked_routing', 'created_at', 'is_active', 'actions'];

  constructor(private tokenService: TokenService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.customerId) {
      this.loadTokens();
    }
  }

  loadTokens(): void {
    this.tokenService.getTokens(this.customerId).subscribe({
      next: (tokens) => (this.tokens = tokens),
      error: () => (this.tokens = []),
    });
  }

  selectToken(token: TokenizedAccount): void {
    this.tokenSelected.emit(token);
  }
}

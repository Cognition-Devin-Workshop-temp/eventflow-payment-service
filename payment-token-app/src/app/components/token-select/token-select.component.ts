import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TokenizedAccount } from '../../services/token.service';

@Component({
  selector: 'app-token-select',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="selected-card">
      <mat-card-header>
        <mat-card-title>Selected Payment Method</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        @if (token) {
          <div class="token-details">
            <p><strong>Token ID:</strong> {{ token.token_id }}</p>
            <p><strong>Account:</strong> {{ token.masked_account }}</p>
            <p><strong>Routing:</strong> {{ token.masked_routing }}</p>
            <p><strong>Status:</strong> {{ token.is_active ? 'Active' : 'Inactive' }}</p>
            <p class="confirmation">
              <mat-icon>check_circle</mat-icon>
              This token will be used for the transaction.
            </p>
          </div>
        } @else {
          <p class="empty-state">No payment method selected. Choose one from the list above.</p>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .selected-card { margin-top: 16px; }
    .token-details p { margin: 4px 0; }
    .confirmation { color: #4caf50; display: flex; align-items: center; gap: 8px; margin-top: 12px; }
    .empty-state { color: #666; font-style: italic; }
  `]
})
export class TokenSelectComponent {
  @Input() token: TokenizedAccount | null = null;
  @Output() tokenConfirmed = new EventEmitter<string>();
}

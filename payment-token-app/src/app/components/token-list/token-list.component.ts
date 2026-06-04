import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { TokenService, TokenizedAccount } from '../../services/token.service';

@Component({
  selector: 'app-token-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>My Saved Payment Methods</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        @if (tokens.length === 0) {
          <p class="empty-state">No tokenized accounts yet. Use the form to tokenize an account.</p>
        } @else {
          <table mat-table [dataSource]="tokens" class="full-width">
            <ng-container matColumnDef="token_id">
              <th mat-header-cell *matHeaderCellDef>Token ID</th>
              <td mat-cell *matCellDef="let token">{{ token.token_id | slice:0:12 }}...</td>
            </ng-container>

            <ng-container matColumnDef="masked_account">
              <th mat-header-cell *matHeaderCellDef>Account</th>
              <td mat-cell *matCellDef="let token">{{ token.masked_account }}</td>
            </ng-container>

            <ng-container matColumnDef="masked_routing">
              <th mat-header-cell *matHeaderCellDef>Routing</th>
              <td mat-cell *matCellDef="let token">{{ token.masked_routing }}</td>
            </ng-container>

            <ng-container matColumnDef="created_at">
              <th mat-header-cell *matHeaderCellDef>Created</th>
              <td mat-cell *matCellDef="let token">{{ token.created_at | date:'short' }}</td>
            </ng-container>

            <ng-container matColumnDef="is_active">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let token">
                <mat-chip [highlighted]="token.is_active">{{ token.is_active ? 'Active' : 'Inactive' }}</mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let token">
                <button mat-stroked-button color="primary" (click)="selectToken(token)">
                  Use This Token
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .full-width { width: 100%; }
    .empty-state { color: #666; font-style: italic; padding: 16px 0; }
  `]
})
export class TokenListComponent implements OnInit, OnChanges {
  @Input() customerId = '';
  @Input() refreshTrigger = 0;
  @Output() tokenSelected = new EventEmitter<TokenizedAccount>();

  tokens: TokenizedAccount[] = [];
  displayedColumns = ['token_id', 'masked_account', 'masked_routing', 'created_at', 'is_active', 'actions'];

  constructor(private tokenService: TokenService) {}

  ngOnInit(): void {
    this.loadTokens();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customerId'] || changes['refreshTrigger']) {
      this.loadTokens();
    }
  }

  loadTokens(): void {
    if (!this.customerId) {
      this.tokens = [];
      return;
    }
    this.tokenService.getTokens(this.customerId).subscribe({
      next: (tokens) => this.tokens = tokens,
      error: () => this.tokens = []
    });
  }

  selectToken(token: TokenizedAccount): void {
    this.tokenSelected.emit(token);
  }
}

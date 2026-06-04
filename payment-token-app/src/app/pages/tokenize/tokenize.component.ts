import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TokenFormComponent } from '../../components/token-form/token-form.component';
import { TokenListComponent } from '../../components/token-list/token-list.component';
import { TokenSelectComponent } from '../../components/token-select/token-select.component';
import { TokenizedAccount } from '../../services/token.service';

@Component({
  selector: 'app-tokenize',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    TokenFormComponent,
    TokenListComponent,
    TokenSelectComponent
  ],
  template: `
    <div class="page-container">
      <h1>Payment Tokenization</h1>

      <mat-form-field appearance="outline" class="customer-input">
        <mat-label>Customer ID (for listing tokens)</mat-label>
        <input matInput [(ngModel)]="customerId" placeholder="Enter customer ID to view tokens">
      </mat-form-field>

      <div class="layout">
        <div class="left-panel">
          <app-token-form (tokenCreated)="onTokenCreated($event)"></app-token-form>
        </div>
        <div class="right-panel">
          <app-token-list
            [customerId]="customerId"
            [refreshTrigger]="refreshCounter"
            (tokenSelected)="onTokenSelected($event)">
          </app-token-list>
        </div>
      </div>

      <app-token-select [token]="selectedToken"></app-token-select>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    h1 { margin-bottom: 16px; }
    .customer-input { width: 100%; margin-bottom: 16px; }
    .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    @media (max-width: 768px) {
      .layout { grid-template-columns: 1fr; }
    }
  `]
})
export class TokenizeComponent {
  customerId = '';
  refreshCounter = 0;
  selectedToken: TokenizedAccount | null = null;

  onTokenCreated(customerId: string): void {
    this.customerId = customerId;
    this.refreshCounter++;
  }

  onTokenSelected(token: TokenizedAccount): void {
    this.selectedToken = token;
  }
}

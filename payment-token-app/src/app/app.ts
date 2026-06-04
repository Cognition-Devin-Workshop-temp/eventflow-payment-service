import { Component } from '@angular/core';
import { TokenFormComponent } from './components/token-form/token-form';
import { TokenListComponent } from './components/token-list/token-list';
import { TokenSelectComponent } from './components/token-select/token-select';
import { TokenizedAccount } from './services/token.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TokenFormComponent, TokenListComponent, TokenSelectComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  customerId = '';
  refreshTrigger = 0;
  selectedToken: TokenizedAccount | null = null;

  onTokenCreated(token: TokenizedAccount): void {
    this.customerId = token.customer_id;
    this.refreshTrigger++;
  }

  onTokenSelected(token: TokenizedAccount): void {
    this.selectedToken = token;
  }
}

import { Component } from '@angular/core';
import { TokenFormComponent } from './components/token-form/token-form.component';
import { TokenListComponent } from './components/token-list/token-list.component';
import { TokenSelectComponent } from './components/token-select/token-select.component';
import { TokenizedAccount } from './services/token.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TokenFormComponent, TokenListComponent, TokenSelectComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  currentCustomerId = '';
  selectedToken: TokenizedAccount | null = null;
  refreshKey = 0;

  onTokenCreated(customerId: string): void {
    this.currentCustomerId = customerId;
    this.refreshKey++;
  }

  onTokenSelected(token: TokenizedAccount): void {
    this.selectedToken = token;
  }
}

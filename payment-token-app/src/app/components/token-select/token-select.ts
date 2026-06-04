import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TokenizedAccount } from '../../services/token.service';

@Component({
  selector: 'app-token-select',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './token-select.html',
  styleUrl: './token-select.scss',
})
export class TokenSelectComponent {
  @Input() selectedToken: TokenizedAccount | null = null;
}

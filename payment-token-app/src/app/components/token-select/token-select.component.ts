import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { TokenizedAccount } from '../../services/token.service';

@Component({
  selector: 'app-token-select',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './token-select.component.html',
  styleUrl: './token-select.component.scss',
})
export class TokenSelectComponent {
  @Input() token: TokenizedAccount | null = null;
}

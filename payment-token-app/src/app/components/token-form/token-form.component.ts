import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-token-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
  ],
  templateUrl: './token-form.component.html',
  styleUrl: './token-form.component.scss',
})
export class TokenFormComponent {
  @Output() tokenCreated = new EventEmitter<string>();

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private tokenService: TokenService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      accountNumber: ['', [Validators.required, Validators.pattern(/^\d{8,17}$/)]],
      routingNumber: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      customerId: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    const { accountNumber, routingNumber, customerId } = this.form.value;
    this.tokenService.tokenizeAccount(accountNumber, routingNumber, customerId).subscribe({
      next: (token) => {
        this.snackBar.open(`Token created: ${token.token_id}`, 'Close', { duration: 5000 });
        this.tokenCreated.emit(customerId);
        this.form.reset();
      },
      error: () => {
        this.snackBar.open('Failed to tokenize account', 'Close', { duration: 5000 });
      },
    });
  }
}

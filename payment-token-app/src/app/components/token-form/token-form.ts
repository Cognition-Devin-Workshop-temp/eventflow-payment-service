import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TokenService, TokenizedAccount } from '../../services/token.service';

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
  templateUrl: './token-form.html',
  styleUrl: './token-form.scss',
})
export class TokenFormComponent {
  @Output() tokenCreated = new EventEmitter<TokenizedAccount>();

  form: FormGroup;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private tokenService: TokenService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      account_number: [
        '',
        [Validators.required, Validators.pattern(/^\d{8,17}$/)],
      ],
      routing_number: [
        '',
        [Validators.required, Validators.pattern(/^\d{9}$/)],
      ],
      customer_id: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting = true;
    this.tokenService.tokenizeAccount(this.form.value).subscribe({
      next: (token) => {
        this.snackBar.open(
          `Account tokenized! Token ID: ${token.token_id}`,
          'Close',
          { duration: 5000 }
        );
        this.tokenCreated.emit(token);
        this.submitting = false;
      },
      error: (err) => {
        this.snackBar.open(
          `Error: ${err.error?.detail || err.message}`,
          'Close',
          { duration: 5000 }
        );
        this.submitting = false;
      },
    });
  }
}

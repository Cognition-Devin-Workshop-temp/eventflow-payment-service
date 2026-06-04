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
    MatSnackBarModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Tokenize New Account</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Account Number</mat-label>
            <input matInput formControlName="accountNumber" placeholder="Enter account number">
            @if (form.get('accountNumber')?.hasError('required') && form.get('accountNumber')?.touched) {
              <mat-error>Account number is required</mat-error>
            }
            @if (form.get('accountNumber')?.hasError('pattern') && form.get('accountNumber')?.touched) {
              <mat-error>Must be numeric only</mat-error>
            }
            @if ((form.get('accountNumber')?.hasError('minlength') || form.get('accountNumber')?.hasError('maxlength')) && form.get('accountNumber')?.touched) {
              <mat-error>Must be 8-17 digits</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Routing Number</mat-label>
            <input matInput formControlName="routingNumber" placeholder="Enter routing number">
            @if (form.get('routingNumber')?.hasError('required') && form.get('routingNumber')?.touched) {
              <mat-error>Routing number is required</mat-error>
            }
            @if (form.get('routingNumber')?.hasError('pattern') && form.get('routingNumber')?.touched) {
              <mat-error>Must be numeric only</mat-error>
            }
            @if ((form.get('routingNumber')?.hasError('minlength') || form.get('routingNumber')?.hasError('maxlength')) && form.get('routingNumber')?.touched) {
              <mat-error>Must be exactly 9 digits</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Customer ID</mat-label>
            <input matInput formControlName="customerId" placeholder="Enter customer ID">
            @if (form.get('customerId')?.hasError('required') && form.get('customerId')?.touched) {
              <mat-error>Customer ID is required</mat-error>
            }
          </mat-form-field>

          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || isSubmitting">
            {{ isSubmitting ? 'Tokenizing...' : 'Tokenize Account' }}
          </button>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 8px; }
    button { margin-top: 8px; }
  `]
})
export class TokenFormComponent {
  @Output() tokenCreated = new EventEmitter<string>();

  form: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private tokenService: TokenService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      accountNumber: ['', [
        Validators.required,
        Validators.pattern(/^\d+$/),
        Validators.minLength(8),
        Validators.maxLength(17)
      ]],
      routingNumber: ['', [
        Validators.required,
        Validators.pattern(/^\d+$/),
        Validators.minLength(9),
        Validators.maxLength(9)
      ]],
      customerId: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting = true;
    const { accountNumber, routingNumber, customerId } = this.form.value;

    this.tokenService.tokenizeAccount(accountNumber, routingNumber, customerId).subscribe({
      next: (result) => {
        this.snackBar.open(`Token created: ${result.token_id}`, 'Close', { duration: 5000 });
        this.tokenCreated.emit(customerId);
        this.form.reset();
        this.isSubmitting = false;
      },
      error: (err) => {
        this.snackBar.open('Error creating token: ' + (err.error?.detail || err.message), 'Close', { duration: 5000 });
        this.isSubmitting = false;
      }
    });
  }
}

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule],
  template: `
    <mat-toolbar color="primary">
      <span>EventFlow Payment Tokenization</span>
    </mat-toolbar>
    <router-outlet />
  `,
  styles: [`
    mat-toolbar { margin-bottom: 0; }
  `]
})
export class App {}

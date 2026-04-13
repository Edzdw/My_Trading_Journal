import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ToastComponent } from './shared/components/app-toast/app-toast-component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {}

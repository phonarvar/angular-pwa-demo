import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  visible = false;
  message = '';
  type: 'success' | 'error' = 'success';

  show(message: string, type: 'success' | 'error' = 'success') {
    this.message = message;
    this.type = type;
    this.visible = true;

    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.visible = false;
    }, 3000);
  }
}

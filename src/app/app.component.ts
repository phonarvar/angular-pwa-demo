import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NetworkServiceService } from './services/network-service.service';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './components/toast/toast.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  readonly title = 'angular-pwa-demo';
  @ViewChild('toast', { static: true }) toast!: ToastComponent; 

  private networkSubscription!: Subscription;
  private deferredPrompt: any | any  = null; // stores install event
  canInstall = false; // whether to show install button
  online = false; // initial online status

  constructor(private readonly networkService: NetworkServiceService) {
    // listen for install prompt
    window.addEventListener('beforeinstallprompt', (event: Event) => {
      event.preventDefault(); // prevent default mini-infobar so we can trigger it with a button
      this.deferredPrompt = event; // store the event
      this.canInstall = true; // show install button
    });

    // log when app is installed
    window.addEventListener('appinstalled', () => {
      if (this.toast) {
        this.toast.show('🎉 PWA installed successfully!', 'success');
      }
    });
  }

  ngOnInit(): void {
    // Subscribe to the network status observable
    this.networkSubscription = this.networkService.online.subscribe(
      (status: boolean) => {
        this.online = status;

        // Show toast
        if (status) {
          this.toast?.show('✅ You are Online', 'success');
        } else {
          this.toast?.show('⚠️ You are Offline', 'error');
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.networkSubscription?.unsubscribe();
  }

  installApp() {
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt(); // show the browser install dialog
    this.deferredPrompt.userChoice.then(() => {
      this.deferredPrompt = null;
      this.canInstall = false;
    });
  }
}

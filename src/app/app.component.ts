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
  @ViewChild('toast', { static: true }) private toast!: ToastComponent;

  private networkSubscription!: Subscription;
  private deferredPrompt: any | any = null; // stores install event
  canInstall = false; // whether to show install button
  online = false; // initial online status
  private beforeInstallPromptListener: (e: Event) => void = () => {}; // For cleanup
  private appInstalledListener: () => void = () => {}; // For cleanup

  constructor(private readonly networkService: NetworkServiceService) {
    // Listen for install prompt
    this.beforeInstallPromptListener = (event: Event) => {
      event.preventDefault(); // prevent default mini-infobar so we can trigger it with a button
      this.deferredPrompt = event as any; // store the event
      this.canInstall = true; // show install button
    };

    window.addEventListener('beforeinstallprompt', this.beforeInstallPromptListener);

    // Show toast when PWA is installed
    this.appInstalledListener = () => {
      if (this.toast) {
        this.toast.show('🎉 PWA installed successfully!', 'success');
      }
    };
    
    window.addEventListener('appinstalled', this.appInstalledListener);
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
    window.removeEventListener('beforeinstallprompt', this.beforeInstallPromptListener);
    window.removeEventListener('appinstalled', this.appInstalledListener);
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

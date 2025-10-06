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
  private deferredPrompt: any = null; // stores install event
  canInstall = false; // whether to show install button
  online = false; // initial online status
  private beforeInstallPromptListener: (e: Event) => void = () => {}; // For cleanup
  private appInstalledListener: () => void = () => {}; // For cleanup

  constructor(private readonly networkService: NetworkServiceService) {}

  ngOnInit(): void {
    // Listen for install prompt
    this.beforeInstallPromptListener = (event: Event) => {
      event.preventDefault();
      this.deferredPrompt = event as any;
      this.canInstall = true;
    };
    window.addEventListener('beforeinstallprompt',this.beforeInstallPromptListener);

    // Show toast when PWA is installed
    this.appInstalledListener = () => {
      if (this.toast) {
        this.toast.show('🎉 PWA installed successfully!', 'success');
      }
    };
    window.addEventListener('appinstalled', this.appInstalledListener);

    // Subscribe to network status observable
    this.networkSubscription = this.networkService.online.subscribe(
      (status: boolean) => {
        this.online = status;
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
    window.removeEventListener('beforeinstallprompt',this.beforeInstallPromptListener);
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

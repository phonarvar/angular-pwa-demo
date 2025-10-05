import { Component, OnInit } from '@angular/core';
import { NetworkServiceService } from './services/network-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'angular-pwa-demo';

  deferredPrompt: any = null; // stores install event
  canInstall = false; // whether to show install button
  online = false; // initial online status

  constructor(private network: NetworkServiceService) {
    // listen for install prompt
    window.addEventListener('beforeinstallprompt', (event: Event) => {
      event.preventDefault(); // prevent default mini-infobar so we can trigger it with a button
      this.deferredPrompt = event; // store the event
      this.canInstall = true; // show button
    });

    // log when app is installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully!');
    });
  }

  ngOnInit(): void {
    // Subscribe to the network status observable
    this.network.online.subscribe((status: boolean) => {
      this.online = status;
    });
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

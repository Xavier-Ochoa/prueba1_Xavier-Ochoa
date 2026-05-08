import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonButton, IonIcon,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  AlertController, ToastController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { User } from '@supabase/supabase-js';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonButton, IonIcon,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent
  ]
})
export class ProfilePage implements OnInit, OnDestroy {
  usuario: User | null = null;
  private sub?: Subscription;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    addIcons({ logOutOutline });
  }

  ngOnInit() {
    this.sub = this.supabaseService.user$.subscribe(user => { this.usuario = user; });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  async confirmarLogout() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de que quieres salir?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Salir', role: 'destructive', handler: () => this.logout() }
      ]
    });
    await alert.present();
  }

  async logout() {
    await this.supabaseService.logout();
    const toast = await this.toastCtrl.create({ message: 'Sesión cerrada', duration: 2000, color: 'medium' });
    await toast.present();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}

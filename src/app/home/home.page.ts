import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons,
  IonIcon, IonCard, IonCardContent,
  IonList, IonItem, IonLabel, IonSpinner, AlertController, ToastController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { OpenLibraryService } from '../services/open-library.service';
import { User } from '@supabase/supabase-js';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  logOutOutline, libraryOutline, bookOutline, flaskOutline,
  timeOutline, bulbOutline, laptopOutline, alertCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons,
    IonIcon, IonCard, IonCardContent,
    IonList, IonItem, IonLabel, IonSpinner
  ]
})
export class HomePage implements OnInit, OnDestroy {
  usuario: User | null = null;
  librosPopulares: any[] = [];
  cargando = false;
  errorMsg = '';
  private sub?: Subscription;

  constructor(
    private supabaseService: SupabaseService,
    private openLibrary: OpenLibraryService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    addIcons({ logOutOutline, libraryOutline, bookOutline, flaskOutline, timeOutline, bulbOutline, laptopOutline, alertCircleOutline });
  }

  ngOnInit() {
    this.sub = this.supabaseService.user$.subscribe(user => { this.usuario = user; });
    this.cargarLibros();
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  async cargarLibros() {
    this.cargando = true;
    this.errorMsg = '';
    try {
      const result = await this.openLibrary.buscarLibros('popular books').toPromise();
      this.librosPopulares = result?.docs?.slice(0, 10) ?? [];
    } catch (e) {
      this.errorMsg = 'Error al cargar libros. Verifica tu conexión.';
    } finally {
      this.cargando = false;
    }
  }

  verDetalle(key: string) {
    const id = key.replace('/works/', '');
    this.router.navigateByUrl(`/tabs/book-detail/${id}`);
  }

  irCatalogo(categoria: string) {
    this.router.navigateByUrl(`/tabs/catalog?q=${categoria}`);
  }

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
    const toast = await this.toastCtrl.create({ message: 'Sesión cerrada.', duration: 2000, color: 'medium' });
    await toast.present();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}

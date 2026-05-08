import { Component, OnInit } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon, IonSpinner, IonButton, IonList, IonItem, IonLabel,
  IonChip, ModalController, ToastController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { OpenLibraryService } from '../../services/open-library.service';
import { addIcons } from 'ionicons';
import {
  bookOutline, calendarOutline, personOutline, alertCircleOutline,
  starOutline, libraryOutline, shareOutline, heartOutline, heartSharp
} from 'ionicons/icons';

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.page.html',
  styleUrls: ['./book-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon, IonSpinner, IonButton, IonList, IonItem, IonLabel,
    IonChip,
  ]
})
export class BookDetailPage implements OnInit {
  libro: any = null;
  cargando = true;
  errorMsg = '';
  favorito = false;

  constructor(
    private route: ActivatedRoute,
    private openLibrary: OpenLibraryService,
    private toastCtrl: ToastController
  ) {
    addIcons({ bookOutline, calendarOutline, personOutline, alertCircleOutline, starOutline, libraryOutline, shareOutline, heartOutline, heartSharp });
  }

  ngOnInit() {
    const workId = this.route.snapshot.paramMap.get('id');
    if (workId) this.cargarDetalle(workId);
  }

  cargarDetalle(workId: string) {
    this.cargando = true;
    this.errorMsg = '';
    this.openLibrary.obtenerDetalle(workId).subscribe({
      next: (data) => {
        this.libro = data;
        this.cargando = false;
      },
      error: () => {
        this.errorMsg = 'No se pudo cargar el detalle del libro.';
        this.cargando = false;
      }
    });
  }

  getDescripcion(): string {
    if (!this.libro?.description) return 'Sin descripción disponible.';
    if (typeof this.libro.description === 'string') return this.libro.description;
    return this.libro.description?.value ?? 'Sin descripción disponible.';
  }

  getPortada(): string {
    const covers = this.libro?.covers;
    if (covers && covers.length > 0) return this.openLibrary.obtenerPortada(covers[0], 'L');
    return 'assets/icon/favicon.png';
  }

  async toggleFavorito() {
    this.favorito = !this.favorito;
    const toast = await this.toastCtrl.create({
      message: this.favorito ? '¡Añadido a favoritos!' : 'Eliminado de favoritos',
      duration: 2000,
      color: this.favorito ? 'success' : 'medium',
      position: 'bottom'
    });
    await toast.present();
  }
}

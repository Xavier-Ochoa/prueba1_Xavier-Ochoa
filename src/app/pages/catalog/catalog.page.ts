import { Component, OnInit } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar,
  IonList, IonItem, IonLabel, IonSpinner, IonIcon, IonButton,
  IonThumbnail, ToastController
} from '@ionic/angular/standalone';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OpenLibraryService } from '../../services/open-library.service';
import { addIcons } from 'ionicons';

import {
  searchOutline,
  alertCircleOutline,
  bookOutline,
  closeCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.page.html',
  styleUrls: ['./catalog.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
    IonIcon,
    IonButton,
    IonThumbnail
  ]
})

export class CatalogPage implements OnInit {

  libros: any[] = [];
  cargando = false;
  errorMsg = '';
  terminoBusqueda = '';

  constructor(
    private openLibrary: OpenLibraryService,
    private router: Router,
    private route: ActivatedRoute,
    private toastCtrl: ToastController
  ) {

    addIcons({
      searchOutline,
      alertCircleOutline,
      bookOutline,
      closeCircleOutline
    });
  }

  ngOnInit() {

    this.route.queryParams.subscribe(params => {

      if (params['q']) {

        this.terminoBusqueda = params['q'];
        this.buscar();

      } else {

        this.buscar('the');
      }
    });
  }

  async buscar(override?: string) {

    const q = override ?? this.terminoBusqueda.trim();

    if (!q) return;

    this.cargando = true;
    this.errorMsg = '';
    this.libros = [];

    this.openLibrary.buscarLibros(q, 20).subscribe({

      next: (res) => {

        this.libros = res.docs ?? [];
        this.cargando = false;

        if (this.libros.length === 0) {
          this.errorMsg = 'No se encontraron resultados.';
        }
      },

      error: async () => {

        this.cargando = false;

        this.errorMsg =
          'Error al buscar. Verifica tu conexión.';

        const toast = await this.toastCtrl.create({
          message: 'Error de conexión con Open Library',
          duration: 3000,
          color: 'danger',
          position: 'bottom'
        });

        await toast.present();
      }
    });
  }

  verDetalle(key: string) {

    const id = key.replace('/works/', '');

    this.router.navigateByUrl(
      `/tabs/book-detail/${id}`
    );
  }

  getPortada(libro: any): string {

    if (libro.cover_i) {

      return this.openLibrary.obtenerPortada(
        libro.cover_i,
        'S'
      );
    }

    return 'assets/icon/favicon.png';
  }

  limpiarBusqueda() {

    this.terminoBusqueda = '';
    this.libros = [];
    this.errorMsg = '';
  }
}
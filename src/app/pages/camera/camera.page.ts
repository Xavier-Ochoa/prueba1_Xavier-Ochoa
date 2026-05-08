import { Component, OnInit } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonIcon, IonCard, IonCardContent,
  IonFab, IonFabButton, IonSpinner,
  ToastController, AlertController
} from '@ionic/angular/standalone';

import { CommonModule } from '@angular/common';
import { PhotoService } from '../../services/photo.service';
import { addIcons } from 'ionicons';
import { cameraOutline, imageOutline } from 'ionicons/icons';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.page.html',
  styleUrls: ['./camera.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonIcon, IonCard, IonCardContent,
    IonFab, IonFabButton, IonSpinner
  ]
})
export class CameraPage implements OnInit {

  tomando = false;
  ultimaFotoPath: string | undefined = undefined;

  constructor(
    public photoService: PhotoService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({ cameraOutline, imageOutline });
  }

  async ngOnInit() {
    // Carga las fotos guardadas para mostrar el contador y la última foto
    await this.photoService.loadSaved();

    if (this.photoService.photos.length > 0) {
      this.ultimaFotoPath = this.photoService.photos[0].webviewPath;
    }
  }

  async tomarFoto() {
    this.tomando = true;

    try {
      await this.photoService.addNewToGallery();

      this.ultimaFotoPath =
        this.photoService.photos[0]?.webviewPath;

      const toast = await this.toastCtrl.create({
        message: '📷 ¡Foto capturada y guardada!',
        duration: 2500,
        color: 'success',
        position: 'bottom'
      });

      await toast.present();

    } catch (e: any) {

      const msg = e?.message ?? '';

      if (!msg.toLowerCase().includes('cancel')) {

        const alert = await this.alertCtrl.create({
          header: 'Error de cámara',
          message: 'No se pudo acceder a la cámara. Verifica los permisos de la aplicación.',
          buttons: ['OK']
        });

        await alert.present();
      }

    } finally {
      this.tomando = false;
    }
  }

  get totalFotos(): number {
    return this.photoService.photos.length;
  }
}
import { Component, OnInit } from '@angular/core';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonIcon,
  IonModal,
  IonButtons,
  IonButton,
  IonText,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';

import { CommonModule } from '@angular/common';

import {
  PhotoService,
  UserPhoto
} from '../../services/photo.service';

import { addIcons } from 'ionicons';

import {
  imagesOutline,
  trashOutline,
  closeOutline,
  cameraOutline,
  alertCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.page.html',
  styleUrls: ['./gallery.page.scss'],
  standalone: true,

  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonImg,
    IonIcon,
    IonModal,
    IonButtons,
    IonButton,
    IonText
  ]
})

export class GalleryPage implements OnInit {

  fotoSeleccionada: UserPhoto | null = null;

  modalAbierto = false;

  constructor(
    public photoService: PhotoService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {

    addIcons({
      imagesOutline,
      trashOutline,
      closeOutline,
      cameraOutline,
      alertCircleOutline
    });
  }

  async ngOnInit() {

    await this.photoService.loadSaved();
  }

  // Abre el modal con la foto ampliada
  abrirFoto(foto: UserPhoto) {

    this.fotoSeleccionada = foto;
    this.modalAbierto = true;
  }

  cerrarModal() {

    this.modalAbierto = false;
    this.fotoSeleccionada = null;
  }

  // Confirmar y eliminar foto
  async confirmarEliminar(
    foto: UserPhoto,
    event?: Event
  ) {

    if (event) {
      event.stopPropagation();
    }

    const alert = await this.alertCtrl.create({

      header: 'Eliminar foto',

      message:
        '¿Seguro que quieres eliminar esta foto? No se puede deshacer.',

      buttons: [

        {
          text: 'Cancelar',
          role: 'cancel'
        },

        {
          text: 'Eliminar',
          role: 'destructive',

          handler: async () => {

            await this.photoService.deletePhoto(foto);

            if (
              this.fotoSeleccionada?.filepath ===
              foto.filepath
            ) {
              this.cerrarModal();
            }

            const toast =
              await this.toastCtrl.create({

                message: 'Foto eliminada',
                duration: 2000,
                color: 'medium',
                position: 'bottom'
              });

            await toast.present();
          }
        }
      ]
    });

    await alert.present();
  }

  get totalFotos(): number {

    return this.photoService.photos.length;
  }
}
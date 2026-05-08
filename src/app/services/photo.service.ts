import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Platform } from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
  fechaGuardado: string;
}

@Injectable({ providedIn: 'root' })
export class PhotoService {

  photos: UserPhoto[] = [];
  private readonly PHOTO_STORAGE_KEY = 'bookshelf_photos';

  constructor(private platform: Platform) {}

  // ─── Cargar fotos guardadas al iniciar ───────────────────────────
  async loadSaved(): Promise<void> {
    const { value } = await Preferences.get({ key: this.PHOTO_STORAGE_KEY });
    const fotosGuardadas: UserPhoto[] = value ? JSON.parse(value) : [];

    // En web: los datos están como base64 en el sistema de archivos
    if (!this.platform.is('hybrid')) {
      for (const foto of fotosGuardadas) {
        try {
          const readFile = await Filesystem.readFile({
            path: foto.filepath,
            directory: Directory.Data
          });
          foto.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
        } catch {
          // Si no se puede leer, se ignora la foto corrupta
        }
      }
    }

    this.photos = fotosGuardadas;
  }

  // ─── Tomar nueva foto con la cámara ─────────────────────────────
  async addNewToGallery(): Promise<void> {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 90
    });

    const savedImageFile = await this.savePicture(capturedPhoto);
    this.photos.unshift(savedImageFile);
    await this.persistPhotos();
  }

  // ─── Guardar foto en el sistema de archivos ──────────────────────
  private async savePicture(photo: Photo): Promise<UserPhoto> {
    const base64Data = await this.readAsBase64(photo);
    const fileName = `bookshelf_${Date.now()}.jpeg`;

    await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });

    return {
      filepath: fileName,
      webviewPath: await this.getWebviewPath(fileName, photo),
      fechaGuardado: new Date().toLocaleString('es-EC')
    };
  }

  // ─── Convertir foto a base64 ─────────────────────────────────────
  private async readAsBase64(photo: Photo): Promise<string> {
    if (this.platform.is('hybrid')) {
      const file = await Filesystem.readFile({ path: photo.path! });
      return file.data as string;
    } else {
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();
      return await this.convertBlobToBase64(blob) as string;
    }
  }

  private convertBlobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.readAsDataURL(blob);
    });

  // ─── Obtener la ruta para mostrar en la vista ────────────────────
  private async getWebviewPath(fileName: string, photo: Photo): Promise<string> {
    if (this.platform.is('hybrid')) {
      const fileUri = await Filesystem.getUri({
        directory: Directory.Data,
        path: fileName
      });
      return Capacitor.convertFileSrc(fileUri.uri);
    }
    return photo.webPath!;
  }

  // ─── Eliminar una foto ───────────────────────────────────────────
  async deletePhoto(foto: UserPhoto): Promise<void> {
    this.photos = this.photos.filter(p => p.filepath !== foto.filepath);
    await this.persistPhotos();

    try {
      await Filesystem.deleteFile({
        path: foto.filepath,
        directory: Directory.Data
      });
    } catch {
      // Si el archivo ya no existe, continuar sin error
    }
  }

  // ─── Persistir el listado en Preferences ────────────────────────
  private async persistPhotos(): Promise<void> {
    await Preferences.set({
      key: this.PHOTO_STORAGE_KEY,
      value: JSON.stringify(this.photos)
    });
  }
}

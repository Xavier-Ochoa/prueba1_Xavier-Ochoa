import { Component } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel,
  IonInput, IonButton, IonText, IonCard, IonCardContent, IonCardHeader,
  IonCardTitle, IonIcon, IonSpinner, LoadingController, ToastController
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, mailOutline, lockClosedOutline, libraryOutline, logInOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel,
    IonInput, IonButton, IonText, IonCard, IonCardContent, IonCardHeader,
    IonCardTitle, IonIcon, IonSpinner
  ]
})
export class LoginPage {
  email = '';
  password = '';
  mensaje = '';
  tipoMensaje: 'danger' | 'success' = 'danger';
  cargando = false;
  mostrarPassword = false;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    addIcons({ eyeOutline, eyeOffOutline, mailOutline, lockClosedOutline, libraryOutline, logInOutline });
  }

  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  async login() {
    if (!this.email || !this.password) {
      this.mensaje = 'Por favor, completa todos los campos.';
      this.tipoMensaje = 'danger';
      return;
    }
    this.cargando = true;
    this.mensaje = '';
    const loading = await this.loadingCtrl.create({ message: 'Iniciando sesión...', spinner: 'crescent' });
    await loading.present();
    const { error } = await this.supabaseService.login(this.email, this.password);
    await loading.dismiss();
    this.cargando = false;
    if (error) {
      this.mensaje = this.traducirError(error.message);
      this.tipoMensaje = 'danger';
      return;
    }
    await this.mostrarToast('¡Bienvenido! Sesión iniciada correctamente.', 'success');
    this.router.navigateByUrl('/tabs/home', { replaceUrl: true });
  }

  private traducirError(error: string): string {
    const errores: { [key: string]: string } = {
      'Invalid login credentials': 'Correo o contraseña incorrectos.',
      'Email not confirmed': 'Debes confirmar tu correo antes de iniciar sesión.',
      'User already registered': 'Este correo ya está registrado.',
      'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
      'Unable to validate email address: invalid format': 'El formato del correo no es válido.',
    };
    return errores[error] ?? error;
  }

  private async mostrarToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 3000, position: 'bottom', color });
    await toast.present();
  }
}

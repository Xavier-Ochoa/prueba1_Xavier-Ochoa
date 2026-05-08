import { Component } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel,
  IonInput, IonButton, IonText, IonCard, IonCardContent, IonCardHeader,
  IonCardTitle, IonIcon, IonSpinner, ToastController
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { addIcons } from 'ionicons';
import { personAddOutline, eyeOutline, eyeOffOutline, mailOutline, lockClosedOutline } from 'ionicons/icons';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel,
    IonInput, IonButton, IonText, IonCard, IonCardContent, IonCardHeader,
    IonCardTitle, IonIcon, IonSpinner
  ]
})
export class RegisterPage {
  email = '';
  password = '';
  confirmPassword = '';
  mensaje = '';
  tipoMensaje: 'danger' | 'success' = 'danger';
  cargando = false;
  mostrarPassword = false;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    addIcons({ personAddOutline, eyeOutline, eyeOffOutline, mailOutline, lockClosedOutline });
  }

  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  async register() {
    if (!this.email || !this.password || !this.confirmPassword) {
      this.mensaje = 'Por favor, completa todos los campos.';
      this.tipoMensaje = 'danger';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.mensaje = 'Las contraseñas no coinciden.';
      this.tipoMensaje = 'danger';
      return;
    }
    if (this.password.length < 6) {
      this.mensaje = 'La contraseña debe tener al menos 6 caracteres.';
      this.tipoMensaje = 'danger';
      return;
    }

    this.cargando = true;
    this.mensaje = '';

    const { data, error } = await this.supabaseService.register(this.email, this.password);
    this.cargando = false;

    if (error) {
      this.mensaje = this.traducirError(error.message);
      this.tipoMensaje = 'danger';
      return;
    }

    if (data.user && !data.session) {
      this.mensaje = '¡Cuenta creada! Revisa tu correo para confirmarla.';
      this.tipoMensaje = 'success';
    } else {
      await this.mostrarToast('¡Cuenta creada exitosamente!', 'success');
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }

  private traducirError(error: string): string {
    const errores: { [key: string]: string } = {
      'User already registered': 'Este correo ya está registrado.',
      'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
      'Unable to validate email address: invalid format': 'El formato del correo no es válido.',
      'signup is disabled': 'El registro está deshabilitado.',
      'Email rate limit exceeded': 'Demasiados intentos. Espera un momento.',
    };
    return errores[error] ?? error;
  }

  private async mostrarToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 3000, position: 'bottom', color });
    await toast.present();
  }
}

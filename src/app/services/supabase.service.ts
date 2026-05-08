import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  private supabase: SupabaseClient;

  // Estado reactivo de sesión
  private _session = new BehaviorSubject<Session | null>(null);
  private _user = new BehaviorSubject<User | null>(null);

  session$: Observable<Session | null> = this._session.asObservable();
  user$: Observable<User | null> = this._user.asObservable();

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );

    // Cargar sesión existente al iniciar
    this.supabase.auth.getSession().then(({ data }) => {
      this._session.next(data.session);
      this._user.next(data.session?.user ?? null);
    });

    // Escuchar cambios de autenticación
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this._session.next(session);
      this._user.next(session?.user ?? null);
    });
  }

  // LOGIN
  async login(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({ email, password });
  }

  // REGISTRO
  async register(email: string, password: string) {
    return await this.supabase.auth.signUp({ email, password });
  }

  // LOGOUT
  async logout() {
    return await this.supabase.auth.signOut();
  }

  // OBTENER USUARIO ACTUAL (sincrónico desde BehaviorSubject)
  getCurrentUser(): User | null {
    return this._user.getValue();
  }

  // OBTENER SESIÓN ACTUAL (sincrónico)
  getCurrentSession(): Session | null {
    return this._session.getValue();
  }

  // VERIFICAR SI ESTÁ AUTENTICADO
  isAuthenticated(): boolean {
    return this._session.getValue() !== null;
  }
}

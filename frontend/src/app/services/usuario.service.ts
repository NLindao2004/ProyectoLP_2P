import { Injectable } from '@angular/core';
import { getAuth } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = 'http://localhost:8000/api/usuarios'; // Cambia por tu URL real

  async getIdToken(): Promise<string | null> {
    const auth = getAuth();
    const user = auth.currentUser;
    return user ? await user.getIdToken() : null;
  }

  async getPerfilUsuario() {
    const idToken = await this.getIdToken();
    if (!idToken) throw new Error('No autenticado');
    const res = await fetch(this.apiUrl, {
      headers: { 'Authorization': `Bearer ${idToken}` }
    });
    return res.json();
  }

  // Puedes agregar más métodos: crear, actualizar, etc.
}
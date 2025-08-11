import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { signInWithEmailAndPassword, getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { environment } from '../../../environments/environment';
import { initializeApp } from 'firebase/app';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  private auth = getAuth(initializeApp(environment.firebase));

  constructor(private router: Router, private usuarioService: UsuarioService) {}

  onLogin() {
    this.error = '';
    signInWithEmailAndPassword(this.auth, this.email, this.password)
      .then(async userCredential => {
        // Obtén el token
        const idToken = await userCredential.user.getIdToken();
        // Verifica el usuario en el backend
        const res = await fetch('http://localhost:8000/api/usuarios?action=login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({ idToken })
        });
        const data = await res.json();
        if (data.success) {
          this.router.navigate(['/home']);
        } else {
          this.error = data.message || 'No se pudo iniciar sesión';
        }
      })
      .catch(err => {
        this.error = 'Credenciales incorrectas o usuario no existe';
      });
  }
    onLoginWithGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(this.auth, provider)
        .then(async result => {
        // Obtén el idToken del usuario de Google
        const idToken = await result.user.getIdToken();
        // Llama al backend para validar/registrar el usuario
        const res = await fetch('http://localhost:8000/api/usuarios?action=login', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ idToken })
        });
        const data = await res.json();
        if (data.success) {
            this.router.navigate(['/home']);
        } else {
            this.error = data.message || 'No se pudo iniciar sesión con Google';
        }
        })
        .catch(err => {
        this.error = 'Error al iniciar sesión con Google';
        });
    }

  goToRegistro() {
    this.router.navigate(['/registro']);
  }
}
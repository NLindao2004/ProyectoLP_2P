import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { createUserWithEmailAndPassword, getAuth, updateProfile } from 'firebase/auth';
import { environment } from '../../../environments/environment';
import { initializeApp } from 'firebase/app';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {
  nombre = '';
  email = '';
  password = '';
  confirmPassword = '';
  error = '';
  success = '';

  private auth = getAuth(initializeApp(environment.firebase));

  constructor(private router: Router, private usuarioService: UsuarioService) {}

  onRegister() {
    this.error = '';
    this.success = '';

    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    createUserWithEmailAndPassword(this.auth, this.email, this.password)
      .then(async userCredential => {

        await updateProfile(userCredential.user, { displayName: this.nombre });

        // Envía los datos al backend
        const user = userCredential.user;
        const idToken = await user.getIdToken();
        await fetch('http://localhost:8000/api/usuarios?action=register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
            nombre: this.nombre,
            email: this.email,
            rol: 'usuario',
            uid: user.uid
        })
        });

        this.success = '¡Registro exitoso! Ahora puedes iniciar sesión.';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      })
      .catch(err => {
        if (err.code === 'auth/email-already-in-use') {
          this.error = 'El correo ya está registrado';
        } else if (err.code === 'auth/weak-password') {
          this.error = 'La contraseña debe tener al menos 6 caracteres';
        } else {
          this.error = 'Error al registrar: ' + err.message;
        }
      });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
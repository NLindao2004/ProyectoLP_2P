import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EspeciesService } from '../../../services/especies.service';
import { Especie, Comentario } from '../../../models/especies.model';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-especie-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './especie-detalle.component.html',
  styleUrls: ['./especie-detalle.component.scss']
})
export class EspecieDetalleComponent implements OnInit {
  especie!: Especie;
  nuevoComentario: Comentario = {
    texto: '',
    autor: '',
    fecha: new Date().toISOString()
  };
  enviandoComentario = false;
  errorComentario: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private especiesService: EspeciesService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.cargarEspecie();
  }

  cargarEspecie(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.especiesService.getEspecieById(id).subscribe({
        next: (especie) => {
          // Asegurar que los comentarios existan y estén inicializados
          especie.comentarios = especie.comentarios || [];
          this.especie = especie;
          this.ordenarComentarios();
          console.log('Especie cargada:', this.especie); // Debug
        },
        error: (error) => {
          console.error('Error cargando especie:', error);
        }
      });
    }
  }

  ordenarComentarios(): void {
    if (this.especie.comentarios) {
      this.especie.comentarios.sort((a, b) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
    }
  }

  goBack(): void {
    this.location.back();
  }

  agregarComentario(): void {
    if (!this.especie.id || !this.nuevoComentario.texto?.trim()) {
      return;
    }

    this.enviandoComentario = true;
    this.errorComentario = null;

    // Crear el objeto de comentario con el formato exacto que espera el backend
    const comentarioData: Comentario = {
      texto: this.nuevoComentario.texto.trim(),
      autor: this.nuevoComentario.autor?.trim() || 'Anónimo',
      fecha: new Date().toISOString() // Añadir la fecha actual
    };

    this.especiesService.agregarComentario(this.especie.id, comentarioData).subscribe({
      next: (especieActualizada) => {
        // Actualizar la lista de comentarios
        this.especie = {
          ...this.especie,
          comentarios: [...(this.especie.comentarios || []), comentarioData]
        };
        
        this.nuevoComentario = { texto: '', autor: '', fecha: '' };
        this.ordenarComentarios();
        this.enviandoComentario = false;
      },
      error: (error) => {
        console.error('Error al agregar comentario:', error);
        this.errorComentario = 'Error al agregar el comentario. Por favor, inténtalo de nuevo.';
        this.enviandoComentario = false;
      }
    });
}
}
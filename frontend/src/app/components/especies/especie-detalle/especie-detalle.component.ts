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
  cargando = true;

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
      this.cargando = true;
      
      this.especiesService.getEspecieById2(id).subscribe({
        next: (especie) => {
          this.especie = especie;
          // Asegurarse de que comentarios existe y está ordenado
          this.especie.comentarios = especie.comentarios || [];
          this.ordenarComentarios();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error cargando especie:', error);
          this.cargando = false;
        }
      });
    }
  }

  ordenarComentarios(): void {
  // Asegurarnos de que comentarios es un array antes de ordenar
  if (!this.especie?.comentarios) {
    this.especie.comentarios = []; // Inicializar como array vacío si es null/undefined
    return;
  }

  this.especie.comentarios.sort((a, b) => {
    try {
      // Convertir ambas fechas a timestamps para comparar
      const fechaA = new Date(a.fecha).getTime();
      const fechaB = new Date(b.fecha).getTime();
      return fechaB - fechaA; // Orden descendente (más reciente primero)
    } catch (error) {
      console.error('Error al ordenar comentarios:', error);
      return 0; // Si hay error en las fechas, mantener el orden actual
    }
  });
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

    const comentarioData: Comentario = {
      texto: this.nuevoComentario.texto.trim(),
      autor: this.nuevoComentario.autor?.trim() || 'Anónimo',
      fecha: new Date().toISOString()
    };

    this.especiesService.agregarComentario(this.especie.id, comentarioData).subscribe({
      next: (especieActualizada) => {
        this.especie = especieActualizada;
        this.ordenarComentarios();
        this.nuevoComentario = { texto: '', autor: '', fecha: '' };
        this.enviandoComentario = false;
      },
      error: (error) => {
        console.error('Error completo:', error);
        this.errorComentario = error.message || 'Error al agregar el comentario. Por favor, inténtalo de nuevo.';
        this.enviandoComentario = false;
      }
    });
}
}
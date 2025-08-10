import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EspeciesService } from '../../../services/especies.service';
import { Especie } from '../../../models/especies.model';
import { Location } from '@angular/common';

@Component({
  selector: 'app-especie-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './especie-detalle.component.html',
  styleUrls: ['./especie-detalle.component.scss']
})
export class EspecieDetalleComponent implements OnInit {
  especie!: Especie;

  constructor(
    private route: ActivatedRoute,
    private especiesService: EspeciesService,
    private location: Location
  ) {}

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
        this.especiesService.getEspecieById(id).subscribe(especie => {
            this.especie = especie;
        });
        }
    }
    goBack(): void {
        this.location.back();
    }
}
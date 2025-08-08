import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroEspecieComponent } from './registro-especie.component';

describe('RegistroEspecieComponent', () => {
  let component: RegistroEspecieComponent;
  let fixture: ComponentFixture<RegistroEspecieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroEspecieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroEspecieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

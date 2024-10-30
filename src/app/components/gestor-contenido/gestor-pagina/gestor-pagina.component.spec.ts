import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestorPaginaComponent } from './gestor-pagina.component';

describe('GestorPaginaComponent', () => {
  let component: GestorPaginaComponent;
  let fixture: ComponentFixture<GestorPaginaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GestorPaginaComponent]
    });
    fixture = TestBed.createComponent(GestorPaginaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

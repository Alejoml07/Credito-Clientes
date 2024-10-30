import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaPedidoComponent } from './tabla-pedido.component';

describe('TablaPedidoComponent', () => {
  let component: TablaPedidoComponent;
  let fixture: ComponentFixture<TablaPedidoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TablaPedidoComponent]
    });
    fixture = TestBed.createComponent(TablaPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

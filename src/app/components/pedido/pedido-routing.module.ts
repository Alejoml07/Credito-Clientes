import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TablaPedidoComponent } from './tabla-pedido/tabla-pedido.component';
import { authGuard } from 'src/app/shared/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'pedidos-online',
        component: TablaPedidoComponent,
        data: {
          title: "Gestor de contenido",
          breadcrumb: "Gestor de contenido"
        },
        // canActivate: [authGuard]

      }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PedidoRoutingModule { }

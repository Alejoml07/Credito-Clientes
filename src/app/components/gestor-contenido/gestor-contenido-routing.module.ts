import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from 'src/app/shared/guards/auth.guard';
import { GestorPaginaComponent } from './gestor-pagina/gestor-pagina.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'gestor-contenido',
        component: GestorPaginaComponent,
        data: {
          title: "Gestor de contenido",
          breadcrumb: "Gestor de contenido"
        },
        canActivate: [authGuard]

      }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestorContenidoRoutingModule { }

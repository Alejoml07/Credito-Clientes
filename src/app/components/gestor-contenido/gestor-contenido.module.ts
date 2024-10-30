import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GestorContenidoRoutingModule } from './gestor-contenido-routing.module';
import { GestorPaginaComponent } from './gestor-pagina/gestor-pagina.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserModule } from '@angular/platform-browser';


@NgModule({
  declarations: [
    GestorPaginaComponent
  ],
  imports: [
    CommonModule,
    GestorContenidoRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    BrowserModule,

  ]
})
export class GestorContenidoModule { }

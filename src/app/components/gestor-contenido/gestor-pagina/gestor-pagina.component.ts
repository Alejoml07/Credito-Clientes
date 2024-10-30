import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// import { OrdersService } from 'src/app/shared/service/order.service';
import { SecurityService } from 'src/app/shared/service/security.service';
import { UsuariosService } from 'src/app/shared/service/usuarios.service';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-gestor-pagina',
  templateUrl: './gestor-pagina.component.html',
  styleUrls: ['./gestor-pagina.component.scss']
})
export class GestorPaginaComponent {
  // reporteForm: FormGroup;
  // formFechas: FormGroup;
  // botonHabilitado: boolean = false;
  // botonHabilitado2: boolean = false;
  // public active = 1;

  // datosParaExportar: any[] = [];
  // cargando: boolean = false;
  // cargando2: boolean = false;

  // cedula: string = '';

  // anios = [];
  // tipoUsuario: any;


  // constructor(private fb: FormBuilder,
  //   private securityService: SecurityService,
  //   private usuariosService: UsuariosService,

  //   // private orderService: OrdersService, 
  // ) {
  //   this.reporteForm = this.fb.group({
  //     FacturaCompleta: [],
  //     NumeroFactura: [],
  //     FechaInicio: [],
  //     FechaFin: [],
  //     NombreTienda: [],
  //     CedulaEjecutiva: [],
  //     CedulaCliente: [],
  //     campana: this.fb.array([this.crearCampana()]),
  //     idTienda: this.fb.array([this.crearIdTienda()])  // FormArray para Id Tienda
  //   });

  // }

  // ngOnInit(): void {
  //   this.inicializaranios();
  //   this.setTipoUsuario();

  // }

  
  // // Create a new form control for "campana"
  // crearCampana(): FormGroup {
  //   return this.fb.group({
  //     nombre: ['', Validators.required]  // Ensure that each campaign has a 'nombre' field
  //   });
  // }

  // // Create a new form control for "idTienda"
  // crearIdTienda(): FormGroup {
  //   return this.fb.group({
  //     id: ['', Validators.required]  // Ensure that each idTienda has an 'id' field
  //   });
  // }

  // // Getters for form arrays
  // get campana(): FormArray {
  //   return this.reporteForm.get('campana') as FormArray;
  // }

  // get idTienda(): FormArray {
  //   return this.reporteForm.get('idTienda') as FormArray;
  // }

  // // Add new campana entry
  // agregarCampana(): void {
  //   this.campana.push(this.crearCampana());
  // }

  // // Add new idTienda entry
  // agregarIdTienda(): void {
  //   this.idTienda.push(this.crearIdTienda());
  // }

  // // Remove a campana entry
  // eliminarCampana(index: number): void {
  //   this.campana.removeAt(index);
  // }

  // // Remove an idTienda entry
  // eliminarIdTienda(index: number): void {
  //   this.idTienda.removeAt(index);
  // }

  // setTipoUsuario(): void {
  //   const user = this.securityService.getUserAuthenticated();
  //   console.log('user', user)
  //   this.tipoUsuario = user.tipoUsuario;
  //   this.reporteForm.patchValue({
  //     tipoUsuario: this.tipoUsuario
  //   });
  //   this.formFechas.patchValue({
  //     tipoUsuario: this.tipoUsuario
  //   });
  // }


  // inicializaranios() {
  //   const anioActual = new Date().getFullYear();
  //   for (let anio = anioActual - 0; anio <= anioActual; anio++) {
  //     this.anios.push(anio);
  //   }
  // }

  // resetForm() {
  //   this.reporteForm.reset({
  //     FacturaCompleta: '',
  //     NumeroFactura: '',
  //     FechaInicio: '',
  //     FechaFin: '',
  //     Campana: '',
  //     NombreTienda: '',
  //     CedulaEjecutiva: '',
  //     CedulaCliente: ''
  //   });

  //   this.idTienda.clear();  // Limpia el FormArray
  //   this.idTienda.push(this.crearIdTienda());  // Añade un campo vacío

    

  //   this.botonHabilitado = false;
  //   this.botonHabilitado2 = false;
  //   this.datosParaExportar = [];
  // }

  // filtrarDatos(datos: any[]): any[] {
  //   if (this.tipoUsuario === 'Administrador Retail') {
  //     // Filtrar para mostrar solo usuarias con tipoUsuario "Asesoras vendedoras"
  //     return datos.filter(dato => dato.usuario?.tipoUsuario === 'Asesoras vendedoras');
  //   } else if (this.tipoUsuario === 'Administrador DLM') {
  //     // Filtrar para mostrar solo usuarias con tipoUsuario "Lideres" o "Lideres ZE"
  //     return datos.filter(dato => dato.usuario?.tipoUsuario === 'Lideres' || dato.usuario?.tipoUsuario === 'Lideres ZE');
  //   } else {
  //     // Si no hay filtro específico, devolver todos los datos
  //     return datos;
  //   }
  // }


  // enviarDatos() {
  //   this.cargando = true;
  
  //   // Obtener los valores del formulario
  //   const valores = this.reporteForm.value;
  
  //  // Verificar si campana tiene valores y que el primer valor no sea una cadena vacía
  //   if (valores.campana && valores.campana.length > 0 && valores.campana[0].nombre !== "" && valores.campana[0].nombre !== null) {
  //     valores.campana = valores.campana.map((campana: any) => campana.nombre);
  //   } else {
  //     valores.campana = [];
  //   }

  //   // Verificar si idTienda tiene valores y que el primer valor no sea una cadena vacía
  //   if (valores.idTienda && valores.idTienda.length > 0 && valores.idTienda[0].id !== "") {
  //     valores.idTienda = valores.idTienda.map((tienda: any) => tienda.id);
  //   } else {
  //     valores.idTienda = [];
  //   }

  
  //   console.log('Form Data:', valores);
  
  //   this.usuariosService.reporteOmnicanalidad(valores).subscribe({
  //     next: (response) => {
  //       this.cargando = false;
  //       if (response['isSuccess'] === true) {
  //         this.botonHabilitado = true;
  //         this.datosParaExportar = response['result'];
  //         console.log('datos', this.datosParaExportar);
  //       } else {
  //         this.botonHabilitado = false;
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error en la llamada a la API:', error);
  //       this.botonHabilitado = false;
  //       this.cargando = false;
  //     }
  //   });
  // }

  // exportarComoExcel(datos) {
  //   console.log("datos para exportar", datos)
  //   const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.prepararDatosParaExcel(datos));
  //   const workbook: XLSX.WorkBook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');
  //   XLSX.writeFile(workbook, 'ReporteMovimientos.xlsx');
  // }

  // prepararDatosParaExcel(datos) {
  //   return datos.map(registro => {
  //     return {
  //       'ID': registro.id ?? 'No registra',
  //       'Número Factura': registro.numeroFactura ?? 'No registra',
  //       'Código Facturación': registro.codigoFacturacion ?? 'No registra',
  //       'Factura Completa': registro.facturaCompleta ?? 'No registra',
  //       'Prefijo Factura': registro.prefijoFactura ?? 'No registra',
  //       'Código País': registro.codigoPais ?? 'No registra',
  //       'Fecha Compra': this.formatearFecha(registro.fechaCompra) ?? 'No registra',
  //       'Fecha Vencimiento': registro.fechaVencimiento ? this.formatearFecha(registro.fechaVencimiento) : 'No registra',
  //       'Campaña': registro.campana ?? 'No registra',
  //       'ID Tienda': registro.idTienda ?? 'No registra',
  //       'Nombre Tienda': registro.nombreTienda ?? 'No registra',
  //       'Cédula Ejecutiva': registro.cedulaEjecutiva ?? 'No registra',
  //       'Cupo Disponible': registro.cupoDisponible ?? 'No registra',
  //       'Base Compra Tienda': registro.baseCompraTienda ?? 'No registra',
  //       'IVA 1': registro.ivA1 ?? 'No registra',
  //       'IVA 2': registro.ivA2 ?? 'No registra',
  //       'Ganancia Ejecutiva': registro.gananciaEjecutiva ?? 'No registra',
  //       'Cupo Usado Tienda': registro.cupoUsadoTienda ?? 'No registra',
  //       'Cédula Cliente': registro.cedulaCliente ?? 'No registra',
  //       'Nombre Cliente': registro.nombesCliente ?? 'No registra',
  //       'Apellidos Cliente': registro.apellidosCliente ?? 'No registra',
  //       'Celular Cliente': registro.celularCliente ?? 'No registra',
  //       'Correo Cliente': registro.correoCliente ?? 'No registra',
  //       'ID Negocio': registro.idNegocio ?? 'No registra',
  //       'Tipo Factura': registro.tipoFactura ?? 'No registra',
  //       'Estado': registro.estado ?? 'No registra',
  //       'ID Transacción Dissen': registro.idTransaccionDissen ?? 'No registra',
  //       'ID Transacción Votre': registro.idTransaccionVotre ?? 'No registra'
  //     };
  //   });
  // }

  // formatearFecha(fechaIso: string): string {
  //   const opciones: Intl.DateTimeFormatOptions = {
  //     year: 'numeric', month: '2-digit', day: '2-digit',
  //     hour: 'numeric', minute: '2-digit', second: '2-digit',
  //     hour12: true,
  //   };
  //   const fecha = new Date(fechaIso);
  //   const fechaFormateada = new Intl.DateTimeFormat('es-ES', opciones).format(fecha);
  //   return fechaFormateada.replace(',', '').replace(/:\d{2}$/, '');
  // }

}

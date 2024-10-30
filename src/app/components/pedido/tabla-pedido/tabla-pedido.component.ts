import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuariosService } from 'src/app/shared/service/usuarios.service';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';


export interface OrderItem {
  codigo: string;
  paginaCatalogo: number;
  descripcion: string;
  activarSeguro: boolean;
  referencia: string;
  cantidadSolicitada: number;
  cantidadAsignada: number;
  valorUnitarioCatalogo: number;
  valorUnitarioEjecutiva: number;
  descuento?: number;
  valorTotal?: number;
}

const ORDER_DATA: OrderItem[] = [
  {
    codigo: '07724',
    paginaCatalogo: 5,
    descripcion: 'BUSTIER 360 DE BLANCO 36',
    activarSeguro: false,
    referencia: '011911',
    cantidadSolicitada: 1,
    cantidadAsignada: 1,
    valorUnitarioCatalogo: 83242,
    valorUnitarioEjecutiva: 75000
  },
  {
    codigo: '09231',
    paginaCatalogo: 8,
    descripcion: 'JEANS SKINNY NEGRO 34',
    activarSeguro: false,
    referencia: '011912',
    cantidadSolicitada: 2,
    cantidadAsignada: 2,
    valorUnitarioCatalogo: 65000,
    valorUnitarioEjecutiva: 60000
  },
  {
    codigo: '04567',
    paginaCatalogo: 12,
    descripcion: 'CAMISETA DEPORTIVA AZUL M',
    activarSeguro: true,
    referencia: '011913',
    cantidadSolicitada: 3,
    cantidadAsignada: 3,
    valorUnitarioCatalogo: 45000,
    valorUnitarioEjecutiva: 40000
  }
];

@Component({
  selector: 'app-tabla-pedido',
  templateUrl: './tabla-pedido.component.html',
  styleUrls: ['./tabla-pedido.component.scss']
})
export class TablaPedidoComponent implements OnInit {
  pedidoForm: FormGroup;
  checkoutForm: FormGroup;
  dataSource: OrderItem[] = [];
  currentStep: number = 1;
  valorMercanciaSinIVA: number = 0;
  valorBaseIVA: number = 0;
  valorIVA: number = 0;
  subtotal: number = 0;
  valorFlete: number = 6900;
  valorTotalFactura: number = 0;
  totalCantidadSolicitada: number = 0;
  totalCantidadAsignada: number = 0;
  totalDescuento: number = 0;
  totalValorTotal: number = 0;
  valorFinanciar: number = 0;
  tasaMensual: number = 2.08;
  tasaAnual: number = 27.97;
  cuotasCredito: any[] = [];
  camposBloqueados: boolean = true;
  departamentos: any[] = [];
  departamentoSeleccionado: string = '';
  ciudades: string[] = [];
  loading: boolean = false;
  infoUserToken: string | null = null;
  user : any 



  constructor(private fb: FormBuilder, private usuariosService: UsuariosService,private route: ActivatedRoute  ) {
    this.pedidoForm = this.fb.group({
      cedulaCliente: ['', Validators.required],
      codigoPrenda: [{ value: '', disabled: true }, Validators.required],
      cantidad: [{ value: 1, disabled: true }, [Validators.required, Validators.min(1)]]
    });

    this.checkoutForm = this.fb.group({
      departamento: ['', Validators.required],
      ciudad: ['', Validators.required],
      direccionCliente: ['', [Validators.required]],
      opcionCuotas: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loading = true;
    this.route.queryParamMap.subscribe(params => {
      this.infoUserToken = params.get('infoUser');
      console.log('Token infoUser:', this.infoUserToken);
      const dataEncriptada = {
        Base64Data: this.infoUserToken
      };
    
      this.usuariosService.desencriptarJson(dataEncriptada).subscribe(data => {
        if (data.isSuccess) {
          this.loading = false;
          const userData = JSON.parse(data.result); // Parseamos el JSON de 'result'
          this.user = {
            codigoPais: userData.codigoPais,
            codigoCompania: userData.codigoCompania,
            cedula: userData.cedula,
            codigoInterno: userData.codigoInterno,
            displayName: userData.displayName.split(' ')[0], // Toma solo el primer nombre
            tipoCompradora: userData.tipoCompradora,
            zona: userData.zona,
            mail: userData.mail,
            campana: userData.campana
          };
          console.log('Datos de usuario:', this.user);
        } else {
          console.error('Error en la respuesta:', data.message);
        }
      });
    });

    const productosGuardados = localStorage.getItem('productos');
    if (productosGuardados) {
      this.dataSource = JSON.parse(productosGuardados);
    } else {
      this.dataSource = ORDER_DATA.map(producto => ({
        ...producto,
        
        descuento: (producto.valorUnitarioCatalogo - producto.valorUnitarioEjecutiva) * producto.cantidadAsignada,
        valorTotal: producto.cantidadAsignada * producto.valorUnitarioEjecutiva
      }));
    }
    this.calcularTotales();

    this.usuariosService.obtenerMunicipios().subscribe(data => {
      this.departamentos = data;
      console.log('departamentos', this.departamentos);
    });
  }


  agregarProducto(): void {
    if (this.pedidoForm.invalid) {
        alert('Por favor, complete todos los campos del formulario de pedido correctamente.');
        return;
    }

    const { codigoPrenda, cantidad } = this.pedidoForm.value;

    const dataProduct = {
        Codigo : codigoPrenda,
        Cantidad : cantidad,
        Campana : this.user.campana
    }

    // Llamada a la API para consultar el producto
    this.usuariosService.getProducto(dataProduct).subscribe(
        (response: any) => {
            if (response.isSuccess && response.result) {
                const productoExistente = response.result;
                
                const nuevoProducto: OrderItem = {
                    codigo: productoExistente.lineCode,
                    paginaCatalogo: parseInt(productoExistente.catalogPage.trim(), 10),
                    descripcion: productoExistente.descriptionPol,
                    activarSeguro: false, // Asumiendo valor por defecto
                    referencia: productoExistente.sku.split(' ')[0],
                    cantidadSolicitada: cantidad,
                    cantidadAsignada: cantidad,
                    valorUnitarioCatalogo: productoExistente.catalogPrice,
                    valorUnitarioEjecutiva: productoExistente.executivePrice * 1.19,
                    descuento: (productoExistente.catalogPrice - (productoExistente.executivePrice * 1.19)) * cantidad,
                    valorTotal: cantidad * (productoExistente.executivePrice * 1.19)
                };
                
                this.dataSource.push(nuevoProducto);

                // Guarda los productos y calcula los totales después de agregar el nuevo producto
                this.guardarProductos();
                this.pedidoForm.reset({ cantidad: 1 });
                this.calcularTotales();
            } else {
                alert('Producto no encontrado en la lista de productos disponibles');
            }
        },
        (error) => {
            alert('Ocurrió un error al consultar el producto');
            console.error('Error al consultar el producto:', error);
        }
    );
}

  eliminarProducto(index: number): void {
    this.dataSource.splice(index, 1);
    this.guardarProductos();
    this.calcularTotales();
  }

  guardarProductos(): void {
    localStorage.setItem('productos', JSON.stringify(this.dataSource));
  }

  continuarCheckout(): void {
    if (this.checkoutForm.invalid) {
      alert('Por favor, complete todos los campos del formulario de checkout correctamente.');
      return;
    }
    alert('Continuando al checkout...');
  }

  setStep(step: number): void {
    this.currentStep = step;
    if (step === 2) {
      this.simularCredito();  // Cuando cambias al paso 2, llamamos a la API de simulación de crédito
    }
  }

  resetearTodo(): void {
    this.pedidoForm.reset();  // Resetea el formulario
    this.dataSource = [];     // Limpia el contenido de la tabla
    this.currentStep = 1;     // Opcional: Regresa al primer paso si es necesario
    this.totalCantidadSolicitada = 0;
    this.totalCantidadAsignada = 0;
    this.totalDescuento = 0;
    this.totalValorTotal = 0;
    console.log("Formulario y tabla reiniciados");
  }

  onDepartamentoSeleccionado(deptoId: string) {
    const idNumerico = deptoId;
    const departamentoSeleccionado = this.departamentos.find(depto => depto.departamento === idNumerico);
    this.ciudades = departamentoSeleccionado ? departamentoSeleccionado.ciudades : [];
    this.checkoutForm.controls['ciudad'].setValue(''); // Resetea la selección de la ciudad
  }

  validarCupoDisponible(): void {
    if (this.pedidoForm.get('cedulaCliente')?.invalid) {
        Swal.fire({
            icon: 'error',
            title: 'Cédula inválida',
            text: 'Por favor, ingrese una cédula válida.',
        });
        return;
    }

    const jsonData = {
        a_schemacia: 'cia_leonisa',
        a_login: 'rest.services',
        a_password: 'L1664eonisa',
        a_id_marca: '18',
        a_documento: this.pedidoForm.get('cedulaCliente')?.value
    };

    Swal.fire({
        title: 'Validando cupo disponible...',
        text: 'Por favor, espera mientras verificamos los datos.',
        didOpen: () => {
            Swal.showLoading(); 
        },
        allowOutsideClick: false 
    });

    this.usuariosService.validarCedulaCupo(jsonData).subscribe(
        (response) => {
            if (response.message.includes('no tiene crédito aprobado')) {
                Swal.fire({
                    icon: 'error',
                    title: 'Crédito no aprobado',
                    text: response.message,
                });

                this.pedidoForm.get('codigoPrenda')?.setValue('');
                this.pedidoForm.get('codigoPrenda')?.disable();

                this.pedidoForm.get('cantidad')?.setValue(1);
                this.pedidoForm.get('cantidad')?.disable();

                this.camposBloqueados = true;
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Crédito aprobado',
                    text: response.message,
                });

                this.pedidoForm.get('codigoPrenda')?.enable();
                this.pedidoForm.get('cantidad')?.enable();
                this.camposBloqueados = false;

                this.pedidoForm.get('cedulaCliente')?.disable();
            }
        },
        (error) => {
            Swal.fire({
                icon: 'error',
                title: 'Error al validar',
                text: 'Ocurrió un error al validar el cupo disponible. Por favor, intenta nuevamente.',
            });
            console.error('Error al validar el cupo disponible', error);
        }
    );
}

  calcularTotales(): void {
    this.totalCantidadSolicitada = this.dataSource.reduce((acc, item) => acc + item.cantidadSolicitada, 0);
    this.totalCantidadAsignada = this.dataSource.reduce((acc, item) => acc + item.cantidadAsignada, 0);
    this.totalDescuento = this.dataSource.reduce((acc, item) => acc + (item.descuento || 0), 0);
    this.totalValorTotal = this.dataSource.reduce((acc, item) => acc + (item.valorTotal || 0), 0);

    this.valorMercanciaSinIVA = this.dataSource.reduce((acc, item) => acc + (item.valorUnitarioEjecutiva / 1.19) * item.cantidadAsignada, 0);
    this.valorBaseIVA = this.valorMercanciaSinIVA;
    this.valorIVA = this.valorBaseIVA * 0.19;
    this.subtotal = this.valorBaseIVA + this.valorIVA;
    if (this.subtotal > 80000) {
      this.valorFlete = 0
      this.valorTotalFactura = this.subtotal;
    } else {
      this.valorTotalFactura = this.subtotal + this.valorFlete;
      this.valorFlete = 6900
    }

    this.valorFinanciar = this.valorTotalFactura;
}
  simularCredito(): void {
    const jsonData = {
      a_c_sucursal: '1',
      a_valor_financiar: this.valorFinanciar
    };
  
    // Set loading to true to display the loader
    this.loading = true;
  
    this.usuariosService.simularCredito(jsonData).subscribe(
      (response) => {
        this.loading = false; // Hide loader after response
        if (response.isSuccess) {
          this.cuotasCredito = response.result.datos.map((cuota: any) => ({
            d_modalidad: cuota.d_modalidad,
            meses: cuota.cuotas,
            totalCredito: cuota.tot_valor_credito,
            cuota: cuota.tot_valor_cuota,
            intereses: cuota.interes,
            garantia: cuota.cre_valor_garantia
          }));
        } else {
          alert('Error en la simulación: ' + response.message);
        }
      },
      (error) => {
        this.loading = false; // Hide loader after error
        alert('Error al simular el crédito. Intenta nuevamente.');
        console.error('Error:', error);
      }
    );
  }

  // Método que muestra la alerta
  validarConCliente(): void {
    Swal.fire({
      title: 'Elige un método de verificación',
      text: 'Selecciona el método y escribe el código para validar con el cliente.',
      input: 'text',
      inputLabel: 'Ingresa el código de validación',
      inputPlaceholder: 'Código',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Validar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      inputValidator: (value) => {
        if (!value) {
          return 'Por favor, ingresa un código';
        }
      },
      // Opciones para los botones de método de envío con estilos en línea
      html: `
        <style>
          .swal2-container .swal2-default-button {
            background-color: #4CAF50; /* Color de fondo para botones */
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 8px 20px;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.3s ease, box-shadow 0.3s ease;
            margin: 5px;
          }
          .swal2-container .swal2-default-button:hover {
            background-color: #45a049;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }
          #sms {
            background-color: #007bff;
          }
          #whatsapp {
            background-color: #25d366;
          }
          #email {
            background-color: #ea4335;
          }
        </style>
        <div>
          <button id="sms" class="swal2-styled swal2-default-button">SMS</button>
          <button id="whatsapp" class="swal2-styled swal2-default-button">WhatsApp</button>
          <button id="email" class="swal2-styled swal2-default-button">Correo</button>
        </div>
      `,
      didOpen: () => {
        // Añade los eventos de click para cada botón
        document.getElementById('sms')?.addEventListener('click', () => this.enviarMetodo('sms'));
        document.getElementById('whatsapp')?.addEventListener('click', () => this.enviarMetodo('whatsapp'));
        document.getElementById('email')?.addEventListener('click', () => this.enviarMetodo('email'));
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const token = result.value;
        this.verificarToken(token);
      }
    });
  }
enviarMetodo(metodo: string): void {
  console.log(`Método de envío seleccionado: ${metodo}`);
  // Aquí podrías añadir lógica adicional para procesar el método seleccionado
}

verificarToken(token: string): void {
  // Lógica para verificar el token
  console.log(`Token ingresado: ${token}`);
  Swal.fire({
    icon: 'success',
    title: 'Token verificado',
    text: 'La verificación fue exitosa.',
  });
}



}

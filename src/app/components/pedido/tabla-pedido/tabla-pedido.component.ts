import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuariosService } from 'src/app/shared/service/usuarios.service';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { resourceLimits } from 'worker_threads';
import { StorageService } from 'src/app/shared/service/storage.service';
import { Observable, tap } from 'rxjs';
import { SecurityService } from 'src/app/shared/service/security.service';
import * as forge from 'node-forge';
import { HttpHeaders } from '@angular/common/http';

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
  valorTotalCliente?: number;

}
const ORDER_DATA: OrderItem[] = [];

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
  mostrarClienteIva: boolean = false;
  mostrarCupoCliente: boolean = false;

  totalDescuentoCliente: number;
  totalValorTotalCliente: number;
  cupoCliente: number;
  authToken: any;
  publicKeyBase64: string;

  opcionSeleccionada: any;



  constructor(private securityService: SecurityService,private storageService: StorageService, private fb: FormBuilder, private usuariosService: UsuariosService,private route: ActivatedRoute  ) {
    this.pedidoForm = this.fb.group({
      cedulaCliente: ['', Validators.required],
      codigoPrenda: [{ value: '', disabled: true }, Validators.required],
      cantidad: [{ value: 1, disabled: true }, [Validators.required, Validators.min(1)]]
    });

    this.checkoutForm = this.fb.group({
      departamento: ['', Validators.required],
      ciudad: ['', Validators.required],
      direccionCliente: ['', Validators.required],
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
        if (data) {
          this.loading = false;
          this.loginAndGetToken();

          this.storageService.setItem('msauc_user', (data.jwtToken));
          const userData = (data.apiKeyVotre); 
          console.log('userData',userData)
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
                    valorUnitarioEjecutiva: productoExistente.catalogPrice * 0.75,
                    descuento: (productoExistente.catalogPrice - ((productoExistente.catalogPrice * 0.75) * 1.19)) * cantidad,
                    valorTotal: cantidad * ((productoExistente.catalogPrice * 0.75)),
                    valorTotalCliente: cantidad * (productoExistente.catalogPrice)

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
    if (step === 2) {
      if (this.cupoCliente < this.totalValorTotalCliente) {
        Swal.fire({
          icon: 'error',
          title: 'Cupo insuficiente',
          text: 'El cupo de crédito del cliente es insuficiente para cubrir el total del pedido.',
        });
        return;
      } else {
        this.simularCredito(); 
      }
    }
    this.currentStep = step; 
  }

  resetearTodo(): void {
    this.pedidoForm.reset();  // Resetea el formulario
    this.dataSource = [];     // Limpia el contenido de la tabla
    this.currentStep = 1;     // Opcional: Regresa al primer paso si es necesario
    this.totalCantidadSolicitada = 0;
    this.totalCantidadAsignada = 0;
    this.totalDescuento = 0;
    this.totalValorTotal = 0;
    this.pedidoForm.get('cedulaCliente')?.enable();
    this.mostrarCupoCliente = false
    this.pedidoForm.get('codigoPrenda')?.setValue('');
    this.pedidoForm.get('codigoPrenda')?.disable();
    this.pedidoForm.get('cantidad')?.setValue(1);
    this.pedidoForm.get('cantidad')?.disable();

    console.log("Formulario y tabla reiniciados");
  }

  onDepartamentoSeleccionado(deptoId: string): void {
    const departamentoSeleccionado = this.departamentos.find(depto => depto.departamento === deptoId);
    this.ciudades = departamentoSeleccionado ? departamentoSeleccionado.ciudades : [];
    this.checkoutForm.controls['ciudad'].setValue(''); 

    this.dataSource.forEach(item => {
        this.validarIVA(departamentoSeleccionado.departamento);
    });
    


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
        title: 'Validando cupo de crédito disponible...',
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
                  title: 'Cupo de crédito disponible',
                  text: response.message,
              });
  
              this.pedidoForm.get('codigoPrenda')?.enable();
              this.pedidoForm.get('cantidad')?.enable();
              this.camposBloqueados = false;
              this.cupoCliente = response.result.cupo;
              this.mostrarCupoCliente = true;
              console.log('cupo', this.cupoCliente);
              this.pedidoForm.get('cedulaCliente')?.disable();
  
              const nombres = `${response.result.datos.persona[0].nombre1} ${response.result.datos.persona[0].nombre2}`;
              const apellidos = ` ${response.result.datos.persona[0].apellido1} ${response.result.datos.persona[0].apellido2}`;
              const cedulaIngresada = this.pedidoForm.get('cedulaCliente')?.value;
              const correo = response.result.datos.emails[0].row_to_json.dato_contacto;
              const celular = response.result.datos.celulares[0].row_to_json.dato_contacto;
  
              localStorage.setItem('nombreCliente', nombres);
              localStorage.setItem('apellidoCliente', apellidos);
              localStorage.setItem('cedulaCliente', cedulaIngresada);
              localStorage.setItem('correoCliente', correo);
              localStorage.setItem('celularCliente', celular);
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
  this.totalValorTotalCliente = this.dataSource.reduce((acc, item) => acc + (item.valorTotalCliente || 0), 0);
  this.valorMercanciaSinIVA = this.dataSource.reduce((acc, item) => acc + (item.valorUnitarioCatalogo / 1.19) * item.cantidadAsignada, 0);
  this.valorBaseIVA = this.valorMercanciaSinIVA;

  if (this.checkoutForm.get('departamento')?.value) {
      this.validarIVA(this.checkoutForm.get('departamento')?.value);
  }


}

obtenerYAplicarFlete(): void {
  const payload = { pais: "169", idterminal: "3913" };
  
  this.securityService.getFletes(payload, this.authToken).subscribe(
      (response: any) => {
          if (response.success) {
              const parametrosFletes = response.parametrosFletes;
              const vfParametro = parametrosFletes.find((item: any) => item.codigo === "VF");
              const vpescmsParametro = parametrosFletes.find((item: any) => item.codigo === "VPESCMA");
              const vpescmeParametro = parametrosFletes.find((item: any) => item.codigo === "VPESCME");

              if (vfParametro && vpescmeParametro) {
                  // Aplica la lógica de flete según el valor total de la compra
                  if (this.subtotal >= parseFloat(vfParametro.valor)) {
                      this.valorFlete = parseFloat(vpescmsParametro?.valor || "0"); // VF mayor o igual, aplica VPESCMS
                  } else {
                      this.valorFlete = parseFloat(vpescmeParametro.valor); // VF menor, aplica VPESCME
                  }
                  this.valorTotalFactura = this.subtotal + this.valorFlete;
                  this.valorFinanciar = this.valorTotalFactura;
                  this.simularCredito();
              }
          } else {
              console.error('Error al obtener los parámetros de flete:', response.message);
          }
      },
      error => {
          console.error('Error en la solicitud de fletes:', error);
      }
  );
}

validarIVA(departamento: string): void {
  const payload = {
      Departamento: departamento,
      PrecioProducto: this.totalValorTotalCliente,  // Enviar el total de la compra como precio
      IVA: 0
  };

  this.usuariosService.validarIVA(payload).subscribe(
      (response: any) => {
          if (response.isSuccess) {
              this.valorMercanciaSinIVA = response.result.precioProductoSinIVA;
              this.valorBaseIVA = response.result.precioProductoSinIVA;
              this.valorIVA = response.result.iva;
              this.subtotal = this.valorBaseIVA + this.valorIVA;
              this.subtotal = this.valorBaseIVA + this.valorIVA;
              this.obtenerYAplicarFlete();
              this.valorTotalFactura = this.subtotal + this.valorIVA + this.valorFlete;



          } else {
              console.error('Error al validar IVA:', response.message);
          }
      },
      error => {
          console.error('Error en la solicitud de IVA:', error);
      }
  );
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

  guardarOpcionSeleccionada(cuota: any): void {
    this.opcionSeleccionada = cuota;
    console.log('Opción seleccionada:', this.opcionSeleccionada);
    localStorage.setItem('selectedCreditOption', JSON.stringify(this.opcionSeleccionada));
  }

  validarConCliente(): void {
   

    Swal.fire({
      title: 'Elige un método de verificación',
      html: `
        <style>
          .swal2-icon-button-container {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 20px;
          }
          .swal2-icon-button {
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
          }
          .swal2-icon-circle {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 24px;
          }
          .swal2-icon-circle.sms {
            background-color: #007bff; /* Color azul para SMS */
          }
          .swal2-icon-circle.email {
            background-color: #000; /* Color negro para Correo */
          }
          .swal2-icon-text {
            margin-top: 8px;
            font-size: 14px;
            font-weight: bold;
            color: #333;
          }
          .swal2-input-container {
            margin-top: 20px;
            display: none; /* Oculto inicialmente */
            justify-content: center;
          }
          #codigoValidacion {
            width: 80%;
            max-width: 300px;
            text-align: center;
            margin-top: 10px;
          }
          .swal2-confirm {
            display: none; /* Oculto inicialmente */
          }
        </style>
        
        <div class="swal2-icon-button-container">
          <!-- Botón para SMS -->
          <div id="smsButton" class="swal2-icon-button">
            <div class="swal2-icon-circle sms">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-chat-dots-fill" viewBox="0 0 16 16">
                <path d="M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M5 8a1 1 0 1 0-2 0 1 1 0 0 0 2 0m4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
              </svg>
            </div>
            <div class="swal2-icon-text">SMS</div>
          </div>
          
          <!-- Botón para Correo -->
          <div id="emailButton" class="swal2-icon-button">
            <div class="swal2-icon-circle email">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-envelope-fill" viewBox="0 0 16 16">
                <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z"/>
              </svg>
            </div>
            <div class="swal2-icon-text">Correo</div>
          </div>
        </div>
  
        <!-- Campo de entrada para el código de validación -->
        <div class="swal2-input-container">
          <input id="codigoValidacion" type="text" placeholder="Ingresa el código" class="swal2-input">
        </div>
      `,
      showCancelButton: true,
    cancelButtonText: 'Cancelar',
    confirmButtonText: 'Finalizar pedido',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    reverseButtons: true,
    didOpen: () => {
      document.getElementById('smsButton')?.addEventListener('click', () => this.mostrarInputCodigo(1));
      document.getElementById('emailButton')?.addEventListener('click', () => this.mostrarInputCodigo(3));
    },
    preConfirm: () => {
      const codigo = (document.getElementById('codigoValidacion') as HTMLInputElement).value;
      if (!codigo) {
        Swal.showValidationMessage('Por favor, ingresa un código');
      }
      return codigo;
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const token = result.value;
      this.verificarToken(token);
    }
  });
}
  
mostrarInputCodigo(modoEnvio: number): void {
  const inputContainer = document.querySelector('.swal2-input-container') as HTMLElement;
  const confirmButton = document.querySelector('.swal2-confirm') as HTMLElement;
  inputContainer.style.display = 'flex';
  confirmButton.style.display = 'inline-block';

  const body = {
    "A_documento": "144444444",
    "A_c_sucursal": "3913",
    "C_modo_envio": modoEnvio.toString()
  };


  // Encrypt the terminal and user values
  const encryptedTerminal = this.encryptWithPublicKey(this.publicKeyBase64, '3913');
  const encryptedUser = this.encryptWithPublicKey(this.publicKeyBase64, '291024');

  // Pass the encrypted headers to the service
  const headers = new HttpHeaders({
    terminal: encryptedTerminal,
    user: encryptedUser
  });

  this.securityService.generateValidationCode(body, this.authToken, headers).subscribe(
    (response: any) => {
      if (response.isSuccess) {
        console.log("Validation code sent successfully.");
      } else {
        console.error("Error sending validation code:", response.message);
      }
    },
    error => {
      console.error("API request error:", error);
    }
  );
}

verificarToken(token: string): void {
  const body = {
    "A_documento": "144444444",  
    "A_sms_code": token
  };

  const encryptedTerminal = this.encryptWithPublicKey(this.publicKeyBase64, '3913');
  const encryptedUser = this.encryptWithPublicKey(this.publicKeyBase64, '291024');

  const headers = new HttpHeaders({
    'terminal': encryptedTerminal,
    'user': encryptedUser
  });

  this.securityService.verifyValidationCode(body, this.authToken, headers).subscribe(
    (response: any) => {
      if (response.codigo === "0") {        
        Swal.fire({
          icon: 'success',
          title: 'Token verificado',
          text: 'La verificación fue exitosa.',
        });

        const savedOption = localStorage.getItem('selectedCreditOption');
        const selectedCreditOption = JSON.parse(savedOption);
        const numero = selectedCreditOption.meses || "";
        const aceptacion = selectedCreditOption.d_modalidad || "";

        const jsonToLog = {
          additionalField5: "",
          allowBackOrder: "Y",
          avscode: "", 
          baseSubTotal: this.valorMercanciaSinIVA.toFixed(2),  
          billingInformation: {
            addressLine1: this.checkoutForm.get('direccionCliente')?.value.toUpperCase(),
            addressLine2: "",
            addressLine3: "",
            city: this.checkoutForm.get('ciudad')?.value.toUpperCase(),
            colonia: "",
            companyName: "",
            country: "COLOMBIA",
            emailAddress: localStorage.getItem('correoCliente') || "",  
            firstName: localStorage.getItem('nombreCliente') || "",  
            lastName: localStorage.getItem('apellidoCliente')|| "",  // Apellidos restantes
            middleInitial: "",
            municipioDelegacion: this.checkoutForm.get('departamento')?.value.toUpperCase(),
            phoneNumber: localStorage.getItem('celularCliente') || "", 
            stateProvince: this.checkoutForm.get('departamento')?.value.toUpperCase(),
            zipCode: ""
          },
          cid_CVV2Response: "",
          comments: "",
          countryCode: "169",
          discount: 0,
          dniID: this.pedidoForm.get('cedulaCliente')?.value,
          expirationDate: "",
          freeShipping: "false",
          giftCertificateAmount: 0,
          giftWrapping: 0,
          invoice: "",
          ipAddress: "",
          valueTaxBenefit: "0.0000",
          languageId: 0,
          macAddress: "NO",
          memberId: "",
          message: "",
          orderDate: new Date().toISOString(),
          orderNumber: "",
          orderRecipient: {
            baseSubTotal: this.valorTotalFactura.toFixed(2),  
            discount: 0,
            giftMessageText: "",
            giftWrapping: 0,
            items: this.dataSource.map((producto, index) => ({
              itemNumber: (index + 1).toString(),
              barCode: "",
              discount: "0.0000",
              discountCode: "",
              discountName: "",
              genderId: "",
              genderName: "",
              giftCardExpirationDate: "0001-01-01T00:00:00.0000000-05:00",
              giftCardFromName: [],
              giftCardMessage: [],
              giftCardNumber: "",
              giftCardToEmailAddress: [],
              giftCardToName: [],
              giftCardVerification: 0,
              giftQuantity: 0,
              isGiftCard: "N",
              isGiftWrap: "N",
              isHardCopy: "N",
              isOnSale: "999",
              isOffer: "N",
              isTaxFree: "N",
              itemName: producto.descripcion,
              itemPrice: producto.valorUnitarioCatalogo.toFixed(2),
              price: producto.valorUnitarioCatalogo.toFixed(2),
              quantity: producto.cantidadSolicitada.toString(),
              salePrice: producto.valorUnitarioCatalogo.toFixed(2),
              sku: producto.referencia,
              epc: [],
              taxBenefit: "0"
            })),
            recipientId: 0,
            shipping: this.valorFlete.toFixed(2),
            shippingMethod: "",
            subTotal: this.valorMercanciaSinIVA.toFixed(2),
            tax: this.valorIVA.toFixed(2),
            total: this.valorTotalFactura.toFixed(2),
            address: {
              addressLine1: this.checkoutForm.get('direccionCliente')?.value.toUpperCase(),
              addressLine2: "",
              addressLine3: "",
              city: this.checkoutForm.get('ciudad')?.value.toUpperCase(),
              colonia: "",
              companyName: "",
              country: "COLOMBIA",
              emailAddress: localStorage.getItem('correoCliente') || "",  
              firstName: localStorage.getItem('nombreCliente') || "",  
              lastName: localStorage.getItem('apellidoCliente') || "",  
              middleInitial: "",
              municipioDelegacion: this.checkoutForm.get('departamento')?.value.toUpperCase(),
              phoneNumber: localStorage.getItem('celularCliente') || "",  
              stateProvince: this.checkoutForm.get('departamento')?.value.toUpperCase(),
              zipCode: ""
            },
            gifts: []
          },
          mediosPago: [{
            idtipo: "103",
            tipo: "VENTA CREDITO",
            valor: this.valorTotalFactura.toFixed(2),
            numero: numero,  
            aceptacion: aceptacion,
            modalidad: 16
          }],
          preauthDate: "",
          preauthorization: "",
          promotionCode: "",
          shipComplete: "",
          shipping: this.valorFlete.toFixed(2),
          status: "",
          subTotal: this.valorMercanciaSinIVA.toFixed(2),
          tax: this.valorIVA.toFixed(2),
          tenderBank: "",
          tenderCode: "CCD",
          tenderReference: "leonisa",
          total: this.valorTotalFactura.toFixed(2),
          transactionId: "",
          valuePrimeEstandar: this.valorFlete.toFixed(2),
          valuePrimeExpress: "OCULTAR",
          vendedor: "291024",
          tender3d: 0,
          uniqueLineWhatsApp: 0,
          cedulaEjecutiva: this.user.cedula
        };
        
        // Imprimir en consola el JSON construido
        console.log("JSON preparado para la venta:", JSON.stringify(jsonToLog));

       
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error de verificación',
          text: 'El código de verificación es incorrecto o ha expirado.',
        });
      }
    },
    error => {
      console.error("API request error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error en la solicitud',
        text: 'Ocurrió un error al verificar el token. Inténtalo de nuevo.',
      });
    }
  );
}


private encryptWithPublicKey(publicKeyBase64: string, textData: string): string {
  // Convertir la clave pública base64 en un formato PEM
  const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${publicKeyBase64}\n-----END PUBLIC KEY-----`;
  // Crear la clave pública a partir del PEM
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem) as forge.pki.rsa.PublicKey;

  // Convertir los datos de texto a bytes usando UTF-8
  const bytesPlainTextData = forge.util.encodeUtf8(textData);

  // Encriptar los datos con la clave pública utilizando RSA
  const bytesCipherText = publicKey.encrypt(bytesPlainTextData, 'RSAES-PKCS1-V1_5');

  // Convertir los datos cifrados a base64
  return forge.util.encode64(bytesCipherText);
}

loginAndGetToken() {
  console.log('login pos');
  
  // Llave pública en formato Base64
  this.publicKeyBase64 = `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAx/0C/ZVDH21kyFQc0qy4uBbAUph/3T0Bki73bJsNFXbvKhIi0LbbXADBoZQXJHG5WHdZSXK6h6Nj0JdGd1E45oBPk7pUmwu2hcGLO75/7i0a/N2yABd+xHqLWpezTz7ptsbDoiRfUFj/3kBgdm7xPV6ScSLKoSfVZGLyKlj0sZXhQnJgFB68Rp4cSYjq1zVw0j2FNNMuFhIMDuKGDfLuUuiFO1H7fX7P1pa7MV9AITt81wrI9LAXle9jMmc294TxFxtjIxlSkx5wX+9OHEJmvTEbEZ7POcB3rOm66n6juDmAiMFs+9ktkByq/YbkDlBsb4l3reFheFV2fV1DzzBC9QIDAQAB`;

  // Encriptación de datos con la llave pública
  const encryptedIdServicio = this.encryptWithPublicKey(this.publicKeyBase64, '291024');
  const encryptedClaveServicio = this.encryptWithPublicKey(this.publicKeyBase64, 'dyv558;');
  const encryptedIdTerminal = this.encryptWithPublicKey(this.publicKeyBase64, '7995');

  // Payload para la autenticación
  const loginPayload = {
    idservicio: encryptedIdServicio,
    claveservicio: encryptedClaveServicio,
    idterminal: encryptedIdTerminal,
  };

  // Llamada al servicio de autenticación usando subscribe
  this.securityService.authenticationservicePOS(loginPayload).subscribe(
    response => {
      if (response) {
        this.authToken = response.token;
        console.log("token pos", this.authToken);
        // Puedes realizar acciones adicionales con el token aquí
      }
    },
    error => {
      console.error("Error en autenticación:", error);
      // Manejo de errores si la autenticación falla
    }
  );
}





}

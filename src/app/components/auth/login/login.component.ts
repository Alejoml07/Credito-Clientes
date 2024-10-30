import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { SecurityService } from 'src/app/shared/service/security.service';
import { StorageService } from 'src/app/shared/service/storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  secretKey = "3cR#tK3y!9oP$uR3&6Fddsgt493H-o";
  public validarClickeado: boolean = false;
  showPassword: boolean = false;
  showAuthorizationCheckbox: boolean = true;
  mostrarAutorizacion: boolean = false;

  constructor(private securityService: SecurityService, private router: Router, private storageService: StorageService) { }

  ngOnInit() {
    this.loginForm = new FormGroup({
      // nit: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{8,10}$')]),
      nit: new FormControl(''),

      authorization: new FormControl(false),
      email: new FormControl('', [Validators.required]),
      pwd: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator
      ]),
    });

    // Si showAuthorizationCheckbox es falso, hacemos que el checkbox sea requerido
    if (!this.showAuthorizationCheckbox) {
      this.loginForm.get('authorization').setValidators(Validators.requiredTrue);
    }
  }

  passwordStrengthValidator(control: FormControl): { [key: string]: any } | null {
    const value = control.value || '';
    let error = null;
    if (!value.match(/(?=.*[0-9])/)) {
      error = { ...error, number: 'La contraseña debe tener números' };
    }
    if (!value.match(/(?=.*[A-Z])/)) {
      error = { ...error, uppercase: 'La contraseña debe tener una mayúscula' };
    }
    if (!value.match(/(?=.*[!@#$%^&*])/)) {
      error = { ...error, special: 'La contraseña debe tener un carácter especial' };
    }
    return error;
  }

  onLogin() {
    // if (this.loginForm.valid) {
      const formValue = this.loginForm.value;
      const encryptedPassword = this.encryptPassword(formValue.pwd);
  
      const loginPayload = {
        userLogonName: formValue.email,
        password: formValue.pwd,
        keyApp : "PCE"
        // keyApp : "CUSCE"


      };

      console.log(loginPayload); 
      const context = this;
      this.securityService.authenticationservice(loginPayload).subscribe({
        next: response => {
            console.log(response);
            if (response) {
                context.storageService.setItem('msauc_user', (response.token));
                context.storageService.setItem('fullName', (response.fullName));

                context.router.navigate(['/mi-portal/pedidos-online']);
            }
        },
        error: error => {
            console.error('There was an error!', error);
            this.AlertaFallo();

        }
    });
    // }
  }

  encryptPassword(pwd: string): string {
    const key = CryptoJS.enc.Utf8.parse(this.secretKey);
    const iv = CryptoJS.enc.Utf8.parse('IVGeneric');

    const encrypted = CryptoJS.AES.encrypt(pwd, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return encrypted.toString();
  }

  navigateToForgetPwd() {
    this.router.navigate(['/pages/forget/password']);
  }

  AlertaFallo() {
    Swal.fire({
      title: 'Correo Inválido',
      text: 'El correo no existe',
      icon: 'warning',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
  }

  AlertaAutorizacion() {
    Swal.fire({
      title: 'Autorización Inválida',
      text: 'Debes validar nuevamente los campos de autorización',
      icon: 'warning',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
  }




}

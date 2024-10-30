export interface Usuario {
    id: number;
    cedula: string;
    nombre: string;
    celular: string;
    email: string;
    contrasena: string;
    estado: string;
    fecha_cambio_estado: string;
    created_at: string;
    updated_at: string;
    agencia: null | string;
    empresa: string;
  }
  
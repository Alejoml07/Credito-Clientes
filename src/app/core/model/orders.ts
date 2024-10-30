export interface Orders {
    Id: string;
    Discriminator: string;
    FechaRedencion: string;
    InfoPuntosCedula: null | string; // Cambiar a tipo adecuado si no es null
    PuntosRedimidos: number;
    id: string;
    Envio: Envio;
    ProductosCarrito: ProductoCarrito[];
    Usuario: Usuario;
}

export interface Envio {
    Apellidos: string;
    Celular: string;
    Ciudad: string;
    Departamento: string;
    Direccion: string;
    Email: string;
    Id: null | string; // Cambiar a tipo adecuado si no es null
    Nombres: string;
    Observaciones: string;
}

export interface ProductoCarrito {
    Id: string;
    Alto: null | string; // Cambiar a tipo adecuado si no es null
    Ancho: null | string; // Cambiar a tipo adecuado si no es null
    Cantidad: number;
    Caracteristicas: string;
    CategoriaNombre: string;
    Color: string;
    Correo: string;
    Descripcion: string;
    EAN: string;
    Estado: number;
    FechaCreacion: null | string; // Cambiar a tipo adecuado si no es null
    FechaModificacion: null | string; // Cambiar a tipo adecuado si no es null
    FechaSincronizacion: null | string; // Cambiar a tipo adecuado si no es null
    Genero: null | string; // Cambiar a tipo adecuado si no es null
    ImagenPrincipal: null | string; // Cambiar a tipo adecuado si no es null
    Invima: null | string; // Cambiar a tipo adecuado si no es null
    Largo: null | string; // Cambiar a tipo adecuado si no es null
    Marca: string;
    Nombre: string;
    PalabrasClaves: null | string; // Cambiar a tipo adecuado si no es null
    Peso: null | number; // Cambiar a tipo adecuado si no es null
    Precio: number;
    PrecioOferta: number;
    Proveedor: string;
    Puntos: number;
    Quantity: number;
    Rating: null | number; // Cambiar a tipo adecuado si no es null
    Referencia: string;
    SubCategoriaNombre: string;
    Talla: string;
    Tamaño: null | string; // Cambiar a tipo adecuado si no es null
    TiempoEntrega: number;
    TipoIva: null | string; // Cambiar a tipo adecuado si no es null
    TipoPremio: string;
    UrlImagen1: string;
    UrlImagen2: string;
    UrlImagen3: null | string; // Cambiar a tipo adecuado si no es null
    UrlImagen4: null | string; // Cambiar a tipo adecuado si no es null
    UrlImagen5: null | string; // Cambiar a tipo adecuado si no es null
    Usuario: null | string; // Cambiar a tipo adecuado si no es null
    UsuarioModificacion: null | string; // Cambiar a tipo adecuado si no es null
    Video: null | string; // Cambiar a tipo adecuado si no es null
}

export interface Usuario {
    Agencia: null | string; // Cambiar a tipo adecuado si no es null
    Apellidos: string;
    Cedula: string;
    Celular: string;
    Contraseña: null | string; // Cambiar a tipo adecuado si no es null
    Email: string;
    Empresa: null | string; // Cambiar a tipo adecuado si no es null
    Estado: null | string; // Cambiar a tipo adecuado si no es null
    FechaActualizacion: null | string; // Cambiar a tipo adecuado si no es null
    FechaCambioEstado: null | string; // Cambiar a tipo adecuado si no es null
    FechaCreacion: null | string; // Cambiar a tipo adecuado si no es null
    Genero: string;
    Id: null | string; // Cambiar a tipo adecuado si no es null
    Nombres: string;
    TipoUsuario: null | string; // Cambiar a tipo adecuado si no es null
}

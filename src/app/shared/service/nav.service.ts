import { Injectable, HostListener, Inject } from '@angular/core';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { WINDOW } from "./windows.service";
// Menu
export interface Menu {
	path?: string;
	title?: string;
	icon?: string;
	type?: string;
	badgeType?: string;
	badgeValue?: string;
	active?: boolean;
	bookmark?: boolean;
	children?: Menu[];
}

@Injectable({
	providedIn: 'root'
})

export class NavService {

	public screenWidth: any
	public collapseSidebar: boolean = false

	constructor(@Inject(WINDOW) private window) {
		this.onResize();
		if (this.screenWidth < 991) {
			this.collapseSidebar = true
		}
	}

	// Windows width
	@HostListener("window:resize", ['$event'])
	onResize(event?) {
		this.screenWidth = window.innerWidth;
	}

	MENUITEMS: Menu[] = [
		// {
		// 	path: '/dashboard/default', title: 'Tablero', icon: 'home', type: 'link', badgeType: 'primary', active: false,children: [
		// 		{ path: '/productos/listar-productos', title: 'Listado de productos', type: 'link' },

		// 	]
		// },
		{
			title: 'Reporte de tabla Omnicanalidad', icon: 'bar-chart', type: 'link', active: false, path: '/pagina/gestor-contenido'
			// children: [
				// { path: '/datos/carga-masiva', title: 'Carga Masiva', type: 'link' ,badgeType: 'primary' },
				// { path: '/pagina/gestor-contenido', title: 'Reporte de tabla Oomnicanalidad', type: 'link' },
				// { path: '/vistas/plantilla-1', title: 'Platilla 1', type: 'link' },



			// ]
		},
		// {
		// 	title: 'Productos', icon: 'box', type: 'sub', active: false, children: [
		// 		{ path: '/productos/listar-productos', title: 'Listado de productos', type: 'link' },

		// 	]
		// },
		// {
		// 	title: 'Pedidos', icon: 'dollar-sign', type: 'sub', active: false, children: [
		// 		{ path: '/sales/orders', title: 'Órdenes', type: 'link' },
		// 		{ path: '/sales/carga-masiva-guia-transportadora', title: 'Carga masiva Enviado', type: 'link' },
		// 		{ path: '/sales/carga-masiva-pedido-entregado', title: 'Carga masiva Entregado', type: 'link' },
		// 		{ path: '/sales/garantias', title: 'Garantías', type: 'link' },



				// { path: '/sales/transactions', title: 'Productos', type: 'link' },
			// ]
		// },

		// {
		// 	title: 'Precios e Inventarios', icon: 'align-left', type: 'sub', active: false, children: [
		// 		{ path: '/codificacion/carga-masiva/inventario', title: 'Carga masiva de inventario', type: 'link' },
		// 		{ path: '/codificacion/carga-masiva/precios', title: 'Carga masiva de precios', type: 'link' },

		// 	]
		// },
		// {
		// 	title: 'Usuarios', icon: 'user-plus', type: 'sub', active: false, children: [
		// 		{ path: '/users/list-user', title: 'Listado de usuarios', type: 'link' },
		// 		{ path: '/users/puntos-user', title: 'Puntos manuales', type: 'link' },

		// 	]
		// },
		// {
		// 	title: 'Proveedores', icon: 'users', type: 'sub', active: false, children: [
		// 		{ path: '/proveedores/listar-proveedor', title: 'Listado de proveedores', type: 'link' },
		// 	]
		// },
		// {
		// 	title: 'Página', icon: 'settings', type: 'sub', active: false, children: [
		// 		{ path: '/gestor-contenido/contenido', title: 'Gestor de contenido', type: 'link' },
		// 	]
		// },
		// {
		// 	title: 'Reportes', icon: 'bar-chart', type: 'sub', active: false, children: [
		// 		{ path: '/reportes', title: 'Redenciones de usuarios', type: 'link' },
		// 		{ path: '/reportes/moviminetos', title: 'Movimientos de puntos', type: 'link' },
		// 		{ path: '/reportes/puntos', title: 'Información de puntos', type: 'link' },


		// 	]
		// },
		// {
		// 	title: 'Puntos de venta', icon: 'tag', type: 'sub', active: false, children: [
		// 		{ path: '/punto-venta/listar', title: 'Listado de punto de venta', type: 'link' },

		// 	]
		// },
		// {
		// 	title: 'Variables', icon: 'clipboard', type: 'sub', active: false, children: [
		// 		{ path: '/variables/listar', title: 'Listado de variables', type: 'link' },
		// 	]
		// },
		

		// {
		// 	title: 'Localization', icon: 'chrome', type: 'sub', children: [
		// 		{ path: '/localization/translations', title: 'Translations', type: 'link' },
		// 		{ path: '/localization/currency-rates', title: 'Currency Rates', type: 'link' },
		// 		{ path: '/localization/taxes', title: 'Taxes', type: 'link' },
		// 	]
		// },
		// {
		// 	title: 'Reports', path: '/reports', icon: 'bar-chart', type: 'link', active: false
		// },
		// {
		// 	title: 'Settings', icon: 'settings', type: 'sub', children: [
		// 		{ path: '/settings/profile', title: 'Profile', type: 'link' },
		// 	]
		// },
		// {
		// 	title: 'Invoice', path: '/invoice', icon: 'archive', type: 'link', active: false
		// },
	
	]
	// Array
	items = new BehaviorSubject<Menu[]>(this.MENUITEMS);


}

import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { NavService, Menu } from '../../service/nav.service';
import { SecurityService } from '../../service/security.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent {

  public menuItems: Menu[];
  public url: any;
  public fileurl: any;
  public user: any;

  

  constructor(private router: Router, public navServices: NavService, private securityService: SecurityService) {
    this.navServices.items.subscribe(menuItems => {
      this.menuItems = menuItems
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          menuItems.filter(items => {
            if (items.path === event.url)
              this.setNavActive(items)
            if (!items.children) return false
            items.children.filter(subItems => {
              if (subItems.path === event.url)
                this.setNavActive(subItems)
              if (!subItems.children) return false
              subItems.children.filter(subSubItems => {
                if (subSubItems.path === event.url)
                  this.setNavActive(subSubItems)
              })
            })
          })
        }
      })
    })

    
    this.user = this.securityService.getUserAuthenticatedNombre();
    console.log('user', this.user)
  }

  // filterMenuItemsByRole(menuItems: Menu[]): Menu[] {
  //  // Si el usuario es un superusuario, mostrar todos los elementos del menú
  // if (this.user.tipoUsuario === 'Super Usuario') {
  //   return menuItems;
  // } else {
  //   // Filtrar elementos permitidos para usuarios normales
  //   return menuItems.filter(item => {
  //     // Si el elemento tiene hijos, mostrarlo
  //     if (item.children && item.children.length > 0) {
  //       return true;
  //     }
  //     const allowedTitles = [
  //       'Dashboard',
  //       'Listado de productos',
  //       'Órdenes',
  //       'Carga masiva de inventario',
  //       'Carga masiva de precios'
  //     ];
  //     return allowedTitles.includes(item.title);
  //   });
  // }
  // }

  filterMenuItemsByRole(menuItems: Menu[]): Menu[] {
  if (this.user.tipoUsuario === 'Super Usuario') {
    return menuItems; // Mostrar todos los elementos del menú para el superusuario
  } else if (this.user.tipoUsuario === 'Administrador DLM') {
    // Filtrar elementos para el Administrador Retail
    return menuItems.filter(item => {
      if (['Puntos de venta', 'Variables'].includes(item.title)) {
        return false; // Ocultar elementos específicos para otros tipos de usuarios
      }
      return true;
    });
  } else {
    // Otros tipos de usuarios
    return menuItems.filter(item => {
      if (['Proveedores', 'Página', 'Reportes', 'Usuarios', 'Puntos de venta', 'Variables', 'Tablero' ].includes(item.title)) {
        return false; // Ocultar elementos específicos para otros tipos de usuarios
      }
      return true;
    });
  }
}


  // Active Nave state
  setNavActive(item) {
    this.menuItems.filter(menuItem => {
      if (menuItem != item)
        menuItem.active = false
      if (menuItem.children && menuItem.children.includes(item))
        menuItem.active = true
      if (menuItem.children) {
        menuItem.children.filter(submenuItems => {
          if (submenuItems.children && submenuItems.children.includes(item)) {
            menuItem.active = true
            submenuItems.active = true
          }
        })
      }
    })
  }

  // Click Toggle menu
  toggletNavActive(item) {
    if (!item.active) {
      this.menuItems.forEach(a => {
        if (this.menuItems.includes(item))
          a.active = false
        if (!a.children) return false
        a.children.forEach(b => {
          if (a.children.includes(item)) {
            b.active = false
          }
        })
      });
    }
    item.active = !item.active
  }

  //Fileupload
  readUrl(event: any) {
    if (event.target.files.length === 0)
      return;
    //Image upload validation
    var mimeType = event.target.files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }
    // Image upload
    var reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = (_event) => {
      this.url = reader.result;
    }
  }

}

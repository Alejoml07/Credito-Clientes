import { Injector } from '@angular/core';

export let appInjector: Injector;

export function setAppInjector(injector: Injector) {
    if (appInjector) {
        // Siempre debe haber solo una instancia de Injector global
        console.error('Intentando configurar el inyector de la aplicación dos veces');
    } else {
        appInjector = injector;
    }
}
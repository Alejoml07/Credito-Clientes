import { Component, Injector } from '@angular/core';
import { setAppInjector } from './shared/guards/injector/global-injector';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'multikart-backend';

  constructor( private injector: Injector) {
      setAppInjector(injector);
  }
}

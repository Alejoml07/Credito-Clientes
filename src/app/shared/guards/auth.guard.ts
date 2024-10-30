import { CanActivateFn, Router } from '@angular/router';
import { appInjector } from './injector/global-injector';

export const authGuard: CanActivateFn = (route, state) => {
  const router = appInjector.get(Router);

  const logueoData = localStorage.getItem("msauc_user");
  if (logueoData) {
    const response = JSON.parse(logueoData);
    const tkn = response;
    if (tkn) {
      return true;
    } else {
      router.navigate(['/auth/login']);
      return false;
    }
  }
  else{
    router.navigate(['/auth/login']);
    return false;
  }
};
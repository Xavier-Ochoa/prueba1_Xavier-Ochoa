import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { filter, firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async () => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  const session = await firstValueFrom(
    supabaseService.session$.pipe(filter(s => s !== undefined))
  );

  if (session) return true;

  router.navigateByUrl('/login', { replaceUrl: true });
  return false;
};

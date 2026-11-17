import { HttpClient } from '@angular/common/http';
import { Component, computed, ElementRef, HostListener, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { UserProfile } from '../../../core/auth/auth.models';
import { UserService } from '../../../user/user-service';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header  {
private readonly authService = inject(AuthService);
private readonly http = inject(HttpClient);
private readonly elementRef = inject(ElementRef<HTMLElement>);
private readonly userService = inject(UserService);


 protected readonly isMenuOpen = signal<boolean>(false);
 protected readonly  isAuthenticated = this.authService.isAuthenticated;
 protected readonly  isAdmin = computed(() => this.authService.hasRole('ROLE_ADMIN'));

 protected readonly user = this.authService.currentUser;
 protected readonly userProfile = toSignal(
   toObservable(computed(() => ({
     authenticated: !!this.user(),
     profileRefreshVersion: this.userService.profileRefreshVersion(),
   }))).pipe(
     switchMap(({ authenticated }) => authenticated ? this.http.get<UserProfile>('/api/users/me') : of(null))
   ),
   { initialValue: null }
 );

 readonly defaulImage = '/user-alt-1-svgrepo-com.svg';

  toggleUserMenu(): void {
    this.isMenuOpen.update(val => !val);
  }

  @HostListener('document:click', ['$event'])
  closeMenuOnOutsideClick(event: MouseEvent): void {
    const userMenu = this.elementRef.nativeElement.querySelector('.user-menu-container');
    if (!userMenu?.contains(event.target as Node)) {
      this.isMenuOpen.set(false);
    }
  }

  logout(): void {
 
    this.authService.logout();
    this.isMenuOpen.set(false); 
  }
}

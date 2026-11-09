import { HttpClient } from '@angular/common/http';
import { Component, computed, ElementRef, HostListener, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';
import { AuthService } from '../../../core/auth/services/auth.service';
import { UserProfile } from '../../../core/auth/models/auth.models';

@Component({
  imports: [],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header  {
private readonly authService = inject(AuthService);
private readonly http = inject(HttpClient);
private readonly elementRef = inject(ElementRef<HTMLElement>);


 protected readonly isMenuOpen = signal<boolean>(false);
 protected readonly  isAuthenticated = this.authService.isAuthenticated;
 protected readonly  isAdmin = computed(() => this.authService.hasRole('ROLE_ADMIN'));

 protected readonly user = this.authService.currentUser;
 protected readonly userProfile = toSignal(
   toObservable(this.user).pipe(
     switchMap(user => user ? this.http.get<UserProfile>('/api/users/me') : of(null))
   ),
   { initialValue: null }
 );

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

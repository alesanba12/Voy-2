import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Header } from './header';
import { AuthService } from '../../../core/auth/auth.service';
import { UserService } from '../../../user/user-service';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let getProfile: ReturnType<typeof vi.fn>;
  let profileRefreshVersion: ReturnType<typeof signal<number>>;

  beforeEach(async () => {
    getProfile = vi.fn()
      .mockReturnValueOnce(of({ imageUrl: 'old-image.png' }))
      .mockReturnValueOnce(of({ imageUrl: 'new-image.png' }));
    profileRefreshVersion = signal(0);

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([]),
        { provide: HttpClient, useValue: { get: getProfile } },
        {
          provide: AuthService,
          useValue: {
            currentUser: signal({ userId: 'user-id' }),
            isAuthenticated: signal(true),
            hasRole: () => false,
          },
        },
        { provide: UserService, useValue: { profileRefreshVersion } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('reloads the profile image when the profile is updated', async () => {
    expect(getProfile).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.querySelector('.user-avatar-btn img')?.getAttribute('src'))
      .toBe('old-image.png');

    profileRefreshVersion.update(version => version + 1);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(getProfile).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.querySelector('.user-avatar-btn img')?.getAttribute('src'))
      .toBe('new-image.png');
  });
});

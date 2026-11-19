import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { UserService } from '../user-service';
import { Following } from './following';

describe('Following', () => {
  let fixture: ComponentFixture<Following>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Following],
      providers: [
        provideRouter([]),
        {
          provide: UserService,
          useValue: {
            listFollowList: () =>
              of([{ externalId: 'organizer-id', username: 'Organizer' }]),
            listFollowedParties: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Following);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('links each followed organizer to their profile', () => {
    const profileLink: HTMLAnchorElement =
      fixture.nativeElement.querySelector('.organizer-profile-link');

    expect(profileLink.textContent).toContain('Ver perfil');
    expect(profileLink.getAttribute('href')).toBe(
      '/profile/organizerProfile/organizer-id',
    );
  });
});

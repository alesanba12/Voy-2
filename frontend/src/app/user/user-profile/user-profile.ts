import { Component, inject, OnInit } from '@angular/core';
import { UserDto} from '../user';
import { UserService } from '../user-service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  imports: [UserProfile],
  selector: 'app-user-profile',
  styleUrl: './user-profile.css',
  templateUrl: './user-profile.html',
})
export class UserProfile {
  private readonly userService = inject(UserService);

  private readonly currentUser=toSignal<UserDto | undefined>(this.userService.getCurrentUser(),{
    initialValue: undefined
  })
  

 

}


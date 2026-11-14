import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UserDto, UserFollowDto } from '../user';
import { Party } from '../../parties/party';

@Component({
  imports: [],
  selector: 'app-user-profile',
  styleUrl: './user-profile.css',
  templateUrl: './user-profile.html',
})
export class UserProfile {
  
}


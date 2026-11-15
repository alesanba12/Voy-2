export interface NewUserDto {
  email: string;
  username: string;
  bio: string;
  password: string;
  birthday: string;
}

export interface UserDto {
  username: string;
  email: string;
  bio: string;
  isOrganizer: boolean;
  imageUrl: string;
}

export interface UserFollowDto {
  externalId: string;
  username: string;
}

export interface UserUpdateDto {
  email: string;
  username: string;
  bio: string;
  password: string;
  image: FormData;
}

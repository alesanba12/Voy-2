export interface NewUserDto {
  email: string;
  username: string;
  bio?: string | null;
  password: string;
  birthdate: string;
}

export interface UserDto {
  externalId: string;
  username: string;
  email: string;
  bio: string;
  isOrganizer: boolean;
  imageUrl: string;
}

export interface UserFollowDto{
    externalId:string
    username:string
}

export interface PartySummaryDto {
  externalId: string;
  title: string;
  description: string;
  city: string;
  price: number;
  adress: string;
  dateTime: string;
  organizer: UserDto;
  imageUrl: string | null;
  tags: string[] | null;
}

export interface OrganizerVerifyReqDTO{
    dniFront:FormData 
    dniBack:FormData
    additionalInfo:string   
}


// export interface UserUpdateDto{
//     email:string
//     username:string
//     bio:string
//     password:string
//    // image:blob?
// }


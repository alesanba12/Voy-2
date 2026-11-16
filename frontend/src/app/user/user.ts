export interface NewUserDto{
    email:string
    username:string
    bio:string
    password:string
    birthday:string
}

export interface UserDto{
    username:string
    email:string
    bio:string
    isOrganizer:boolean
    imageUrl:string
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
}

export interface UserUpdateDto{
    email:string
    username:string
    bio:string
    password:string
   // image:blob?
}


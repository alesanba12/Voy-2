import { UserDto } from "../user/user";

export interface ReceiptResponseDto{
    externalId: string,
    price: number,
    quantity: number,
    paymentMethod: string,
    finalPrice: number,
    paymentDate: Date,
    status: boolean,
    user: UserDto,
}
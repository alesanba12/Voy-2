import { inject, Service } from '@angular/core';
import { UserDto, UserFollowDto } from './user';
import { PartyRes } from '../parties/party';
import { HttpClient, HttpParams } from '@angular/common/http';

@Service()
export class UserService {
    private readonly client = inject(HttpClient)
  private readonly url = '/api/users';

  getAll(username?: string, email?: string) {
    let params = new HttpParams();
    if (username) params = params.set('username', username);
    if (email) params = params.set('email', email);

    return this.client.get<UserDto[]>(this.url, { params });
  }

  // 2. Obtener perfil propio
  getCurrentUser() {
    return this.client.get<UserDto>(`${this.url}/me`);
  }

  // 3. Eliminar usuario por ID (Admin)
  deleteUserByAdmin(id: string | number) {
    return this.client.delete<void>(`${this.url}/${id}`);
  }

  // 4. Eliminar cuenta propia
  deleteUser() {
    return this.client.delete<void>(this.url);
  }

  // // 5. Actualizar usuario (envía FormData por el multipart/form-data)
  // updateUser(formData: FormData) {
  //   return this.client.put<UserDto>(`${this.url}/update`, formData);
  // }

  // 6. Listar usuarios seguidos
  listFollowList() {
    return this.client.get<UserFollowDto[]>(`${this.url}/follows`);
  }

  // 7. Seguir / dejar de seguir usuario
  alterFollowUser(idOtherUser: string | number) {
    return this.client.patch<UserFollowDto[]>(`${this.url}/follow/user/${idOtherUser}`, {});
  }

  // 8. Listar seguidores
  listFollowersList() {
    return this.client.get<UserFollowDto[]>(`${this.url}/followers`);
  }

  // 9. Listar mis eventos creados
  listMyParties() {
    return this.client.get<PartyRes[]>(`${this.url}/myParties`);
  }

  // 10. Listar eventos seguidos
  listFollowedParties() {
    return this.client.get<PartyRes[]>(`${this.url}/followParties`);
  }

  // 11. Seguir / dejar de seguir evento
  alterFollowParty(idParty: string | number) {
    return this.client.patch<PartyRes[]>(`${this.url}/follow/party/${idParty}`, {});
  }

  // 12. Listar mis tickets
  // listMyTickets() {
  //   return this.client.get<TicketU[]>(`${this.url}/myTickets`);
  // }

  // // 13. Listar mis recibos
  // listMyReceipts() {
  //   return this.client.get<ReceiptResponseDTO[]>(`${this.url}/myReceipts`);
  // }

  // 14. Promover usuario a organizador (Admin)
  promoteToOrganizer(idExternal: string | number) {
    return this.client.patch<UserDto>(`${this.url}/promote/${idExternal}`, {});
  }
}

import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Service, Signal } from '@angular/core';
import { UserDto, UserFilterParams } from '../../user/user';
import { lastValueFrom } from 'rxjs';

@Service()
export class UsersTableService {
    private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/users';

  /**
   * Recurso reactivo para listar usuarios.
   * Se re-ejecuta automáticamente cuando cambian los valores de la señal de filtros.
   */
  getUsersResource(filters: Signal<UserFilterParams>) {
    return httpResource<UserDto[]>(() => {
      const { username, email } = filters();
      const params: Record<string, string> = {};

      if (username?.trim()) params['username'] = username.trim();
      if (email?.trim()) params['email'] = email.trim();

      return {
        url: this.apiUrl,
        method: 'GET',
        params,
      };
    }, {
      defaultValue: [],
    });
  }

  /**
   * Elimina un usuario por su UUID externo (DELETE /api/users/{id})
   */
  deleteUserByAdmin(id: string) {
    return lastValueFrom(
      this.http.delete<void>(`${this.apiUrl}/${id}`)
    );
  }    
}

import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TagList } from '../../tags/tag-list/tag-list';
import { AdminService } from '../admin.service';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-admin-layout',
  styleUrl: './admin-layout.css',
  templateUrl: './admin-layout.html',
})
export class AdminLayout {

  private readonly service = inject(AdminService);

  protected readonly metrics = this.service.getAllMetrics();
  
}

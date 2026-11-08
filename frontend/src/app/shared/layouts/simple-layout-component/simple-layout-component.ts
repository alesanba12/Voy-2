import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [Header, RouterOutlet],
  selector: 'app-simple-layout-component',
  styleUrl: './simple-layout-component.css',
  templateUrl: './simple-layout-component.html',
})
export class SimpleLayoutComponent {}

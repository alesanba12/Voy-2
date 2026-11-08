import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { RouterOutlet } from '@angular/router';
import { Footer } from '../../components/footer/footer';

@Component({
  imports: [Header, RouterOutlet, Footer],
  selector: 'app-main-layout-component',
  styleUrl: './main-layout-component.css',
  templateUrl: './main-layout-component.html',
})
export class MainLayoutComponent {}

import { Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-loading-spinner',
  styleUrl: './loading-spinner.css',
  templateUrl: './loading-spinner.html',
})
export class LoadingSpinner {
  readonly fullScreen = input<boolean>(false);
  readonly label = input<string>('');
}

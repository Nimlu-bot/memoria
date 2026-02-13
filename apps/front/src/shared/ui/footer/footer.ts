import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'm-footer',
  standalone: true,
  templateUrl: './footer.html',
  styleUrl: './footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {}

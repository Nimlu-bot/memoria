import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Menu } from '../menu/menu';

@Component({
  selector: 'm-header',
  standalone: true,
  imports: [RouterLink, Menu],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {}

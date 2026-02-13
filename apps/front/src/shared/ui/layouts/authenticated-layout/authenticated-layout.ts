import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../header/header';
import { Footer } from '../../footer/footer';

@Component({
  selector: 'm-authenticated-layout',
  standalone: true,
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './authenticated-layout.html',
  styleUrl: './authenticated-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthenticatedLayout {}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserSettings } from '../../services/settings';

import { FormsModule } from '@angular/forms';
import {LocalizePipe} from '../../pipes/localization.pipe';
import {AsyncPipe} from '@angular/common'; // <-- Важно для [(ngModel)]

@Component({
  selector: 'app-settings-drawer',
  standalone: true,
  imports: [FormsModule, LocalizePipe, AsyncPipe], // <-- Добавляем FormsModule
  templateUrl: './settings-drawer.html',
  styleUrls: ['./settings-drawer.scss']
})
export class SettingsDrawerComponent {
  @Input() settings!: UserSettings; // Принимает текущие настройки
  @Input() isOpen = false; // Принимает состояние (открыт/закрыт)
  @Output() settingsChange = new EventEmitter<Partial<UserSettings>>(); // Сообщает об изменениях
  @Output() closeDrawer = new EventEmitter<void>(); // Сообщает о желании закрыться
}

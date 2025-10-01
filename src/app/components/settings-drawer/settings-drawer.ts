import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserSettings } from '../../services/settings';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Важно для [(ngModel)]

@Component({
  selector: 'app-settings-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule], // <-- Добавляем FormsModule
  templateUrl: './settings-drawer.html',
  styleUrls: ['./settings-drawer.scss']
})
export class SettingsDrawerComponent {
  @Input() settings!: UserSettings; // Принимает текущие настройки
  @Input() isOpen = false; // Принимает состояние (открыт/закрыт)
  @Output() settingsChange = new EventEmitter<Partial<UserSettings>>(); // Сообщает об изменениях
  @Output() closeDrawer = new EventEmitter<void>(); // Сообщает о желании закрыться
}

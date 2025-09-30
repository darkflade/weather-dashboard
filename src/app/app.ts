// src/app/app.ts
import { Component, OnInit } from '@angular/core';
// ...
import { SettingsService, UserSettings, Theme } from './services/settings.service';
// --- 1. Импортируем наш новый компонент ---
import { SettingsDrawerComponent } from './components/settings-drawer/settings-drawer.component';
import { distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ CommonModule, RouterOutlet, SettingsDrawerComponent ], // <-- Добавляем сюда
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  public weatherData$!: Observable<any>; // Поправь на OpenWeatherResponse
  public settings$: Observable<UserSettings>;
  public defaultCity = 'Moscow';

  // --- 2. Свойство для состояния drawer'а ---
  public isSettingsOpen = false;

  constructor(
    private weatherService: WeatherService,
    private settingsService: SettingsService
  ) {
    this.settings$ = this.settingsService.settings$;
  }

  ngOnInit(): void {
    this.weatherData$ = this.weatherService.getForecast(this.defaultCity);

    // --- 3. Подписываемся на смену темы, чтобы применять ее глобально ---
    this.settings$.pipe(
      map(settings => settings.theme),
      distinctUntilChanged()
    ).subscribe(theme => {
      this.settingsService.applyTheme(theme);
    });
  }

  // --- 4. Метод для обновления настроек из дочернего компонента ---
  onSettingsChange(newSettings: Partial<UserSettings>): void {
    this.settingsService.updateSettings(newSettings);
  }
}

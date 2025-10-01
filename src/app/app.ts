import { Component, HostBinding, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {Observable, Subscription, tap} from 'rxjs'; import { distinctUntilChanged, map } from 'rxjs/operators';

import { WeatherService } from './services/weather';
import { SettingsService, UserSettings } from './services/settings';
import { OpenWeatherResponse } from './weather.models';
import { SettingsDrawerComponent } from './components/settings-drawer/settings-drawer';

import { TemperaturePipe } from './pipes/temperature.pipe';
import { WindPipe } from './pipes/wind.pipe';
import { PressurePipe } from './pipes/pressure.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SettingsDrawerComponent,
    TemperaturePipe,
    WindPipe,
    PressurePipe
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit, OnDestroy {
  @HostBinding('class') public theme: string = 'dark-theme';

  public weatherData$!: Observable<OpenWeatherResponse>;
  public settings$: Observable<UserSettings>;
  public defaultCity = 'Novosibirsk';
  public isSettingsOpen = false;

  private isBrowser: boolean;
  private settingsSub!: Subscription;
  private mediaQueryListener!: (e: MediaQueryListEvent) => void;

  constructor(
    private weatherService: WeatherService,
    private settingsService: SettingsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.settings$ = this.settingsService.settings$;
  }

  ngOnInit(): void {
    this.weatherData$ = this.weatherService.getForecast(this.defaultCity).pipe(
      tap(data => console.log('Foreast: ', data))
    );

    if (this.isBrowser) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      this.mediaQueryListener = (e: MediaQueryListEvent) => {
        this.theme = e.matches ? 'dark-theme' : 'light-theme';
      };

      this.settingsSub = this.settings$.pipe(
        map(settings => settings.theme),
        distinctUntilChanged()
      ).subscribe(theme => {

        mediaQuery.removeEventListener('change', this.mediaQueryListener);

        if (theme === 'auto') {
          mediaQuery.addEventListener('change', this.mediaQueryListener);
          this.theme = mediaQuery.matches ? 'dark-theme' : 'light-theme';
        } else {
          this.theme = theme === 'dark' ? 'dark-theme' : 'light-theme';
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.settingsSub?.unsubscribe();
    if (this.isBrowser) {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', this.mediaQueryListener);
    }
  }

  onSettingsChange(newSettings: Partial<UserSettings>): void {
    this.settingsService.updateSettings(newSettings);
  }

  public getTempColor(temp: number): string {
    if (temp <= 20) {
      const percent = (temp + 40) / 60;
      const red = Math.round(0 * (1 - percent) + 144 * percent);
      const green = Math.round(100 * (1 - percent) + 238 * percent);
      const blue = Math.round(255 * (1 - percent) + 144 * percent);
      return `rgb(${red}, ${green}, ${blue})`;
    } else {
      const percent = (temp - 20) / 15;
      const red = Math.round(144 * (1 - percent) + 255 * percent);
      const green = Math.round(238 * (1 - percent) + 69 * percent);
      const blue = Math.round(144 * (1 - percent) + 81 * percent);
      return `rgb(${red}, ${green}, ${blue})`;
    }
  }

  public getPressureHint(pressureHpa: number): { text: string; className: string } {
    if (pressureHpa < 1009) return { text: 'пониженное', className: 'low' };
    if (pressureHpa > 1022) return { text: 'повышенное', className: 'high' };
    return { text: 'нормальное', className: 'normal' };
  }

}

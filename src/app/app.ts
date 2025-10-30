import {
  Component,
  HostBinding,
  OnInit,
  Inject,
  PLATFORM_ID,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {Observable, Subscription, tap, switchMap, BehaviorSubject, shareReplay, of, filter} from 'rxjs'; import {
  catchError,
  distinctUntilChanged, map
} from 'rxjs/operators';

// From node packages
import { TemperaturePipe } from './pipes/temperature.pipe';
import { WindPipe } from './pipes/wind.pipe';
import { PressurePipe } from './pipes/pressure.pipe';
import { Chart } from 'chart.js';

// From app packages /////////////////////////////////////////////////////////////////////
  // Data
import { OpenWeatherResponse, ExtendedWeatherListItem } from './models/weather.models';
import { SearchLocation } from './models/search.models';

  // Services
import { WeatherService } from './services/weather';
import { SettingsService, UserSettings } from './services/settings';
import { SearchService } from './services/search.service';
import { FavoritesService } from './services/favorites.service';

  // Pipes
import { DailyForecast, DailyForecastPipe } from './pipes/daily-forecast.pipe';

  // Utils
import { getTempColor, getPressureHint } from './utils/formatters.utils';
import { createForecastChart } from './utils/chart.utils';
import { getBackgroundImage } from './utils/background.utils';

  // Components
import { SettingsDrawerComponent } from './components/settings-drawer/settings-drawer';
import { FavoritesDrawer } from './components/favorites-drawer/favorites-drawer';
///////////////////////////////////////////////////////////////////////////////////////////


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SettingsDrawerComponent,
    FavoritesDrawer,
    DailyForecastPipe,
    TemperaturePipe,
    WindPipe,
    PressurePipe,
    FormsModule,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})


export class App implements OnInit, OnDestroy {
  @HostBinding('class') public theme!: string;

  private isBrowser: boolean;
  private settingsSub!: Subscription;
  private mediaQueryListener!: (e: MediaQueryListEvent) => void;

  ////////////////////////////////////////
  // Forecast properties
  // Weather and settings
  public weatherData$!: Observable<OpenWeatherResponse>;
  currentWeather$!: Observable<OpenWeatherResponse>;
  public settings$: Observable<UserSettings>;
  private city$ = new BehaviorSubject<SearchLocation | null>(null)
  ////////////////////////////////////////


  // Parameters for Drawers ////////////////////////////////////////////////////////////
  public isSettingsOpen = false;
  public isFavoritesOpen = false;
  //////////////////////////////////////////////////////////////////////////////////////

  // Daily weather properties /////////////////
  public todayForecast: DailyForecast | null = null; // Для карточки "Сегодня" (24 часа)
  public futureDaysForecast: DailyForecast[] = [];   // Для остальных 5 дней
  public selectedDayForecast: DailyForecast | null = null;
  //////////////////////////////////////////////


  // Extended Forecast //////////////////////////////////////////////////
  public extendedForecast: ExtendedWeatherListItem[] | null = null;
  public isExtendedForecastVisible = false;
  public isExtendedLoading = false;
  //////////////////////////////////////////////////////////////////////


  ////////////////////////////////////////
  // Search properties
  // SearchService options
  public searchQuery: string = '';
  public searchResults$: Observable<SearchLocation[]>;
  public isSearchListVisible: boolean = false;
  public searchHint: string | null = null;
  ////////////////////////////////////////


  //////////////////////////////////////////////////////////////////////
  // Chart options
  private chart!: Chart;
  private forecastDataToDraw: any[] | null = null;
  private currentForecastData: any[] | null = null;
  private canvasRef: ElementRef<HTMLCanvasElement> | null = null;
  @ViewChild('forecastChart') set chartCanvas(ref: ElementRef<HTMLCanvasElement> | undefined) {
    if (!this.isBrowser) return;

    if (ref && this.forecastDataToDraw) {
      this.canvasRef = ref
      if (this.chart) {
        this.chart.destroy();
      }
      this.renderChart();
      this.forecastDataToDraw = null;
    }
  }
  //////////////////////////////////////////////////////////////////////

  constructor(
    private weatherService: WeatherService,
    private settingsService: SettingsService,
    private favoritesService: FavoritesService,
    private searchService: SearchService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.settings$ = this.settingsService.settings$;
    this.searchResults$ = this.searchService.searchResults$;
  }

  ngOnInit(): void {

    ////////////////////////////
    // Get city from db (if its exist)
    (async () => {
      let initialCity: SearchLocation;

      const firstFavorite = await this.favoritesService.getFirstFavorite();

      if (firstFavorite) {
        initialCity = firstFavorite;
        console.log('Загружен город из избранного:', initialCity.city_en);
      } else {
        initialCity = {
          city_en: 'Algiers',
          city_ru: 'Алжир',
          lat: 36.7538,
          lon: 3.0588,
          country: 'DZ', // Код Алжира
          country_ru: 'Алжир'
        };
        console.log('Избранное пусто. Загружен город по умолчанию:', initialCity.city_en);
      }

      this.city$.next(initialCity);
    })();

    //////////////////////////// Current Weather ////////////////////////////
    this.weatherData$ = this.city$.pipe(
      filter((city): city is SearchLocation => !!city),
      switchMap(city =>
        this.weatherService.getForecast(city.lat, city.lon)
      ),
      shareReplay(1),
      catchError(error => {
        console.error(error);
        return [];
      }),
      tap(weather => {
        if (weather?.list?.length > 0) {
          const forecast = weather.list.slice(0, 8);

          console.log('Данные перехвачены через tap, сохраняю для графика');

          if (forecast.length > 0) {
            this.todayForecast = {
              date: new Date(),
              temp_min: Math.min(...forecast.map(h => h.main.temp_min)),
              temp_max: Math.max(...forecast.map(h => h.main.temp_max)),
              icon: forecast[0].weather[0].icon,
              hourly: forecast,
            };
          }

          this.futureDaysForecast = new DailyForecastPipe().transform(weather.list);

          if (this.todayForecast) {
            this.selectDay(this.todayForecast);
          }

          this.forecastDataToDraw = forecast;
          this.currentForecastData = forecast;
          this.renderChart();
        }
      })
    );

    this.currentWeather$ = this.weatherData$;

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
    this.renderChart();
    if (newSettings.language) {
      this.city$.next(this.city$.value); // "value" хранит последнее значение
    }
  }

  onSearchInput(): void {
    if (this.searchQuery.length < 2) {
      this.searchHint = 'Введите как минимум 2 символа...';
      this.searchService.clearSearchResults();
    } else {
      this.searchHint = null;
      this.searchService.handleSearchInput(this.searchQuery);
    }
  }

  selectCity(city: SearchLocation): void {
    const currentLang = this.settingsService.getCurrentSettings().language;
    const cityName = currentLang === 'ru' ? city.city_ru : city.city_en;

    this.searchQuery = cityName;
    this.searchService.clearSearchResults();
    this.isSearchListVisible = false;

    this.city$.next(city);

    this.isExtendedForecastVisible = false;
    this.extendedForecast = null;
  }

  getDisplayName(city: SearchLocation): string {
    const currentLang = this.settingsService.getCurrentSettings().language;
    return `${currentLang === 'ru' ? city.city_ru : city.city_en}, ${city.country_ru}`;
  }

  /** Управляем видимостью списка */
  onSearchFocus(): void {
    this.isSearchListVisible = true;
  }

  onSearchBlur(): void {
    setTimeout(() => {
      this.isSearchListVisible = false;
    }, 200);
  }

  private renderChart(): void {
    if (!this.isBrowser || !this.canvasRef || !this.currentForecastData) {
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = createForecastChart(
      this.canvasRef,
      this.currentForecastData,
      this.settingsService.getCurrentSettings()
    );
  }

  selectDay(day: DailyForecast): void {
    this.selectedDayForecast = day;
    this.currentForecastData = day.hourly;
    this.renderChart();
  }

  loadExtendedForecast(): void {
    const currentCity = this.city$.value;
    if (!currentCity) return;

    this.isExtendedLoading = true; // Показываем загрузчик
    this.isExtendedForecastVisible = true; // Сразу делаем блок видимым

    this.weatherService.getExtendedForecast(currentCity.lat, currentCity.lon)
      .subscribe(data => {
        // Убираем из 10-дневного прогноза сегодняшний день, чтобы не дублировать
        this.extendedForecast = data.list.slice(6);
        this.isExtendedLoading = false; // Прячем загрузчик

        this.cdr.markForCheck();
      });
  }

  addFavorite(location: SearchLocation, event: MouseEvent): void {
    event.stopPropagation();
    this.favoritesService.addFavorite(location);
  }

  // EXPORTED
  // Function for html template
  public getTempColor = getTempColor;
  public getPressureHint = getPressureHint;
  public getBackgroundImage = getBackgroundImage;

  //protected readonly location = location;
}

// src/app/services/weather.service.ts
import {Inject, Injectable, makeStateKey, PLATFORM_ID, TransferState} from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import {Observable, of, tap, throwError} from 'rxjs';
import { catchError } from 'rxjs/operators'; // <-- 1. Импортируем catchError
import {isPlatformServer} from '@angular/common';

import { environment } from '../../environments/environment';
import { OpenWeatherResponse, OpenWeatherResponseExtended } from '../models/weather.models';
import { SettingsService } from './settings';
import {generateMockExtendedWeather, generateMockWeather} from '../utils/mock.data';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private readonly apiUrl = environment.backendServerAddress;

  constructor(
    private http: HttpClient,
    private transferState: TransferState,
    private settingsService: SettingsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  public getForecast(lat: number, lon: number): Observable<OpenWeatherResponse> {
    if (environment.useMockWeather) {
      console.log('Using mock weather data (dev mode)');
      return of(generateMockWeather());
    }
    const key = makeStateKey<OpenWeatherResponse>(`forecast-${lat}-${lon}`);

    if (this.transferState.hasKey(key)) {
      const weather = this.transferState.get(key, null)!;
      this.transferState.remove(key);
      return of(weather);
    }

    const lang = this.settingsService.getCurrentSettings().language

    const params = new HttpParams()
      .set('lat', lat.toString())
      .set('lon', lon.toString())
      .set('units', 'metric')
      .set('lang', lang)
      .set('cnt', '8');

    console.log("Take forecast");
    const url = `${this.apiUrl}/forecast`;

    return this.http.get<OpenWeatherResponse>(url, { params }).pipe(
      tap(weather => {
        if (isPlatformServer(this.platformId)) {
          this.transferState.set(key, weather);
        }
      }),
      catchError(this.handleError)
    );
  }

  public getExtendedForecast(lat: number, lon: number): Observable<OpenWeatherResponseExtended> {
    if (environment.useMockWeather) {
      console.log('Using mock weather data (dev mode)');
      return of(generateMockExtendedWeather());
    }
    const key = makeStateKey<OpenWeatherResponseExtended>(`forecast-by-day-${lat}-${lon}`);
    if (this.transferState.hasKey(key)) {
      const weather = this.transferState.get(key, null)!;
      this.transferState.remove(key);
      return of(weather);
    }

    const lang = this.settingsService.getCurrentSettings().language;
    const params = new HttpParams()
      .set('lat', lat.toString())
      .set('lon', lon.toString())
      .set('units', 'metric')
      .set('lang', lang)
      .set('cnt', '12');

    const url = `${this.apiUrl}/daily-forecast`;

    return this.http.get<OpenWeatherResponseExtended>(url, { params }).pipe(
      tap(weather => {
        if (isPlatformServer(this.platformId)) {
          this.transferState.set(key, weather);
        }
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let userMessage = 'Не удалось загрузить данные о погоде. Попробуйте позже.';
    if (error.status === 401) {
      userMessage = 'Ошибка конфигурации: неверный API ключ.';
      console.error('SERVER LOG: Invalid API Key provided.');
    } else if (error.status === 404) {
      const cityName = error.url?.split('q=')[1]?.split('&')[0] || 'введенный город';
      userMessage = `Город "${decodeURIComponent(cityName)}" не найден.`;
    } else {
      console.error(`Backend returned code ${error.status}, body was: `, error.error);
    }
    return throwError(() => new Error(userMessage));
  }
}

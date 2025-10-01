// src/app/services/weather.service.ts
import {Inject, Injectable, makeStateKey, PLATFORM_ID, TransferState} from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import {Observable, of, tap, throwError} from 'rxjs';
import { catchError } from 'rxjs/operators'; // <-- 1. Импортируем catchError
import { environment } from '../../environments/environment';
import { OpenWeatherResponse } from '../weather.models';
import {isPlatformServer} from '@angular/common'; // <-- 1. Импортируем модель

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private readonly apiUrl = environment.owUrl;
  private readonly apiKey = environment.owKey;

  constructor(
    private http: HttpClient,
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  public getForecast(city: string): Observable<OpenWeatherResponse> {
    const key = makeStateKey<OpenWeatherResponse>('forecast-' + city);

    if (this.transferState.hasKey(key)) {
      const weather = this.transferState.get(key, null)!;
      this.transferState.remove(key);
      return of(weather);
    }

    const params = new HttpParams()
      .set('q', city)
      .set('appid', this.apiKey)
      .set('units', 'metric')
      .set('lang', 'en')
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

import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private readonly apiUrl = environment.owUrl;
  private readonly apiKey = environment.owKey;

  constructor(private http: HttpClient) { }

  public getForecast(city: string): Observable<any> {

    console.log('SERVER or subsequent navigation: Making API call.');
    const params = new HttpParams()
      .set('q', city)
      .set('appid', this.apiKey)
      .set('units', 'metric')
      .set('lang', 'ru');

    const url = `${this.apiUrl}/forecast`;
    return this.http.get<any>(url, { params });
  }

  private handleError(error: HttpErrorResponse) {
    // ... твой код обработки ошибок остается без изменений
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

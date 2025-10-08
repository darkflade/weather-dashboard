import { Injectable } from '@angular/core';
import {BehaviorSubject, debounceTime, Observable, Subject, switchMap} from 'rxjs';
import { SearchLocation } from '../models/search.models';
import {SettingsService} from './settings';
import {HttpClient, HttpParams} from '@angular/common/http';
import {distinctUntilChanged} from 'rxjs/operators';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  // --- Состояние сервиса ---

  // "Радиостанция", которая будет транслировать результаты поиска всем подписчикам
  private readonly apiUrl = environment.backendServerAddress;
  private searchResultsSubject = new BehaviorSubject<SearchLocation[]>([]);
  public searchResults$: Observable<SearchLocation[]> = this.searchResultsSubject.asObservable();
  private searchInput$ = new Subject<string>();

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {
    this.searchInput$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 2) {
          return [];
        }
        const lang = this.settingsService.getCurrentSettings().language;
        const params = new HttpParams().set('q', query).set('lang', lang);

        return this.http.get<SearchLocation[]>(`${this.apiUrl}/search`, { params });
      })
    ).subscribe(results => {
      this.searchResultsSubject.next(results);
    });
  }

  /**
   * Вызывается, когда пользователь вводит что-то в поле поиска.
   * @param query - Текущий текст из поля ввода.
   */
  public handleSearchInput(query: string): void {
    this.searchInput$.next(query);
  }

  /**
   * Вызывается, когда пользователь выбирает город.
   * Очищает результаты поиска.
   */
  public clearSearchResults(): void {
    this.searchResultsSubject.next([]);
  }
}

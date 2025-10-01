import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  // --- Состояние сервиса ---

  // "Радиостанция", которая будет транслировать результаты поиска всем подписчикам
  private searchResultsSubject = new BehaviorSubject<string[]>([]);
  public searchResults$: Observable<string[]> = this.searchResultsSubject.asObservable();

  constructor() { }

  /**
   * Вызывается, когда пользователь вводит что-то в поле поиска.
   * @param query - Текущий текст из поля ввода.
   */
  public handleSearchInput(query: string): void {
    if (query.length >= 2) {
      // --- ЗАГЛУШКА ---
      // В будущем здесь будет HTTP-запрос к API для поиска городов.
      // А пока просто имитируем результат.
      const results = [query];
      this.searchResultsSubject.next(results); // Отправляем результат в "радиостанцию"
    } else {
      this.searchResultsSubject.next([]); // Очищаем результаты
    }
  }

  /**
   * Вызывается, когда пользователь выбирает город.
   * Очищает результаты поиска.
   */
  public clearSearchResults(): void {
    this.searchResultsSubject.next([]);
  }
}

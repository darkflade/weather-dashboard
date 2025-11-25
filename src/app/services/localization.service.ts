import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class LocalizationService {
  public translations$ = new BehaviorSubject<any>({});

  constructor(private http: HttpClient) {}

  setLanguage(lang: string): void {
    const langPath = `./../assets/i18n/${lang}.json`;
    this.http.get<any>(langPath).subscribe({
      next: (data) => {
        this.translations$.next(data);
      },
      error: (err) => {
        console.error(`Не удалось загрузить файл перевода для языка: ${lang}`, err);
      }
    });
  }

  public translate(key: string): string {
    const keys = key.split('.');
    let result = this.translations$.getValue();

    for (const k of keys) {
      result = result[k];
      if (!result) {
        return key;
      }
    }

    return result;
  }
}

// src/app/services/settings.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core'; // <-- 1. Импортируем нужные инструменты
import { isPlatformBrowser } from '@angular/common'; // <-- 1. И этот тоже
import { BehaviorSubject, Observable } from 'rxjs';

// --- Определяем типы для всех настроек (без изменений) ---
export type TempUnit = 'C' | 'F';
export type WindUnit = 'ms' | 'kmh' | 'mph';
export type PressureUnit = 'hPa' | 'mmHg';
export type Theme = 'light' | 'dark' | 'auto';
export type Language = 'en' | 'ru';

export interface UserSettings {
  tempUnit: TempUnit;
  windUnit: WindUnit;
  pressureUnit: PressureUnit;
  theme: Theme;
  language: Language;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly storageKey = 'weather-app-settings';
  private isBrowser: boolean;

  private settingsSubject: BehaviorSubject<UserSettings>;
  public settings$: Observable<UserSettings>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.settingsSubject = new BehaviorSubject<UserSettings>(this.loadSettings());
    this.settings$ = this.settingsSubject.asObservable();
  }

  private getSystemDefaults(): UserSettings {
    let systemTheme: Theme = 'auto';
    let systemLang: Language = 'en';

    if (this.isBrowser) {
      systemTheme = 'auto';
      const browserLang = navigator.language.split('-')[0];
      systemLang = browserLang === 'ru' ? 'ru' : 'en';
    }

    return {
      tempUnit: 'C',
      windUnit: 'ms',
      pressureUnit: 'hPa',
      theme: systemTheme,
      language: systemLang,
    };
  }

  private loadSettings(): UserSettings {
    const defaults = this.getSystemDefaults();

    if (!this.isBrowser) {
      return defaults;
    }

    try {
      const savedSettings = localStorage.getItem(this.storageKey);
      return savedSettings ? { ...defaults, ...JSON.parse(savedSettings) } : defaults;
    } catch (e) {
      console.error('Error loading settings', e);
      return defaults;
    }
  }

  private saveAndBroadcast(newSettings: Partial<UserSettings>): void {
    const currentSettings = this.settingsSubject.value;
    const mergedSettings = { ...currentSettings, ...newSettings };

    if (this.isBrowser) {
      localStorage.setItem(this.storageKey, JSON.stringify(mergedSettings));
    }

    this.settingsSubject.next(mergedSettings);
  }

  public updateSettings(newSettings: Partial<UserSettings>): void {
    this.saveAndBroadcast(newSettings);
  }

  public getCurrentSettings(): UserSettings {
    return this.settingsSubject.getValue();
  }
}

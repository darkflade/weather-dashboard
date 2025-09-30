// src/app/services/settings.service.ts
import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// --- 1. Определяем типы для всех настроек ---
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

  // --- 2. Умные настройки по умолчанию ---
  private getSystemDefaults(): UserSettings {
    // Определяем тему системы
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const systemTheme: Theme = 'auto'; // По дефолту 'auto'

    // Определяем язык браузера
    const browserLang = navigator.language.split('-')[0];
    const systemLang: Language = browserLang === 'ru' ? 'ru' : 'en';

    return {
      tempUnit: 'C',
      windUnit: 'ms',
      pressureUnit: 'hPa',
      theme: systemTheme,
      language: systemLang,
    };
  }

  // --- 3. Используем BehaviorSubject для реактивности ---
  private settingsSubject: BehaviorSubject<UserSettings>;
  public settings$: Observable<UserSettings>;

  constructor() {
    // Инициализируем BehaviorSubject с настройками из localStorage или системными
    this.settingsSubject = new BehaviorSubject<UserSettings>(this.loadSettings());
    this.settings$ = this.settingsSubject.asObservable();
  }

  private loadSettings(): UserSettings {
    const defaults = this.getSystemDefaults();
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
    localStorage.setItem(this.storageKey, JSON.stringify(mergedSettings));
    this.settingsSubject.next(mergedSettings);
  }

  // --- 4. Единый метод для обновления любых настроек ---
  public updateSettings(newSettings: Partial<UserSettings>): void {
    this.saveAndBroadcast(newSettings);
  }

  // --- 5. Метод для применения темы ---
  // Он будет добавлять/убирать классы на <body> для глобального эффекта
  public applyTheme(theme: Theme): void {
    const body = document.body;
    body.classList.remove('light-theme', 'dark-theme');

    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      body.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
    } else {
      body.classList.add(theme === 'dark' ? 'dark-theme' : 'light-theme');
    }
  }
}

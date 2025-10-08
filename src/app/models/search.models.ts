// Эта модель описывает один объект из списка результатов поиска
export interface SearchLocation {
  city_en: string;
  city_ru: string;
  lat: number;
  lon: number;
  country: string;
  country_ru: string;
}

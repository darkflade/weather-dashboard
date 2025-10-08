// src/app/weather.models.ts

// Главный интерфейс ответа от OpenWeather /forecast
export interface OpenWeatherResponse {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherListItem[];
  city: City;
}

// Прогноз на конкретный момент времени (один из 40 в списке)
export interface WeatherListItem {
  dt: number;
  main: MainInfo;
  weather: WeatherInfo[];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  visibility: number;
  pop: number;
  sys: {
    pod: string;
  };
  dt_txt: string;
}

// Информация о городе
export interface City {
  id: number;
  name: string;
  coord: {
    lat: number;
    lon: number;
  };
  country: string;
  population: number;
  timezone: number;
  sunrise: number;
  sunset: number;
}

// Основные погодные данные (температура, влажность и т.д.)
export interface MainInfo {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  sea_level: number;
  grnd_level: number;
  humidity: number;
  temp_kf: number;
}

// Описание погоды (пасмурно, дождь и т.д.)
export interface WeatherInfo {
  id: number;
  main: string;
  description: string;
  icon: string;
}

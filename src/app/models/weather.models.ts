export interface OpenWeatherResponse {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherListItem[];
  city: City;
}

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
  rain?: {
    "3h": number;
  };
  snow?: {
    "3h": number;
  };
  sys: {
    pod: string;
  };
  dt_txt: string;
}

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

export interface WeatherInfo {
  id: number;
  main: string;
  description: string;
  icon: string;
}

// Extended Daily Forecast

export interface OpenWeatherResponseExtended {
  city: City;
  cod: string;
  message: number;
  cnt: number;
  list: ExtendedWeatherListItem[];
}

export interface TemperatureDetails {
  day: number;
  min: number;
  max: number;
  night: number;
  eve: number;
  morn: number;
}

export interface ExtendedWeatherListItem {
  dt: number;
  sunrise: number;
  sunset: number;
  temp: TemperatureDetails;
  feels_like: {
    day: number;
    night: number;
    eve: number;
    morn: number;
  };
  pressure: number;
  humidity: number;
  weather: WeatherInfo[];
  speed: number;
  deg: number;
  gust: number;
  clouds: number;
  pop: number;
  rain?: number;
}


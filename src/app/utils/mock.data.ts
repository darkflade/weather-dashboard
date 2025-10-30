import { OpenWeatherResponse, OpenWeatherResponseExtended, ExtendedWeatherListItem, WeatherInfo, TemperatureDetails } from '../models/weather.models';

export function generateMockWeather(): OpenWeatherResponse {
  const city = {
    id: Math.floor(Math.random() * 10000),
    name: "Testograd",
    coord: { lat: 55 + Math.random(), lon: 37 + Math.random() },
    country: "RU",
    population: 500000,
    timezone: 10800,
    sunrise: Date.now() / 1000 - 21600,
    sunset: Date.now() / 1000 + 21600,
  };

  const list = Array.from({ length: 42 }).map((_, i) => {
    const temp = 10 + Math.random() * 15;
    return {
      dt: Date.now() / 1000 + i * 10800,
      main: {
        temp,
        feels_like: temp - 1,
        temp_min: temp - 2,
        temp_max: temp + 2,
        pressure: 1000 + Math.random() * 20,
        sea_level: 1005,
        grnd_level: 998,
        humidity: 40 + Math.random() * 40,
        temp_kf: 0,
      },
      weather: [
        {
          id: 800,
          main: Math.random() > 0.5 ? "Rain" : "Clear",
          description: Math.random() > 0.5 ? "light rain" : "clear sky",
          icon: Math.random() > 0.7 ? "10d" : "01d",
        },
      ],
      clouds: { all: Math.floor(Math.random() * 100) },
      wind: {
        speed: 2 + Math.random() * 5,
        deg: Math.random() * 360,
        gust: 5 + Math.random() * 3,
      },
      visibility: 10000,
      pop: Math.random(),
      sys: { pod: "d" },
      dt_txt: new Date(Date.now() + i * 10800000).toISOString(),
    };
  });

  return {
    cod: "200",
    message: 0,
    cnt: list.length,
    list,
    city,
  };
}

export function generateMockExtendedWeather(): OpenWeatherResponseExtended {
  const now = Date.now();
  const list: ExtendedWeatherListItem[] = Array.from({ length: 12 }).map((_, i) => {
    const baseTime = now + i * 86400000; // каждый день
    const temp = generateTemperature();

    return {
      dt: baseTime / 1000,
      sunrise: (baseTime + 6 * 3600000) / 1000,
      sunset: (baseTime + 18 * 3600000) / 1000,
      temp,
      feels_like: {
        day: temp.day - 0.5,
        night: temp.night - 1,
        eve: temp.eve - 0.3,
        morn: temp.morn - 0.2,
      },
      pressure: randomInRange(990, 1025),
      humidity: randomInRange(40, 90),
      weather: [randomWeather()],
      speed: randomInRange(1, 6),
      deg: randomInRange(0, 360),
      gust: randomInRange(2, 8),
      clouds: randomInRange(0, 100),
      pop: Math.random(),
      rain: Math.random() > 0.7 ? randomInRange(0.1, 5) : undefined,
    };
  });

  return {
    city: {
      id: 101,
      name: 'Mock City',
      coord: { lat: 55.75, lon: 37.61 },
      country: 'XX',
      population: 1000000,
      timezone: 10800,
      sunrise: now / 1000 - 3600,
      sunset: now / 1000 + 3600,
    },
    cod: '200',
    message: 0,
    cnt: list.length,
    list,
  };
}

function randomInRange(min: number, max: number): number {
  return +(Math.random() * (max - min) + min).toFixed(1);
}

function randomWeather(): WeatherInfo {
  const weatherTypes = [
    { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' },
    { id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' },
    { id: 500, main: 'Rain', description: 'light rain', icon: '10d' },
    { id: 600, main: 'Snow', description: 'light snow', icon: '13d' },
  ];
  return weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
}

function generateTemperature(): TemperatureDetails {
  const day = randomInRange(10, 25);
  return {
    day,
    min: day - randomInRange(1, 3),
    max: day + randomInRange(1, 4),
    night: day - randomInRange(2, 5),
    eve: day + randomInRange(0, 2),
    morn: day - randomInRange(1, 2),
  };
}


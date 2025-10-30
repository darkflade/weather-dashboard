import { Pipe, PipeTransform } from '@angular/core';
import { WeatherListItem } from '../models/weather.models';

// Модель для одного дня в нашем сгруппированном прогнозе
export interface DailyForecast {
  date: Date;
  temp_min: number;
  temp_max: number;
  icon: string;
  hourly: WeatherListItem[];
}

@Pipe({
  name: 'dailyForecast',
  standalone: true
})
export class DailyForecastPipe implements PipeTransform {
  transform(value: WeatherListItem[] | null): DailyForecast[] {
    if (!value) {
      return [];
    }

    const todayDateString = new Date().toDateString();
    const grouped = new Map<string, WeatherListItem[]>();

    value.forEach(item => {
      const dateKey = new Date(item.dt_txt).toDateString();
      if (dateKey === todayDateString) {
        return;
      }
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(item);
    });

    const result: DailyForecast[] = [];
    grouped.forEach((hourly, dateString) => {
      result.push({
        date: new Date(dateString),
        temp_min: Math.min(...hourly.map(h => h.main.temp_min)),
        temp_max: Math.max(...hourly.map(h => h.main.temp_max)),
        icon: hourly.find(h => new Date(h.dt_txt).getHours() >= 12)?.weather[0].icon || hourly[0].weather[0].icon,
        hourly: hourly
      });
    });

    return result.slice(0, 5);
  }
}

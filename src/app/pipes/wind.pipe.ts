import { Pipe, PipeTransform } from '@angular/core';
import { WindUnit } from '../services/settings';

@Pipe({
  name: 'wind',
  standalone: true
})
export class WindPipe implements PipeTransform {
  transform(value: number, unit: WindUnit): number {
    switch (unit) {
      case 'kmh':
        // м/с в км/ч
        return value * 3.6;
      case 'mph':
        // м/с в мили/ч
        return value * 2.237;
      default:
        // По умолчанию м/с
        return value;
    }
  }
}

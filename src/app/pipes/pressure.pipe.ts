import { Pipe, PipeTransform } from '@angular/core';
import { PressureUnit } from '../services/settings';

@Pipe({
  name: 'pressure',
  standalone: true
})
export class PressurePipe implements PipeTransform {
  transform(value: number, unit: PressureUnit): number {
    if (unit === 'mmHg') {
      // гПа в мм рт. ст.
      return value * 0.750062;
    }
    // По умолчанию гПа
    return value;
  }
}

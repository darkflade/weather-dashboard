import { Pipe, PipeTransform } from '@angular/core';
import { TempUnit } from '../services/settings';

@Pipe({
  name: 'temperature',
  standalone: true
})
export class TemperaturePipe implements PipeTransform {
  transform(value: number, unit: TempUnit): number {
    if (unit === 'F') {
      return value * 9/5 + 32;
    }
    return value;
  }
}

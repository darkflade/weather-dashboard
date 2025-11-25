import { Pipe, PipeTransform } from '@angular/core';
import {LocalizationService} from '../services/localization.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Pipe({
  name: 'localize',
  standalone: true,
})
export class LocalizePipe implements PipeTransform {

  constructor(private localizationService: LocalizationService) {}

  transform(key: string): Observable<string> {
    return this.localizationService.translations$.pipe(
      map(translations => {
        const keys = key.split('.');
        let result = translations;
        for (const k of keys) {
          result = result?.[k];
        }
        return result || key;
      })
    );
  }

}

import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { liveQuery } from 'dexie';
import { Observable } from 'rxjs';
import { SearchLocation } from '../models/search.models';


export interface FavoriteLocation extends SearchLocation {
  id?: number;
  order: number;
}

class FavoritesDB extends Dexie {
  public favorites!: Dexie.Table<FavoriteLocation, number>;

  constructor() {
    super('WeatherAppFavoritesDB');
    this.version(1).stores({
      favorites: '++id, &[city_en+country], order',
    });
  }
}

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private db: FavoritesDB;

  public favorites$: Observable<FavoriteLocation[]>;

  constructor() {
    this.db = new FavoritesDB();
    this.favorites$ = new Observable(subscriber => {
      const query = liveQuery(() => this.getAllFavorites());
      const subscription = query.subscribe(subscriber);
      return () => subscription.unsubscribe();
    });
  }

  async getAllFavorites(): Promise<FavoriteLocation[]> {
    return this.db.favorites.orderBy('order').toArray();
  }

  async getFirstFavorite(): Promise<FavoriteLocation | undefined> {
    return this.db.favorites.where('order').equals(0).first();
  }

  async addFavorite(location: SearchLocation): Promise<void> {
    const maxOrder = await this.db.favorites.orderBy('order').last();
    const nextOrder = maxOrder ? maxOrder.order + 1 : 0;

    const newFavorite: FavoriteLocation = {
      ...location,
      order: nextOrder,
    };

    await this.db.favorites.put(newFavorite);
  }

  async deleteFavorite(id: number): Promise<void> {
    await this.db.favorites.delete(id);
  }

  async updateOrder(favorites: FavoriteLocation[]): Promise<void> {
    await this.db.transaction('rw', this.db.favorites, async () => {
      for (let i = 0; i < favorites.length; i++) {
        await this.db.favorites.update(favorites[i].id!, { order: i });
      }
    });
  }
}

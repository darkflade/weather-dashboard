import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Observable } from 'rxjs';
import { FavoriteLocation, FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-favorites-drawer',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './favorites-drawer.html',
  styleUrls: ['./favorites-drawer.scss']
})
export class FavoritesDrawer {
  @Input() isOpen = false;
  @Output() closeDrawer = new EventEmitter<void>();
  @Output() citySelected = new EventEmitter<FavoriteLocation>();

  public favorites$: Observable<FavoriteLocation[]>;

  constructor(private favoritesService: FavoritesService) {
    this.favorites$ = this.favoritesService.favorites$;
  }

  onDelete(id: number, event: MouseEvent): void {
    event.stopPropagation();
    this.favoritesService.deleteFavorite(id);
  }

  onSelect(favorite: FavoriteLocation): void {
    this.citySelected.emit(favorite);
    this.closeDrawer.emit();
  }

  onDrop(event: CdkDragDrop<FavoriteLocation[]>, favorites: FavoriteLocation[]): void {
    const reorderedFavorites = [...favorites];
    moveItemInArray(reorderedFavorites, event.previousIndex, event.currentIndex);
    this.favoritesService.updateOrder(reorderedFavorites);
  }
}

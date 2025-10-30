import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoritesDrawer } from './favorites-drawer';

describe('FavoritesDrawer', () => {
  let component: FavoritesDrawer;
  let fixture: ComponentFixture<FavoritesDrawer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoritesDrawer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavoritesDrawer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

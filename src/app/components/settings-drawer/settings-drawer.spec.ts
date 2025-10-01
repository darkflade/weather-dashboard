import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsDrawerComponent } from './settings-drawer';

describe('SettingsDrawer', () => {
  let component: SettingsDrawerComponent;
  let fixture: ComponentFixture<SettingsDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsDrawerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsDrawer } from './settings-drawer';

describe('SettingsDrawer', () => {
  let component: SettingsDrawer;
  let fixture: ComponentFixture<SettingsDrawer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsDrawer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsDrawer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

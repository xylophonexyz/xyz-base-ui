import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {FeatherIconComponent} from './feather-icon.component';
import {FeatherIconPipe} from '../feather-icon.pipe';

describe('FeatherIconComponent', () => {
  let component: FeatherIconComponent;
  let fixture: ComponentFixture<FeatherIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FeatherIconComponent, FeatherIconPipe]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatherIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

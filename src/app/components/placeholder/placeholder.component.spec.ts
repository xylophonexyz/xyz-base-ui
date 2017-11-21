import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {PlaceholderComponent} from './placeholder.component';

describe('PlaceholderComponent', () => {
  let component: PlaceholderComponent;
  let fixture: ComponentFixture<PlaceholderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PlaceholderComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaceholderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept input for size', () => {
    fixture.detectChanges();
    const initialSize = component.titleSize();
    component.size = 'md';
    fixture.detectChanges();
    expect(component.titleSize()).not.toEqual(initialSize);
    const nextSize = component.titleSize();
    component.size = 'lg';
    fixture.detectChanges();
    expect(component.titleSize()).not.toEqual(nextSize);
    component.size = null;
    fixture.detectChanges();
    expect(component.titleSize()).toEqual(initialSize);
  });
});

import {ChangeDetectionStrategy} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ModalComponent} from './modal.component';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalComponent]
    }).overrideComponent(ModalComponent, {
      set: {changeDetection: ChangeDetectionStrategy.Default}
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    component.show = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.modal')).toBeDefined();
  });

  it('should provide an onHide function as a handler', () => {
    expect(component.onHide).toBeDefined();
  });

  it('should respond to the show property by removing the root element from the DOM', () => {
    const compiled = fixture.debugElement.nativeElement;
    const el = compiled.querySelector('.modal');
    expect(el.classList).toContain('is-active');
    component.show = false;
    fixture.detectChanges();
    expect(compiled.querySelector('.modal')).toBeNull();
  });

  it('should call the onHide handler when emitClose is called', () => {
    spyOn(component.onHide, 'emit');
    component.emitClose();
    expect(component.onHide.emit).toHaveBeenCalled();
  });
});

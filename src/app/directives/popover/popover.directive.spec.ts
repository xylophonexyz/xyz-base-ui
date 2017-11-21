import {ChangeDetectionStrategy, Component, Injectable, OnDestroy, ViewChild} from '@angular/core';
import {ComponentFixture, inject, TestBed} from '@angular/core/testing';

import {By} from '@angular/platform-browser';
import {createGenericTestComponent} from '../../../test/common';
import {XzPopoverConfig} from './popover-config';
import {PopoverDirective, PopoverPanelComponent} from './popover.directive';
import {XzPopoverModule} from './popover.module';

@Injectable()
class SpyService {
  called = false;
}

const createTestComponent = (html: string) =>
  createGenericTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;

const createOnPushTestComponent =
  (html: string) => <ComponentFixture<TestOnPushComponent>>createGenericTestComponent(html, TestOnPushComponent);

describe('PopoverPanel', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({declarations: [TestComponent], imports: [XzPopoverModule.forRoot()]});
  });

  it('should render popover on top by default', () => {
    const fixture = TestBed.createComponent(PopoverPanelComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.classList).toContain('popover');
    expect(fixture.nativeElement.classList).toContain('popover-bottom');
  });

  it('should position popovers as requested', () => {
    const fixture = TestBed.createComponent(PopoverPanelComponent);
    fixture.componentInstance.placement = 'top';
    fixture.detectChanges();
    expect(fixture.nativeElement.classList).toContain('popover-top');
  });
});

describe('PopoverDirective', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, TestOnPushComponent, DestroyableComponent],
      imports: [XzPopoverModule.forRoot()],
      providers: [SpyService]
    });
  });

  function getWindow(element) {
    return element.querySelector('app-popover-panel');
  }

  describe('basic functionality', () => {

    it('should open and close a popover - default settings and content as string', () => {
      const fixture = createTestComponent(`<div xzPopover="Great tip!"></div>`);
      const directive = fixture.debugElement.query(By.directive(PopoverDirective));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl.classList).toContain('popover');
      expect(windowEl.classList).toContain('popover-top');
      expect(windowEl.textContent.trim()).toBe('Great tip!');
      expect(windowEl.getAttribute('role')).toBe('tooltip');
      expect(windowEl.getAttribute('id')).toMatch(/xz-popover-\d/);
      expect(windowEl.parentNode).toBe(fixture.nativeElement);
      expect(directive.nativeElement.getAttribute('aria-describedby')).toMatch(/xz-popover-\d/);

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
      expect(directive.nativeElement.getAttribute('aria-describedby')).toEqual('null');
    });

    it('should open and close a popover - default settings and content from a template', () => {
      const fixture = createTestComponent(`
          <ng-template #t>Hello, {{name}}!</ng-template>
          <div [xzPopover]="t"></div>`);
      const directive = fixture.debugElement.query(By.directive(PopoverDirective));
      const defaultConfig = new XzPopoverConfig();

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl.classList).toContain('popover');
      expect(windowEl.classList).toContain(`popover-${defaultConfig.placement}`);
      expect(windowEl.textContent.trim()).toBe('Hello, World!');
      expect(windowEl.getAttribute('role')).toBe('tooltip');
      expect(windowEl.getAttribute('id')).toMatch(/xz-popover-\d/);
      expect(windowEl.parentNode).toBe(fixture.nativeElement);
      expect(directive.nativeElement.getAttribute('aria-describedby')).toMatch(/xz-popover-\d/);

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
      expect(directive.nativeElement.getAttribute('aria-describedby')).toEqual('null');
    });

    it('should open and close a popover - default settings, content from a template and context supplied', () => {
      const fixture = createTestComponent(`
          <ng-template #t let-name="name">Hello, {{name}}!</ng-template>
          <div [xzPopover]="t"></div>`);
      const directive = fixture.debugElement.query(By.directive(PopoverDirective));
      const defaultConfig = new XzPopoverConfig();

      directive.context.popover.open({name: 'John'});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl.classList).toContain('popover');
      expect(windowEl.classList).toContain(`popover-${defaultConfig.placement}`);
      expect(windowEl.textContent.trim()).toBe('Hello, John!');
      expect(windowEl.getAttribute('role')).toBe('tooltip');
      expect(windowEl.getAttribute('id')).toMatch(/xz-popover-\d/);
      expect(windowEl.parentNode).toBe(fixture.nativeElement);
      expect(directive.nativeElement.getAttribute('aria-describedby')).toMatch(/xz-popover-\d/);

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
      expect(directive.nativeElement.getAttribute('aria-describedby')).toEqual('null');
    });

    it('should open and close a popover - default settings and no content', () => {
      const fixture = createTestComponent(`<div xzPopover></div>`);
      const directive = fixture.debugElement.query(By.directive(PopoverDirective));
      const defaultConfig = new XzPopoverConfig();

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl.classList).toContain('popover');
      expect(windowEl.classList).toContain(`popover-${defaultConfig.placement}`);
      expect(windowEl.textContent.trim()).toBe('');
      expect(windowEl.getAttribute('role')).toBe('tooltip');
      expect(windowEl.getAttribute('id')).toMatch(/xz-popover-\d/);
      expect(windowEl.parentNode).toBe(fixture.nativeElement);
      expect(directive.nativeElement.getAttribute('aria-describedby')).toMatch(/xz-popover-\d/);

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
      expect(directive.nativeElement.getAttribute('aria-describedby')).toEqual('null');
    });

    it('should properly destroy TemplateRef content', () => {
      const fixture = createTestComponent(`
          <ng-template #t><app-destroyable-cmpt></app-destroyable-cmpt></ng-template>
          <div [xzPopover]="t"></div>`);
      const directive = fixture.debugElement.query(By.directive(PopoverDirective));
      const spyService = fixture.debugElement.injector.get(SpyService);

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();
      expect(spyService.called).toBeFalsy();

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
      expect(spyService.called).toBeTruthy();
    });

    it('should allow re-opening previously closed popovers', () => {
      const fixture = createTestComponent(`<div xzPopover="Great tip!"></div>`);
      const directive = fixture.debugElement.query(By.directive(PopoverDirective));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();
    });

    it('should not leave dangling popovers in the DOM', () => {
      const fixture = createTestComponent(
        `<ng-template [ngIf]="show"><div xzPopover="Great tip!"></div></ng-template>`);
      const directive = fixture.debugElement.query(By.directive(PopoverDirective));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      fixture.componentInstance.show = false;
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

    it('should properly cleanup popovers with manual triggers', () => {
      const fixture = createTestComponent(`<ng-template [ngIf]="show">
                                            <div xzPopover="Great tip!" triggers="manual" #p="xzPopover" (mouseenter)="p.open()"></div>
                                        </ng-template>`);
      const directive = fixture.debugElement.query(By.directive(PopoverDirective));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      fixture.componentInstance.show = false;
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });
  });


  describe('positioning', () => {

    it('should use requested position', () => {
      const fixture = createTestComponent(`<div xzPopover="Great tip!" placement="top"></div>`);
      const directive = fixture.debugElement.query(By.directive(PopoverDirective));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      const windowEl = getWindow(fixture.nativeElement);

      expect(windowEl.classList).toContain('popover');
      expect(windowEl.classList).toContain('popover-top');
      expect(windowEl.textContent.trim()).toBe('Great tip!');
    });
  });

  describe('container', () => {

    it('should be appended to the element matching the selector passed to "container"', () => {
      const selector = 'body';
      const fixture = createTestComponent(`<div xzPopover="Great tip!" container="` + selector + `"></div>`);
      const directive = fixture.debugElement.query(By.directive(PopoverDirective));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
      expect(getWindow(window.document.querySelector(selector))).not.toBeNull();
    });

    it('should properly destroy popovers when the "container" option is used', () => {
      const selector = 'body';
      const fixture =
        createTestComponent(`<div *ngIf="show" xzPopover="Great tip!" container="` + selector + `"></div>`);
      const directive = fixture.debugElement.query(By.directive(PopoverDirective));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();

      expect(getWindow(document.querySelector(selector))).not.toBeNull();
      fixture.componentRef.instance.show = false;
      fixture.detectChanges();
      expect(getWindow(document.querySelector(selector))).toBeNull();
    });

  });

  describe('visibility', () => {
    it('should emit events when showing and hiding popover', () => {
      const fixture = createTestComponent(
        `<div xzPopover="Great tip!" triggers="click" (shown)="shown()" (hidden)="hidden()"></div>`);
      const directive = fixture.debugElement.query(By.directive(PopoverDirective));

      const shownSpy = spyOn(fixture.componentInstance, 'shown');
      const hiddenSpy = spyOn(fixture.componentInstance, 'hidden');

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();
      expect(shownSpy).toHaveBeenCalled();

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
      expect(hiddenSpy).toHaveBeenCalled();
    });

    it('should not emit close event when already closed', () => {
      const fixture = createTestComponent(
        `<div xzPopover="Great tip!" triggers="manual" (shown)="shown()" (hidden)="hidden()"></div>`);

      const shownSpy = spyOn(fixture.componentInstance, 'shown');
      const hiddenSpy = spyOn(fixture.componentInstance, 'hidden');

      fixture.componentInstance.popover.open();
      fixture.detectChanges();

      fixture.componentInstance.popover.open();
      fixture.detectChanges();

      expect(getWindow(fixture.nativeElement)).not.toBeNull();
      expect(shownSpy).toHaveBeenCalled();
      expect(shownSpy.calls.count()).toEqual(1);
      expect(hiddenSpy).not.toHaveBeenCalled();
    });

    it('should not emit open event when already opened', () => {
      const fixture = createTestComponent(
        `<div xzPopover="Great tip!" triggers="manual" (shown)="shown()" (hidden)="hidden()"></div>`);

      const shownSpy = spyOn(fixture.componentInstance, 'shown');
      const hiddenSpy = spyOn(fixture.componentInstance, 'hidden');

      fixture.componentInstance.popover.close();
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
      expect(shownSpy).not.toHaveBeenCalled();
      expect(hiddenSpy).not.toHaveBeenCalled();
    });

    it('should report correct visibility', () => {
      const fixture = createTestComponent(`<div xzPopover="Great tip!" triggers="manual"></div>`);
      fixture.detectChanges();

      expect(fixture.componentInstance.popover.isOpen()).toBeFalsy();

      fixture.componentInstance.popover.open();
      fixture.detectChanges();
      expect(fixture.componentInstance.popover.isOpen()).toBeTruthy();

      fixture.componentInstance.popover.close();
      fixture.detectChanges();
      expect(fixture.componentInstance.popover.isOpen()).toBeFalsy();
    });
  });

  describe('triggers', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({declarations: [TestComponent], imports: [XzPopoverModule.forRoot()]});
    });

    it('should support toggle triggers', () => {
      const fixture = createTestComponent(`<div xzPopover="Great tip!" triggers="click"></div>`);
      const directive = fixture.debugElement.query(By.directive(PopoverDirective));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

    it('should non-default toggle triggers', () => {
      const fixture = createTestComponent(`<div xzPopover="Great tip!" triggers="mouseenter:click"></div>`);
      const directive = fixture.debugElement.query(By.directive(PopoverDirective));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

    it('should support multiple triggers', () => {
      const fixture = createTestComponent(`<div xzPopover="Great tip!" triggers="mouseenter:mouseleave click"></div>`);
      const directive = fixture.debugElement.query(By.directive(PopoverDirective));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

    it('should not use default for manual triggers', () => {
      const fixture = createTestComponent(`<div xzPopover="Great tip!" triggers="manual"></div>`);
      const directive = fixture.debugElement.query(By.directive(PopoverDirective));

      directive.triggerEventHandler('mouseenter', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

    it('should allow toggling for manual triggers', () => {
      const fixture = createTestComponent(`
                <div xzPopover="Great tip!" triggers="manual" #t="xzPopover"></div>
                <button (click)="t.toggle()">T</button>`);
      const button = fixture.nativeElement.querySelector('button');

      button.click();
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      button.click();
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

    it('should allow open / close for manual triggers', () => {
      const fixture = createTestComponent(`<div xzPopover="Great tip!" triggers="manual" #t="xzPopover"></div>
                <button (click)="t.open()">O</button>
                <button (click)="t.close()">C</button>`);
      const buttons = fixture.nativeElement.querySelectorAll('button');

      buttons[0].click();  // open
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      buttons[1].click();  // close
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });

    it('should not throw when open called for manual triggers and open popover', () => {
      const fixture = createTestComponent(`
                <div xzPopover="Great tip!" triggers="manual" #t="xzPopover"></div>
                <button (click)="t.open()">O</button>`);
      const button = fixture.nativeElement.querySelector('button');

      button.click();  // open
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      button.click();  // open
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();
    });

    it('should not throw when closed called for manual triggers and closed popover', () => {
      const fixture = createTestComponent(`
                <div xzPopover="Great tip!" triggers="manual" #t="xzPopover"></div>
                <button (click)="t.close()">C</button>`);
      const button = fixture.nativeElement.querySelector('button');

      button.click();  // close
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });
  });

  describe('Custom config', () => {
    let config: XzPopoverConfig;

    beforeEach(() => {
      TestBed.configureTestingModule({imports: [XzPopoverModule.forRoot()]});
      TestBed.overrideComponent(TestComponent, {set: {template: `<div xzPopover="Great tip!"></div>`}});
    });

    beforeEach(inject([XzPopoverConfig], (c: XzPopoverConfig) => {
      config = c;
      config.placement = 'bottom';
      config.triggers = 'hover';
      config.container = 'body';
    }));

    it('should initialize inputs with provided config', () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const popover = fixture.componentInstance.popover;

      expect(popover.placement).toBe(config.placement);
      expect(popover.triggers).toBe(config.triggers);
      expect(popover.container).toBe(config.container);
    });
  });

  describe('Custom config as provider', () => {
    const config = new XzPopoverConfig();
    config.placement = 'bottom';
    config.triggers = 'hover';

    beforeEach(() => {
      TestBed.configureTestingModule(
        {imports: [XzPopoverModule.forRoot()], providers: [{provide: XzPopoverConfig, useValue: config}]});
    });

    it('should initialize inputs with provided config as provider', () => {
      const fixture = createTestComponent(`<div xzPopover="Great tip!"></div>`);
      const popover = fixture.componentInstance.popover;

      expect(popover.placement).toBe(config.placement);
      expect(popover.triggers).toBe(config.triggers);
    });
  });

  describe('Window resize', () => {
    it('should have a window resize listener with a host binding', () => {
      const fixture = createTestComponent(`<div xzPopover="Great tip!"></div>`);
      const popover = fixture.componentInstance.popover;
      expect(() => {
        popover.windowDidResize();
      }).not.toThrow();
    });
  });

  describe('Closing on outside click', () => {

    beforeEach(() => {
      TestBed.configureTestingModule({declarations: [TestComponent], imports: [XzPopoverModule.forRoot()]});
    });

    it('should close an open popover on outside click', () => {
      const fixture = createTestComponent(`
                <div xzPopover="Great tip!" triggers="click"></div>
                <button>outside</button>`
      );
      const directive = fixture.debugElement.query(By.directive(PopoverDirective));

      directive.triggerEventHandler('click', {});
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).not.toBeNull();

      fixture.componentInstance.popover['_outsideClickIsStable'] = true;

      const button = fixture.nativeElement.querySelector('button');
      button.click();
      fixture.detectChanges();
      expect(getWindow(fixture.nativeElement)).toBeNull();
    });
  });
});

@Component({selector: 'app-test-cmpt', template: ``})
class TestComponent {
  name = 'World';
  show = true;
  title: string;
  placement: string;

  @ViewChild(PopoverDirective) popover: PopoverDirective;

  shown() {
  }

  hidden() {
  }
}

@Component({selector: 'app-test-onpush-cmpt', changeDetection: ChangeDetectionStrategy.OnPush, template: ``})
class TestOnPushComponent {
}

@Component({selector: 'app-destroyable-cmpt', template: 'Some content'})
class DestroyableComponent implements OnDestroy {
  constructor(private _spyService: SpyService) {
  }

  ngOnDestroy(): void {
    this._spyService.called = true;
  }
}

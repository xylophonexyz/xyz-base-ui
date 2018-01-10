import {ChangeDetectorRef} from '@angular/core';
import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {DomSanitizer} from '@angular/platform-browser';
import {componentCollectionServiceStub} from '../../../test/stubs/component-collection.stub.spec';
import {componentServiceStub} from '../../../test/stubs/component.service.stub.spec';
import {footerNotifierStub} from '../../../test/stubs/footer-notifier.service.stub.spec';
import {NavActionItem} from '../../models/nav-action-item';
import {ComponentCollectionService} from '../../providers/component-collection.service';
import {ComponentService} from '../../providers/component.service';
import {FooterDelegateService} from '../../providers/footer-delegate.service';
import {MessageChannelDelegateService} from '../../providers/message-channel.service';

import {SpacerLayoutOption, UISpacerComponent} from './spacer-component.component';
import {mockDomSanitizer} from '../../../test/stubs/dom-sanitizer.stub.spec';
import {UtilService} from '../../providers/util.service';
import {WindowRefService} from '../../providers/window-ref.service';

describe('UISpacerComponent', () => {
  let component: UISpacerComponent;
  let fixture: ComponentFixture<UISpacerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UISpacerComponent],
      providers: [
        {provide: FooterDelegateService, useValue: footerNotifierStub},
        {provide: ComponentService, useValue: componentServiceStub},
        {provide: ComponentCollectionService, useValue: componentCollectionServiceStub},
        {provide: DomSanitizer, useValue: mockDomSanitizer},
        MessageChannelDelegateService,
        UtilService,
        WindowRefService,
        ChangeDetectorRef,
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UISpacerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should provide a setter to set a layout', () => {
    expect(component.layout).toEqual(SpacerLayoutOption.Dots);
    component.layout = SpacerLayoutOption.Empty;
    expect(component.layout).toEqual(SpacerLayoutOption.Empty);
  });

  it('should call emitHideOptions() conditionally', () => {
    const footer = getTestBed().get(FooterDelegateService);
    spyOn(footer, 'clearCenterActionItems');
    component.canHideFooterConfig = false;
    component.emitHideOptions();
    expect(footer.clearCenterActionItems).not.toHaveBeenCalled();
    component.canHideFooterConfig = true;
    component.emitHideOptions();
    expect(footer.clearCenterActionItems).toHaveBeenCalled();
  });

  it('should provide a custom configuration that gets added to the footer if it has a config', () => {
    expect(component.configuration().length).toBeGreaterThan(0);
  });

  it('should provide a getter that returns its layout options', () => {
    const layout = component.layoutOptions;
    expect(layout).toEqual([
      SpacerLayoutOption.Dots,
      SpacerLayoutOption.Empty,
    ]);
  });

  describe('Configuration Options', () => {
    it('should provide a NavActionItem with an input to receive custom background color', () => {
      const bgConfig = component.configuration()[0] as NavActionItem;
      expect(bgConfig.isInput()).toEqual(true);
      const event = {target: {value: '#000000'}} as any;
      expect(component.bgColor).toBeUndefined();
      bgConfig.onInputChange(event);
      expect(component.bgColor).toEqual('#000000');
    });

    it('should handle blur events on bg color input and update footer', async(() => {
      const bgConfig = component.configuration()[0];
      expect(bgConfig.onInputBlur).toBeDefined();

      const footer = getTestBed().get(FooterDelegateService);
      spyOn(footer, 'clearCenterActionItems');
      component.canHideFooterConfig = false;
      bgConfig.onInputBlur(null);
      expect(component.canHideFooterConfig).toEqual(true);
      setTimeout(() => {
        expect(footer.clearCenterActionItems).toHaveBeenCalled();
      });
    }));

    it('should provide a NavActionItem with an input to receive custom padding value', () => {
      const paddingConfig = component.configuration()[1] as NavActionItem;
      expect(paddingConfig.isInput()).toEqual(true);
      const event = {target: {value: '5'}} as any;
      expect(component.padding).toEqual(3);
      paddingConfig.onInputChange(event);
      expect(component.padding).toEqual(5);
    });

    it('should accept float values for padding', () => {
      const paddingConfig = component.configuration()[1] as NavActionItem;
      expect(paddingConfig.isInput()).toEqual(true);
      const event = {target: {value: '1.2'}} as any;
      expect(component.padding).toEqual(3);
      paddingConfig.onInputChange(event);
      expect(component.padding).toEqual(1.2);
    });

    it('should set a default value for padding', () => {
      expect(component.padding).toEqual(3);
    });

    it('should handle blur events on padding input and update footer', async(() => {
      const paddingConfig = component.configuration()[1];
      expect(paddingConfig.onInputBlur).toBeDefined();

      const footer = getTestBed().get(FooterDelegateService);
      spyOn(footer, 'clearCenterActionItems');
      component.canHideFooterConfig = false;
      paddingConfig.onInputBlur(null);
      expect(component.canHideFooterConfig).toEqual(true);
      setTimeout(() => {
        expect(footer.clearCenterActionItems).toHaveBeenCalled();
      });
    }));

    it('should clamp padding values to 1', () => {
      const paddingConfig = component.configuration()[1] as NavActionItem;
      expect(paddingConfig.isInput()).toEqual(true);
      const event = {target: {value: '-99'}} as any;
      paddingConfig.onInputChange(event);
      expect(component.padding).toEqual(1);
    });

    it('should handle focus events and prevent the footer options from hiding', () => {
      const bgConfig = component.configuration()[0];
      const paddingConfig = component.configuration()[1];
      expect(paddingConfig.onInputFocus).toBeDefined();
      component.canHideFooterConfig = true;
      paddingConfig.onInputFocus(null);
      expect(component.canHideFooterConfig).toEqual(false);

      component.canHideFooterConfig = true;
      bgConfig.onInputFocus(null);
      expect(component.canHideFooterConfig).toEqual(false);
    });
  });
});

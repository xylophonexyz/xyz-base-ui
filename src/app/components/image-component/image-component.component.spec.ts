import {ChangeDetectorRef} from '@angular/core';
import {async, ComponentFixture, fakeAsync, getTestBed, TestBed, tick} from '@angular/core/testing';
import {DomSanitizer} from '@angular/platform-browser';
import {componentCollectionServiceStub} from '../../../test/stubs/component-collection.stub.spec';
import {componentServiceStub} from '../../../test/stubs/component.service.stub.spec';
import {footerNotifierStub} from '../../../test/stubs/footer-notifier.service.stub.spec';
import {NavActionItem} from '../../models/nav-action-item';
import {ComponentCollectionService} from '../../providers/component-collection.service';
import {ComponentService} from '../../providers/component.service';
import {FooterDelegateService} from '../../providers/footer-delegate.service';
import {MessageChannelDelegateService} from '../../providers/message-channel.service';
import {UIComponent} from '../component/component.component';
import {SpinnerComponent} from '../spinner/spinner.component';

import {ImageLayoutOption, UIImageComponent} from './image-component.component';
import {mockDomSanitizer} from '../../../test/stubs/dom-sanitizer.stub.spec';
import {UtilService} from '../../providers/util.service';
import {WindowRefService} from '../../providers/window-ref.service';
import {Observable} from 'rxjs/Observable';
import {windowRefStub} from '../../../test/stubs/window-ref.stub.spec';

describe('UIImageComponent', () => {
  let component: UIImageComponent;
  let fixture: ComponentFixture<UIImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UIImageComponent, SpinnerComponent],
      providers: [
        {provide: FooterDelegateService, useValue: footerNotifierStub},
        {provide: ComponentService, useValue: componentServiceStub},
        {provide: ComponentCollectionService, useValue: componentCollectionServiceStub},
        {provide: DomSanitizer, useValue: mockDomSanitizer},
        {provide: WindowRefService, useValue: windowRefStub},
        MessageChannelDelegateService,
        UtilService,
        WindowRefService,
        ChangeDetectorRef,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UIImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should provide a setter to set a layout', () => {
    expect(component.layout).toEqual(ImageLayoutOption.Contain);
    component.layout = ImageLayoutOption.CoverTopCenter;
    expect(component.layout).toEqual(ImageLayoutOption.CoverTopCenter);
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
      ImageLayoutOption.Contain,
      ImageLayoutOption.ContainLeft,
      ImageLayoutOption.ContainRight,
      ImageLayoutOption.CoverBottomCenter,
      ImageLayoutOption.CoverCenterCenter,
      ImageLayoutOption.CoverTopCenter,
      ImageLayoutOption.ContainLeftEdgeToEdge,
      ImageLayoutOption.ContainCenterEdgeToEdge,
      ImageLayoutOption.ContainRightEdgeToEdge,
      ImageLayoutOption.CoverTopCenterEdgeToEdge,
      ImageLayoutOption.CoverCenterCenterEdgeToEdge,
      ImageLayoutOption.CoverBottomCenterEdgeToEdge
    ]);
  });

  it('should provide a method to return the background position CSS', () => {
    component.setLayout(ImageLayoutOption.Contain);
    expect(component.backgroundPosition()).toEqual('center center');
    component.setLayout(ImageLayoutOption.ContainRight);
    expect(component.backgroundPosition()).toEqual('center right');
    component.setLayout(ImageLayoutOption.ContainLeft);
    expect(component.backgroundPosition()).toEqual('center left');
    component.setLayout(ImageLayoutOption.CoverCenterCenter);
    expect(component.backgroundPosition()).toEqual('center center');
    component.setLayout(ImageLayoutOption.CoverBottomCenter);
    expect(component.backgroundPosition()).toEqual('bottom center');
    component.setLayout(ImageLayoutOption.CoverTopCenter);
    expect(component.backgroundPosition()).toEqual('top center');
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

    it('should provide a NavActionItem to copy the image url to clipboard', fakeAsync(() => {
      const copyToClipboard = component.configuration()[2] as NavActionItem;
      const utilService = getTestBed().get(UtilService);
      spyOn(utilService, 'copyToClipboard');
      component.mediaUrl = Observable.create(observer => {
        observer.next('cat.jpg');
      });
      copyToClipboard.onInputClick(null);
      tick();
      expect(utilService.copyToClipboard).toHaveBeenCalled();
    }));

    it('should set a default value for padding', () => {
      expect(component.padding).toEqual(15);
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
      const event = {target: {value: '1.2'}} as any;
      expect(component.padding).toEqual(15);
      paddingConfig.onInputChange(event);
      expect(component.padding).toEqual(1.2);
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

    it('should clamp padding values to the min value', () => {
      const paddingConfig = component.configuration()[1] as NavActionItem;
      expect(paddingConfig.isInput()).toEqual(true);
      const event = {target: {value: '-99'}} as any;
      paddingConfig.onInputChange(event);
      expect(component.padding).toEqual(UIComponent.BaseImageSizeValue);
    });

    it('should handle focus events and prevent the footer options from hiding', () => {
      const bgConfig = component.configuration()[0];
      expect(bgConfig.onInputFocus).toBeDefined();
      component.canHideFooterConfig = true;
      bgConfig.onInputFocus(null);
      expect(component.canHideFooterConfig).toEqual(false);

      const padding = component.configuration()[1];
      expect(padding.onInputFocus).toBeDefined();
      component.canHideFooterConfig = true;
      padding.onInputFocus(null);
      expect(component.canHideFooterConfig).toEqual(false);
    });
  });
});

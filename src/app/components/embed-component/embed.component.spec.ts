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
import {EmbedLayoutOption, UIEmbedComponent} from './embed.component';
import {mockDomSanitizer} from '../../../test/stubs/dom-sanitizer.stub.spec';
import {UtilService} from '../../providers/util.service';
import {WindowRefService} from '../../providers/window-ref.service';
import {windowRefStub} from '../../../test/stubs/window-ref.stub.spec';

describe('UIEmbedComponent', () => {
  let component: UIEmbedComponent;
  let fixture: ComponentFixture<UIEmbedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UIEmbedComponent],
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
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UIEmbedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should provide a setter to set a layout', () => {
    expect(component.layout).toEqual(EmbedLayoutOption.Contain);
    component.layout = EmbedLayoutOption.FullWidth;
    expect(component.layout).toEqual(EmbedLayoutOption.FullWidth);
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
      EmbedLayoutOption.Contain,
      EmbedLayoutOption.Large,
      EmbedLayoutOption.FullWidth
    ]);
  });

  it('should provide a method that returns a safe url', () => {
    component.component.media = 'https://my.embed.com/embed/1234';
    expect(component.embedUrl()).toBeDefined();
    expect(typeof component.embedUrl).toEqual('function');
  });

  it('should provide a method to determine if the layout is full width', () => {
    component.component.metadata = {layout: null};
    component.layout = EmbedLayoutOption.FullWidth;
    expect(component.layout).toEqual(EmbedLayoutOption.FullWidth);
    expect(component.isFullWidth()).toEqual(true);
  });

  it('should provide a method to determine if the layout is large', () => {
    component.component.metadata = {layout: null};
    component.layout = EmbedLayoutOption.Large;
    expect(component.layout).toEqual(EmbedLayoutOption.Large);
    expect(component.isFullWidth()).toEqual(false);
    expect(component.isLarge()).toEqual(true);
  });

  describe('Configuration Options', () => {
    it('should provide a NavActionItem with an input to receive custom background color', () => {
      component.component.metadata = {bgColor: null};
      const bgConfig = component.configuration()[0] as NavActionItem;
      expect(bgConfig.isInput()).toEqual(true);
      const event = {target: {value: '#000000'}} as any;
      expect(component.bgColor).toBeNull();
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

    it('should provide a NavActionItem with an input to receive embed source url', () => {
      const embedConfig = component.configuration()[1] as NavActionItem;
      expect(embedConfig.isInput()).toEqual(true);
      const event = {target: {value: 'https://my.embed.com/embed/1234'}} as any;
      expect(component.embedSrc).toBeUndefined();
      embedConfig.onInputChange(event);
      expect(component.embedSrc).toEqual('https://my.embed.com/embed/1234');
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

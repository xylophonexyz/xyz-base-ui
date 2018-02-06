import {ChangeDetectorRef} from '@angular/core';
import {async, ComponentFixture, fakeAsync, getTestBed, TestBed, tick} from '@angular/core/testing';
import {DomSanitizer} from '@angular/platform-browser';
import {Observable} from 'rxjs/Observable';
import {mockFile} from '../../../modules/file-upload/file-upload.service.spec';
import {componentCollectionServiceStub} from '../../../test/stubs/component-collection.stub.spec';
import {componentServiceStub} from '../../../test/stubs/component.service.stub.spec';
import {footerNotifierStub} from '../../../test/stubs/footer-notifier.service.stub.spec';
import {XzRichTextMock} from '../../../test/stubs/rich-text-directive.stub.spec';
import {Component} from '../../models/component';
import {NavActionItem} from '../../models/nav-action-item';
import {ComponentCollectionService} from '../../providers/component-collection.service';
import {ComponentService} from '../../providers/component.service';
import {FooterDelegateService} from '../../providers/footer-delegate.service';
import {MessageChannelDelegateService} from '../../providers/message-channel.service';
import {UIComponent} from '../component/component.component';

import {SectionLayoutOption, UISectionComponent} from './section-component.component';
import {mockDomSanitizer} from '../../../test/stubs/dom-sanitizer.stub.spec';
import {UtilService} from '../../providers/util.service';
import {WindowRefService} from '../../providers/window-ref.service';
import {windowRefStub} from '../../../test/stubs/window-ref.stub.spec';
import {QuillService} from '../../providers/quill.service';

describe('UISectionComponent', () => {
  let component: UISectionComponent;
  let fixture: ComponentFixture<UISectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        UISectionComponent,
        XzRichTextMock
      ],
      providers: [
        {provide: FooterDelegateService, useValue: footerNotifierStub},
        {provide: ComponentService, useValue: componentServiceStub},
        {provide: ComponentCollectionService, useValue: componentCollectionServiceStub},
        {provide: DomSanitizer, useValue: mockDomSanitizer},
        {provide: WindowRefService, useValue: windowRefStub},
        {provide: QuillService, useClass: QuillService},
        MessageChannelDelegateService,
        UtilService,
        WindowRefService,
        ChangeDetectorRef,
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UISectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('General', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Content Editable Text', () => {
    it('should provide a binding to the contenteditable model', () => {
      component.component = new Component({metadata: {title: 'foo', subtitle: 'bar'}} as any);
      expect(component.titleModel).toEqual('foo');
      expect(component.subtitleModel).toEqual('bar');
    });

    it('should provide a binding to the contenteditable model and handle invalid input gracefully', () => {
      component.component = null;
      expect(component.titleModel).toEqual(null);
      expect(component.subtitleModel).toEqual(null);
    });

    it('should react to changes from contentEditable model changes', () => {
      component.component = new Component({metadata: {title: 'foo', subtitle: 'bar'}} as any);
      component.titleDidChange('bar');
      component.subtitleDidChange('foo');
      expect(component.subtitleModel).toEqual('foo');
      expect(component.titleModel).toEqual('bar');
    });
  });

  describe('Background Images', () => {
    it('should provide a binding to the background image url if there is one', () => {
      component.component = new Component({metadata: {}} as any);
      component.component.metadata.bgImage = {
        components: [
          {
            media: {url: 'https://cat.jpg'}
          }
        ]
      };
      let observer = component.mediaUrl.subscribe(url => {
        expect(url).toEqual('https://cat.jpg');
      });
      observer.unsubscribe();
      delete component.component.metadata.bgImage;

      component.bgImageFile = mockFile(1000, 'foo');
      observer = component.mediaUrl.subscribe(url => {
        expect(url).not.toBeNull();
      });
      observer.unsubscribe();
      component.bgImageFile = null;

      component.component.metadata.bgImage = {
        components: [
          {
            media: {asdfasdf: 'https://cat.jpg'}
          }
        ]
      };
      observer = component.mediaUrl.subscribe(url => {
        expect(url).toEqual('/assets/img/smpte.jpg');
      });
      observer.unsubscribe();

      component.component.metadata.bgImage = null;
      observer = component.mediaUrl.subscribe(url => {
        expect(url).toBeNull();
      });
      observer.unsubscribe();
    });

    it('should provide a binding to the background image if there is one', () => {
      component.component = new Component({metadata: {}} as any);
      expect(component.bgImageModel).toBeNull();
      component.component.metadata.bgImage = {
        components: [
          {
            media: {url: 'https://cat.jpg'}
          }
        ]
      };
      expect(component.bgImageModel).toEqual({url: 'https://cat.jpg'});
    });

    it('should return bgImagePreview is the value is available', () => {
      component.component = new Component({metadata: {}} as any);
      expect(component.bgImageModel).toBeNull();
      component.bgImageFile = mockFile(1000, 'foo');
      expect(component.bgImageModel).toEqual(component.bgImageFile);
    });

    it('should provide a method to determine if the component has a background image', () => {
      component.component = new Component({metadata: {}} as any);
      expect(component.hasBgImage()).toEqual(false);
      component.component.metadata.bgImage = {
        components: [
          {
            media: {url: 'https://cat.jpg'}
          }
        ]
      };
      expect(component.hasBgImage()).toEqual(true);
    });

    it('should provide a method to determine if the remove image button should be disabled', () => {
      component.component = new Component({metadata: {}} as any);
      expect(component.shouldDisableRemoveBgImage()).toEqual(false);
      component.component.metadata.bgImage = {
        components: [
          {
            media: {url: 'https://cat.jpg'},
            media_processing: false
          }
        ]
      };
      expect(component.shouldDisableRemoveBgImage()).toEqual(false);
      component.component.metadata.bgImage.components[0].media_processing = true;
      expect(component.shouldDisableRemoveBgImage()).toEqual(true);
    });

    it('should provide a handler to handle files for the background image', () => {
      expect(component.fileDidChange).toBeDefined();
      spyOn(component, 'addBgImage');
      const event = {target: {files: [mockFile(1000, 'bg.jpg')]}} as any;
      component.fileDidChange(event);
      expect(component.addBgImage).toHaveBeenCalled();
    });

    it('should provide a method to remove an existing background image', () => {
      const windowRef = getTestBed().get(WindowRefService);
      component.component = new Component({metadata: {}} as any);
      component.component.metadata.bgImage = {
        components: [
          {
            media: {url: 'https://cat.jpg'},
            media_processing: false
          }
        ]
      };
      spyOn(component as any, 'saveWithThrottle');
      spyOn(windowRef.nativeWindow, 'confirm').and.returnValue(true);
      expect(component.hasBgImage()).toEqual(true);
      component.removeBgImage();
      expect(component.hasBgImage()).toEqual(false);
      expect((component as any).saveWithThrottle).toHaveBeenCalled();
    });

    it('should provide a method to add a background image', async(() => {
      const file = mockFile(1000, 'bg.jpg');
      const collectionService = getTestBed().get(ComponentCollectionService);
      const componentService = getTestBed().get(ComponentService);
      spyOn(collectionService, 'create').and.callThrough();
      spyOn(componentService, 'upload').and.callThrough();
      component.component = new Component({metadata: {}} as any);
      expect(component.component.metadata.bgImage).not.toBeDefined();
      component.addBgImage(file);

      setTimeout(() => {
        expect(component.component.metadata.bgImage).toBeDefined();
        expect(collectionService.create).toHaveBeenCalled();
        expect(componentService.upload).toHaveBeenCalled();
      });
    }));

    it('should handle errors when adding a background image', async(() => {
      const file = mockFile(1000, 'bg.jpg');
      const collectionService = getTestBed().get(ComponentCollectionService);
      const componentService = getTestBed().get(ComponentService);
      spyOn(collectionService, 'create').and.callFake(() => {
        return Observable.create(observer => {
          observer.error(); // error
        });
      });
      spyOn(componentService, 'upload').and.callThrough();
      spyOn(component, 'removeBgImage');
      component.component = new Component({metadata: {}} as any);
      expect(component.component.metadata.bgImage).not.toBeDefined();
      component.addBgImage(file);

      setTimeout(() => {
        expect(component.component.metadata.bgImage).toBeDefined();
        expect(collectionService.create).toHaveBeenCalled();
        expect(componentService.upload).not.toHaveBeenCalled();
        expect(component.removeBgImage).toHaveBeenCalled();
      });
    }));

    it('should handle errors when adding a background image', async(() => {
      const file = mockFile(1000, 'bg.jpg');
      const collectionService = getTestBed().get(ComponentCollectionService);
      const componentService = getTestBed().get(ComponentService);
      spyOn(collectionService, 'create').and.callFake(() => {
        return Observable.create(observer => {
          observer.next(null); // success but malformed data
        });
      });
      spyOn(componentService, 'upload').and.callThrough();
      spyOn(component, 'removeBgImage');
      component.component = new Component({metadata: {}} as any);
      expect(component.component.metadata.bgImage).not.toBeDefined();
      component.addBgImage(file);

      setTimeout(() => {
        expect(component.component.metadata.bgImage).toBeDefined();
        expect(collectionService.create).toHaveBeenCalled();
        expect(componentService.upload).not.toHaveBeenCalled();
        expect(component.removeBgImage).toHaveBeenCalled();
      });
    }));

    it('should handle upload errors when adding a background image', async(() => {
      const file = mockFile(1000, 'bg.jpg');
      const collectionService = getTestBed().get(ComponentCollectionService);
      const componentService = getTestBed().get(ComponentService);
      spyOn(collectionService, 'create').and.callThrough();
      spyOn(componentService, 'upload').and.callFake(() => {
        return Observable.create(observer => {
          observer.next(null); // success but malformed data
        });
      });
      component.component = new Component({metadata: {}} as any);
      component.addBgImage(file);

      setTimeout(() => {
        expect(component.component.metadata.bgImage).toBeDefined();
        expect(componentService.upload).toHaveBeenCalled();
      });
    }));

    it('should handle upload errors when adding a background image', async(() => {
      const file = mockFile(1000, 'bg.jpg');
      const collectionService = getTestBed().get(ComponentCollectionService);
      const componentService = getTestBed().get(ComponentService);
      spyOn(collectionService, 'create').and.callThrough();
      spyOn(componentService, 'upload').and.callFake(() => {
        return Observable.create(observer => {
          observer.error(); // error
        });
      });
      component.component = new Component({metadata: {}} as any);
      component.addBgImage(file);

      setTimeout(() => {
        expect(component.component.metadata.bgImage).toBeDefined();
        expect(componentService.upload).toHaveBeenCalled();
      });
    }));

    it('should handle upload completion when adding a background image', fakeAsync(() => {
      const file = mockFile(1000, 'bg.jpg');
      const collectionService = getTestBed().get(ComponentCollectionService);
      const componentService = getTestBed().get(ComponentService);
      spyOn(collectionService, 'create').and.callThrough();
      spyOn(componentService, 'upload').and.callFake(() => {
        return Observable.create(observer => {
          observer.complete(); // complete
        });
      });
      spyOn(component as any, 'saveWithThrottle');
      component.component = new Component({metadata: {}} as any);
      component.addBgImage(file);

      setTimeout(() => {
        expect(component.component.metadata.bgImage).toBeDefined();
        expect(componentService.upload).toHaveBeenCalled();
      });

      tick();
    }));
  });

  describe('Configuration Options', () => {

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

    it('should provide a NavActionItem with an input to receive custom background color', () => {
      const bgConfig = component.configuration()[0] as NavActionItem;
      expect(bgConfig.isInput()).toEqual(true);
      const event = {target: {value: '#000000'}} as any;
      expect(component.bgColor).toBeUndefined();
      bgConfig.onInputChange(event);
      expect(component.bgColor).toEqual('#000000');
    });

    it('should provide a NavActionItem to copy the image url to clipboard', fakeAsync(() => {
      spyOn(component, 'hasBgImage').and.returnValue(true);
      const copyToClipboard = component.configuration()[3] as NavActionItem;
      const utilService = getTestBed().get(UtilService);
      spyOn(utilService, 'copyToClipboard');
      component.mediaUrl = Observable.create(observer => {
        observer.next('cat.jpg');
      });
      copyToClipboard.onInputClick(null);
      tick();
      expect(utilService.copyToClipboard).toHaveBeenCalled();
    }));

    it('should provide a NavActionItem with an input to receive custom text color', () => {
      const textConfig = component.configuration()[1];
      expect(textConfig.isInput()).toEqual(true);
      const event = {target: {value: '#444444'}} as any;
      expect(component.paletteColor).toBeUndefined();
      textConfig.onInputChange(event);
      expect(component.paletteColor).toEqual('#444444');
    });

    it('should provide a NavActionItem with an input to receive custom text size', () => {
      const textConfig = component.configuration()[2];
      expect(textConfig.isInput()).toEqual(true);
      // default value
      expect(component.textSize).toEqual(UIComponent.BaseTextSize);
      // set new text size
      const event = {target: {value: '4'}} as any;
      expect(component.textSize).toEqual(UIComponent.BaseTextSize);
      textConfig.onInputChange(event);
      // titleSize, subtitleSize returns the css string
      expect(component.titleSize).toEqual('4em');
      expect(component.subtitleSize).toEqual(4 * UISectionComponent.TextSizeRatio + 'em');
      // cause an error
      component.component.metadata = null;
      expect(component.textSize).toEqual(UIComponent.BaseTextSize);
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

    it('should handle blur events on text color input and update footer', async(() => {
      const textConfig = component.configuration()[1];
      expect(textConfig.onInputBlur).toBeDefined();

      const footer = getTestBed().get(FooterDelegateService);
      spyOn(footer, 'clearCenterActionItems');
      component.canHideFooterConfig = false;
      textConfig.onInputBlur(null);
      expect(component.canHideFooterConfig).toEqual(true);
      setTimeout(() => {
        expect(footer.clearCenterActionItems).toHaveBeenCalled();
      });
    }));

    it('should handle focus events and prevent the footer options from hiding', () => {
      const bgConfig = component.configuration()[0];
      const textConfig = component.configuration()[1];
      expect(bgConfig.onInputFocus).toBeDefined();
      expect(textConfig.onInputFocus).toBeDefined();
      component.canHideFooterConfig = true;
      bgConfig.onInputFocus(null);
      expect(component.canHideFooterConfig).toEqual(false);

      component.canHideFooterConfig = true;
      textConfig.onInputFocus(null);
      expect(component.canHideFooterConfig).toEqual(false);
    });

    it('should provide a getter that returns its layout options', () => {
      const layout = component.layoutOptions;
      expect(layout).toEqual([
        SectionLayoutOption.CompactLeft,
        SectionLayoutOption.DefaultLeft,
        SectionLayoutOption.LargeLeft,
        SectionLayoutOption.FullLeft,
        SectionLayoutOption.CompactCenter,
        SectionLayoutOption.DefaultCenter,
        SectionLayoutOption.LargeCenter,
        SectionLayoutOption.FullCenter,
        SectionLayoutOption.CompactRight,
        SectionLayoutOption.DefaultRight,
        SectionLayoutOption.LargeRight,
        SectionLayoutOption.FullRight
      ]);
    });

    it('should provide additional layout options when the component has a bg image', () => {
      component.component = new Component({metadata: {}} as any);
      component.component.metadata.bgImage = {
        components: [
          {
            media: {url: 'https://cat.jpg'},
            media_processing: false
          }
        ]
      };
      const layout = component.layoutOptions;
      expect(layout).toEqual([
        SectionLayoutOption.CompactLeft,
        SectionLayoutOption.DefaultLeft,
        SectionLayoutOption.LargeLeft,
        SectionLayoutOption.FullLeft,
        SectionLayoutOption.CompactCenter,
        SectionLayoutOption.DefaultCenter,
        SectionLayoutOption.LargeCenter,
        SectionLayoutOption.FullCenter,
        SectionLayoutOption.CompactRight,
        SectionLayoutOption.DefaultRight,
        SectionLayoutOption.LargeRight,
        SectionLayoutOption.FullRight,
        SectionLayoutOption.SplitCompactImageRightTextLeft,
        SectionLayoutOption.SplitCompactImageLeftTextRight,
        SectionLayoutOption.SplitDefaultImageRightTextLeft,
        SectionLayoutOption.SplitDefaultImageLeftTextRight,
        SectionLayoutOption.SplitLargeImageRightTextLeft,
        SectionLayoutOption.SplitLargeImageLeftTextRight,
        SectionLayoutOption.SplitFullImageRightTextLeft,
        SectionLayoutOption.SplitFullImageLeftTextRight,
      ]);
    });

    it('should provide a default layout option', () => {
      expect(component.layout).toEqual(SectionLayoutOption.DefaultLeft);
    });

    it('should provide a setter to set a layout', () => {
      expect(component.layout).toEqual(SectionLayoutOption.DefaultLeft);
      component.layout = SectionLayoutOption.CompactRight;
      expect(component.layout).toEqual(SectionLayoutOption.CompactRight);
    });
  });
});

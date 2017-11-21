import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {BaseRequestOptions, Http, Response, ResponseOptions} from '@angular/http';
import {MockBackend} from '@angular/http/testing';
import {Observable} from 'rxjs/Observable';
import {componentServiceStub} from 'test/stubs/component.service.stub.spec';
import {FeatherModule} from '../../../modules/feather/feather.module';
import {pagesServiceStub} from '../../../test/stubs/pages.service.stub.spec';
import {mockFile} from '../../../modules/file-upload/file-upload.service.spec';
import {AvailableComponent} from '../../index';
import {mockComponentData} from '../../models/component.spec';
import {Page} from '../../models/page';
import {ComponentService} from '../../providers/component.service';
import {MessageChannelDelegateService} from '../../providers/message-channel.service';
import {PagesService} from '../../providers/pages.service';
import {mockPageData} from '../../providers/pages.service.spec';
import {ModalComponent} from '../modal/modal.component';

import {PageUIComponentCollectionAdditionComponent} from './page-component-addition.component';

describe('PageUIComponentCollectionAdditionComponent', () => {
  let component: PageUIComponentCollectionAdditionComponent;
  let fixture: ComponentFixture<PageUIComponentCollectionAdditionComponent>;
  let mockBackend;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PageUIComponentCollectionAdditionComponent, ModalComponent],
      providers: [
        MockBackend,
        BaseRequestOptions,
        {
          provide: Http,
          useFactory: (backend: MockBackend, options: BaseRequestOptions) => {
            return new Http(backend, options);
          },
          deps: [MockBackend, BaseRequestOptions]
        },
        {provide: PagesService, useValue: pagesServiceStub},
        {provide: ComponentService, useValue: componentServiceStub},
        MessageChannelDelegateService
      ],
      imports: [FeatherModule]
    }).compileComponents();
    mockBackend = getTestBed().get(MockBackend);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageUIComponentCollectionAdditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should request the available components on init', async(() => {
    const buttons = [
      {
        'icon': 'icon-Stack-2',
        'text': 'Section',
        'type': 'ComponentCollection',
        'metatype': 'Hero'
      }
    ];
    mockBackend.connections.subscribe(connection => {
      connection.mockRespond(new Response(new ResponseOptions({
        body: JSON.stringify(buttons)
      })));
      expect(connection.request.url).toEqual('/me/components');
    });
    const http = getTestBed().get(Http);
    spyOn(http, 'get').and.callThrough();
    component.ngOnInit();
    expect(http.get).toHaveBeenCalled();
    expect(component.componentAddButtons).toEqual(buttons);
  }));

  describe('Adding a new component collection', () => {
    it('should provide a method to add a new component', () => {
      component.page = new Page(mockPageData);
      expect(component.page.components.length).toEqual(1);
      component.addComponent({type: 'ComponentCollection', metatype: 'Hero', icon: null, text: 'Hero'});
      expect(component.page.components.length).toEqual(2);
      const collection = component.page.components[1];
      expect(collection.type).toEqual('ComponentCollection');
      expect(collection.metatype).toEqual('Hero');
      expect(collection.components[0].type).toEqual('Component');
    });

    it('should handle files when adding a component', () => {
      component.page = new Page(mockPageData);
      const componentService = getTestBed().get(ComponentService);
      const channelService = getTestBed().get(MessageChannelDelegateService);
      spyOn(componentService, 'upload').and.callFake(() => {
        return new Observable(observer => {
          observer.next(mockComponentData);
        });
      });
      spyOn(channelService, 'sendMessage');
      const file = mockFile(100, 'file.jpg');
      component.addComponent({
        type: 'ComponentCollection',
        metatype: 'ImageCollection',
        icon: null,
        text: 'Image'
      }, file);
      expect(componentService.upload).toHaveBeenCalled();
      expect(channelService.sendMessage).toHaveBeenCalled();
    });

    it('should handle unexpected errors with try/catch', () => {
      component.page = new Page(Object.assign({}, mockPageData, {components: null}));
      const componentService = getTestBed().get(ComponentService);
      spyOn(componentService, 'upload').and.callFake(() => {
        return null;
      });
      expect(() => {
        const file = mockFile(100, 'file.jpg');
        component.addComponent({
          type: 'ComponentCollection',
          metatype: 'ImageCollection',
          icon: null,
          text: 'Image'
        }, file);
      }).not.toThrow();
    });

    it('should handle errors when uploading files when adding a component', () => {
      component.page = new Page(mockPageData);
      const componentService = getTestBed().get(ComponentService);
      const channelService = getTestBed().get(MessageChannelDelegateService);
      spyOn(componentService, 'upload').and.callFake(() => {
        return new Observable(observer => {
          observer.error(new Error('Something bad happened'));
        });
      });
      spyOn(channelService, 'sendMessage');
      const file = mockFile(100, 'file.jpg');
      component.addComponent({
        type: 'ComponentCollection',
        metatype: 'ImageCollection',
        icon: null,
        text: 'Image'
      }, file);
      expect(componentService.upload).toHaveBeenCalled();
      expect(channelService.sendMessage).toHaveBeenCalled();
    });

    it('should handle request errors when adding a new component', () => {
      component.page = new Page(mockPageData);
      expect(component.page.components.length).toEqual(1);
      const pagesService = getTestBed().get(PagesService);
      spyOn(pagesService, 'addComponentCollection').and.callFake(() => {
        return new Observable(observer => {
          observer.error(new Error('Bad request'));
        });
      });
      component.addComponent({type: 'ComponentCollection', metatype: 'Hero', icon: null, text: 'Hero'});
      expect(component.page.components.length).toEqual(1);
    });

    it('should handle formatting errors when adding a new component', () => {
      component.page = new Page(mockPageData);
      expect(component.page.components.length).toEqual(1);
      const pagesService = getTestBed().get(PagesService);
      spyOn(pagesService, 'addComponentCollection').and.callFake(() => {
        return new Observable(observer => {
          observer.next({foo: 'bar'});
        });
      });
      component.addComponent({type: 'ComponentCollection', metatype: 'Hero', icon: null, text: 'Hero'});
      expect(component.page.components.length).toEqual(1);
    });
  });

  it('should provide a method to group the available component into an array of arrays', () => {
    const buttons = [
      {
        'icon': 'icon-Stack-2',
        'text': 'Section',
        'type': 'ComponentCollection',
        'metatype': 'Hero'
      },
      {
        'icon': null,
        'text': 'Section',
        'type': 'ComponentCollection',
        'metatype': 'Spacer'
      },
      {
        'icon': null,
        'text': 'Section',
        'type': 'ComponentCollection',
        'metatype': 'ImageCollection'
      },
      {
        'icon': null,
        'text': 'Section',
        'type': 'ComponentCollection',
        'metatype': 'Text'
      },
      {
        'icon': null,
        'text': 'Section',
        'type': 'ComponentCollection',
        'metatype': 'Video'
      }
    ];
    component.componentAddButtons = buttons;

    const groups = component.groupButtonsIntoColumns();
    expect(groups.length).toEqual(3);
    expect(groups[2][0].metatype).toEqual('Video');
  });

  it('should provide a method to determine if a component receives a file', () => {
    let c: AvailableComponent = {
      icon: null,
      text: null,
      type: 'ComponentCollection',
      metatype: 'ImageCollection'
    };
    expect(component.isFileInputType(c)).toEqual(true);

    c = {
      icon: null,
      text: null,
      type: 'ComponentCollection',
      metatype: 'Embed'
    };
    expect(component.isFileInputType(c)).toEqual(false);

    c = {
      icon: null,
      text: null,
      type: 'ComponentCollection',
      metatype: 'Spacer'
    };
    expect(component.isFileInputType(c)).toEqual(false);
  });

  it('should provide a handler for file changes', () => {
    const c: AvailableComponent = {
      icon: null,
      text: null,
      type: 'ComponentCollection',
      metatype: 'ImageCollection'
    };
    let evt: any = {
      target: {
        files: []
      }
    };
    spyOn(component, 'addComponent');
    component.fileDidChange(c, evt);
    expect(component.addComponent).not.toHaveBeenCalled();

    evt = {
      target: {
        files: [{}]
      }
    };
    component.fileDidChange(c, evt);
    expect(component.addComponent).toHaveBeenCalled();
  });
});

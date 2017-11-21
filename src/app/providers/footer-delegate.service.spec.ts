import {async, getTestBed, inject, TestBed} from '@angular/core/testing';
import {NavActionItem} from '../models/nav-action-item';

import {FooterDelegateService} from './footer-delegate.service';

describe('FooterDelegateService', () => {

  const leftFooterItems = [
    new NavActionItem('Foo'),
    new NavActionItem('Bar'),
  ];
  const centerFooterItems = [
    new NavActionItem('Foo'),
  ];
  const rightFooterItems = [
    new NavActionItem('Foo'),
    new NavActionItem('Bar'),
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FooterDelegateService]
    });
  });

  it('should be created', inject([FooterDelegateService], (service: FooterDelegateService) => {
    expect(service).toBeTruthy();
  }));

  it('should provide a Subject to send shouldDisplay events', async(inject([FooterDelegateService], (service: FooterDelegateService) => {
    service.displayFooter(true);
    service.shouldDisplay.subscribe(val => {
      expect(val).toBeTruthy();
    });
  })));

  it('should provide a Subject to send leftActionItems', async(inject([FooterDelegateService], (service: FooterDelegateService) => {
    service.setLeftActionItems(leftFooterItems);
    service.leftActionItems.subscribe(items => {
      expect(items).toEqual(leftFooterItems);
    });
  })));

  it('should provide a Subject to send centerActionItems', async(inject([FooterDelegateService], (service: FooterDelegateService) => {
    service.setCenterActionItems(centerFooterItems);
    service.centerActionItems.subscribe(items => {
      expect(items).toEqual(centerFooterItems);
    });
  })));

  it('should provide a Subject to send rightActionItems', async(inject([FooterDelegateService], (service: FooterDelegateService) => {
    service.setRightActionItems(rightFooterItems);
    service.centerActionItems.subscribe(items => {
      expect(items).toEqual(rightFooterItems);
    });
  })));

  describe('Clearing action items', () => {
    it('should clear items from the left menu', async(() => {
      const service = getTestBed().get(FooterDelegateService);
      service.clearLeftActionItems();
      service.leftActionItems.subscribe(items => {
        expect(items).toEqual([]);
      });
    }));

    it('should clear items from the right menu', async(() => {
      const service = getTestBed().get(FooterDelegateService);
      service.clearRightActionItems();
      service.rightActionItems.subscribe(items => {
        expect(items).toEqual([]);
      });
    }));

    it('should clear items from the center menu', async(() => {
      const service = getTestBed().get(FooterDelegateService);
      service.clearCenterActionItems();
      service.centerActionItems.subscribe(items => {
        expect(items).toEqual([]);
      });
    }));

    it('should clear items from all menus', async(() => {
      const service = getTestBed().get(FooterDelegateService);
      service.clearActionItems();
      service.centerActionItems.subscribe(items => {
        expect(items).toEqual([]);
      });
      service.rightActionItems.subscribe(items => {
        expect(items).toEqual([]);
      });
      service.leftActionItems.subscribe(items => {
        expect(items).toEqual([]);
      });
    }));
  });

});

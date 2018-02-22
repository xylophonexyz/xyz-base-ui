import {async, getTestBed, inject, TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {authServiceStub} from '../../test/stubs/auth.service.stub.spec';
import {pagesServiceStub} from '../../test/stubs/pages.service.stub.spec';
import {routerStub} from '../../test/stubs/router.stub.spec';
import {Page} from '../models/page';
import {User} from '../models/user';
import {mockUserData} from '../models/user.spec';
import {AuthService} from '../providers/auth.service';
import {PagesService} from '../providers/pages.service';
import {mockPageData} from '../providers/pages.service.spec';

import {PageGuard} from './page.guard';

describe('PageGuard', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PageGuard,
        {provide: Router, useValue: routerStub},
        {provide: AuthService, useValue: authServiceStub},
        {provide: PagesService, useValue: pagesServiceStub}
      ]
    });
  });

  it('should allow access to a private pages from its owner', async(inject([PageGuard], (guard: PageGuard) => {
    const pageProvider = getTestBed().get(PagesService);
    const authProvider = getTestBed().get(AuthService);
    const userData = Object.assign(mockUserData, {id: 1});
    const user = new User(userData);
    const page = new Page(Object.assign({}, mockPageData, {published: false, user: userData}));
    const routeSnapshot = {
      paramMap: {
        get: key => {
          const obj = {
            pageId: page.id,
            pageSlug: 'myTitle'
          };
          return obj[key];
        }
      },
      queryParamMap: {
        get: key => {
          const obj = {
            edit: false
          };
          return obj[key];
        }
      }
    } as any;

    spyOn(pageProvider, 'get').and.callFake(() => {
      return new BehaviorSubject<any>(page);
    });
    authProvider.authenticate.and.callFake(() => {
      return new Promise(resolve => resolve(user));
    });

    guard.canActivate(routeSnapshot, null).then(val => {
      expect(val).toEqual(true);
    });
  })));

  it('should allow access to public pages', async(inject([PageGuard], (guard: PageGuard) => {
    const pageProvider = getTestBed().get(PagesService);
    const authProvider = getTestBed().get(AuthService);
    const userData = Object.assign({}, mockUserData, {id: 1});
    const otherUserData = Object.assign({}, mockUserData, {id: 2});
    const otherUser = new User(otherUserData);
    const page = new Page(Object.assign({}, mockPageData, {published: true, user: userData}));
    const routeSnapshot = {
      paramMap: {
        get: key => {
          const obj = {
            pageId: page.id,
            pageSlug: 'myTitle'
          };
          return obj[key];
        }
      },
      queryParamMap: {
        get: key => {
          const obj = {
            edit: false
          };
          return obj[key];
        }
      }
    } as any;

    spyOn(pageProvider, 'get').and.callFake(() => {
      return new BehaviorSubject<any>(page);
    });
    authProvider.authenticate.and.callFake(() => {
      return new Promise(resolve => resolve(otherUser));
    });

    guard.canActivate(routeSnapshot, null).then(val => {
      expect(val).toEqual(true);
    });
  })));

  it('should allow access to public pages through the page slug', async(inject([PageGuard], (guard: PageGuard) => {
    const pageProvider = getTestBed().get(PagesService);
    const authProvider = getTestBed().get(AuthService);
    const userData = Object.assign({}, mockUserData, {id: 1});
    const otherUserData = Object.assign({}, mockUserData, {id: 2});
    const otherUser = new User(otherUserData);
    const page = new Page(Object.assign({}, mockPageData, {published: true, user: userData}));
    const routeSnapshot = {
      paramMap: {
        get: key => {
          const obj = {
            pageSlug: 'my-title-' + page.id
          };
          return obj[key];
        }
      },
      queryParamMap: {
        get: key => {
          const obj = {
            edit: false
          };
          return obj[key];
        }
      }
    } as any;

    spyOn(pageProvider, 'get').and.callFake(() => {
      return new BehaviorSubject<any>(page);
    });
    authProvider.authenticate.and.callFake(() => {
      return new Promise(resolve => resolve(otherUser));
    });

    guard.canActivate(routeSnapshot, null).then(val => {
      expect(val).toEqual(true);
    });
  })));

  it('should allow access to public pages to non-logged in users', async(inject([PageGuard], (guard: PageGuard) => {
    const pageProvider = getTestBed().get(PagesService);
    const authProvider = getTestBed().get(AuthService);
    const userData = Object.assign({}, mockUserData, {id: 1});
    const page = new Page(Object.assign({}, mockPageData, {published: true, user: userData}));
    const routeSnapshot = {
      paramMap: {
        get: key => {
          const obj = {
            pageId: page.id,
            pageSlug: 'myTitle'
          };
          return obj[key];
        }
      },
      queryParamMap: {
        get: key => {
          const obj = {
            edit: false
          };
          return obj[key];
        }
      }
    } as any;

    spyOn(pageProvider, 'get').and.callFake(() => {
      return new BehaviorSubject<any>(page);
    });
    authProvider.authenticate.and.callFake(() => {
      return new Promise(resolve => resolve(null));
    });

    guard.canActivate(routeSnapshot, null).then(val => {
      expect(val).toEqual(true);
    });
  })));

  it('should allow access to the owner when viewing a page in edit mode', async(inject([PageGuard], (guard: PageGuard) => {
    const pageProvider = getTestBed().get(PagesService);
    const authProvider = getTestBed().get(AuthService);
    const userData = Object.assign({}, mockUserData, {id: 1});
    const user = new User(userData);
    const page = new Page(Object.assign({}, mockPageData, {published: true, user: userData}));
    const routeSnapshot = {
      paramMap: {
        get: key => {
          const obj = {
            pageId: page.id,
            pageSlug: 'myTitle'
          };
          return obj[key];
        }
      },
      queryParamMap: {
        get: key => {
          const obj = {
            edit: 'true'
          };
          return obj[key];
        }
      }
    } as any;

    spyOn(pageProvider, 'get').and.callFake(() => {
      return new BehaviorSubject<any>(page);
    });
    authProvider.authenticate.and.callFake(() => {
      return new Promise(resolve => resolve(user));
    });

    setTimeout(() => {
      guard.canActivate(routeSnapshot, null).then(val => {
        expect(val).toEqual(true);
      });
    });
  })));

  it('should reject access to edit mode to any user other than the owner', async(inject([PageGuard], (guard: PageGuard) => {
    const pageProvider = getTestBed().get(PagesService);
    const authProvider = getTestBed().get(AuthService);
    const userData = Object.assign({}, mockUserData, {id: 1});
    const otherUserData = Object.assign({}, mockUserData, {id: 2});
    const otherUser = new User(otherUserData);
    const page = new Page(Object.assign({}, mockPageData, {published: true, user: userData}));
    const routeSnapshot = {
      paramMap: {
        get: key => {
          const obj = {
            pageId: page.id,
            pageSlug: 'myTitle'
          };
          return obj[key];
        }
      },
      queryParamMap: {
        get: key => {
          const obj = {
            edit: 'true'
          };
          return obj[key];
        }
      }
    } as any;

    spyOn(pageProvider, 'get').and.callFake(() => {
      return new BehaviorSubject<any>(page);
    });
    authProvider.authenticate.and.callFake(() => {
      return new Promise(resolve => resolve(otherUser));
    });

    setTimeout(() => {
      guard.canActivate(routeSnapshot, null).catch(val => {
        expect(val).toEqual(false);
      });
    });
  })));

  it('should reject access to edit mode to a null user', async(inject([PageGuard], (guard: PageGuard) => {
    const pageProvider = getTestBed().get(PagesService);
    const authProvider = getTestBed().get(AuthService);
    const userData = Object.assign({}, mockUserData, {id: 1});
    const page = new Page(Object.assign({}, mockPageData, {published: true, user: userData}));
    const routeSnapshot = {
      paramMap: {
        get: key => {
          const obj = {
            pageId: page.id,
            pageSlug: 'myTitle'
          };
          return obj[key];
        }
      },
      queryParamMap: {
        get: key => {
          const obj = {
            edit: 'true'
          };
          return obj[key];
        }
      }
    } as any;

    spyOn(pageProvider, 'get').and.callFake(() => {
      return new BehaviorSubject<any>(page);
    });
    authProvider.authenticate.and.callFake(() => {
      return new Promise(resolve => resolve(null));
    });

    setTimeout(() => {
      guard.canActivate(routeSnapshot, null).catch(val => {
        expect(val).toEqual(false);
      });
    });
  })));

  it('should reject access to a private page to a null user', async(inject([PageGuard], (guard: PageGuard) => {
    const pageProvider = getTestBed().get(PagesService);
    const authProvider = getTestBed().get(AuthService);
    const userData = Object.assign({}, mockUserData, {id: 1});
    const page = new Page(Object.assign({}, mockPageData, {published: false, user: userData}));
    const routeSnapshot = {
      paramMap: {
        get: key => {
          const obj = {
            pageId: page.id,
            pageSlug: 'myTitle'
          };
          return obj[key];
        }
      },
      queryParamMap: {
        get: key => {
          const obj = {
            edit: false
          };
          return obj[key];
        }
      }
    } as any;

    spyOn(pageProvider, 'get').and.callFake(() => {
      return new BehaviorSubject<any>(page);
    });
    authProvider.authenticate.and.callFake(() => {
      return new Promise(resolve => resolve(null));
    });

    setTimeout(() => {
      guard.canActivate(routeSnapshot, null).catch(val => {
        expect(val).toEqual(false);
      });
    });
  })));

  it('should redirect to the root screen if there is an error', async(inject([PageGuard], (guard: PageGuard) => {
    const pageProvider = getTestBed().get(PagesService);
    const authProvider = getTestBed().get(AuthService);
    const userData = Object.assign({}, mockUserData, {id: 1});
    const page = new Page(Object.assign({}, mockPageData, {published: false, user: userData}));
    const routeSnapshot = {
      paramMap: {
        get: key => {
          const obj = {
            pageId: page.id,
            pageSlug: 'myTitle'
          };
          return obj[key];
        }
      },
      queryParamMap: {
        get: key => {
          const obj = {
            edit: false
          };
          return obj[key];
        }
      }
    } as any;

    spyOn(pageProvider, 'get').and.callFake(() => {
      return new Observable(observer => observer.error());
    });
    authProvider.authenticate.and.callFake(() => {
      return new Promise(resolve => resolve(null));
    });

    setTimeout(() => {
      guard.canActivate(routeSnapshot, null).catch(val => {
        expect(val).toEqual(false);
      });
    });
  })));

  it('should redirect to the root screen if there is an error', async(inject([PageGuard], (guard: PageGuard) => {
    const pageProvider = getTestBed().get(PagesService);
    const authProvider = getTestBed().get(AuthService);
    const userData = Object.assign({}, mockUserData, {id: 1});
    const page = new Page(Object.assign({}, mockPageData, {published: false, user: userData}));
    const routeSnapshot = {
      paramMap: {
        get: key => {
          const obj = {
            pageId: page.id,
            pageSlug: 'myTitle'
          };
          return obj[key];
        }
      },
      queryParamMap: {
        get: key => {
          const obj = {
            edit: false
          };
          return obj[key];
        }
      }
    } as any;

    spyOn(pageProvider, 'get').and.callFake(() => {
      return new BehaviorSubject<any>(page);
    });
    authProvider.authenticate.and.callFake(() => {
      return new Promise((r, reject) => reject(null));
    });

    setTimeout(() => {
      guard.canActivate(routeSnapshot, null).catch(val => {
        expect(val).toEqual(false);
      });
    });
  })));

  it('should reject access to a private page when the user id or page user is null', async(inject([PageGuard], (guard: PageGuard) => {
    const pageProvider = getTestBed().get(PagesService);
    const authProvider = getTestBed().get(AuthService);
    const userData = Object.assign({}, mockUserData, {id: null});
    const user = new User(userData);
    const page = new Page(Object.assign({}, mockPageData, {published: false, user: userData}));
    const routeSnapshot = {
      paramMap: {
        get: key => {
          const obj = {
            pageId: page.id,
            pageSlug: 'myTitle'
          };
          return obj[key];
        }
      },
      queryParamMap: {
        get: key => {
          const obj = {
            edit: false
          };
          return obj[key];
        }
      }
    } as any;

    spyOn(pageProvider, 'get').and.callFake(() => {
      return new BehaviorSubject<any>(page);
    });
    authProvider.authenticate.and.callFake(() => {
      return new Promise(resolve => resolve(user));
    });

    setTimeout(() => {
      guard.canActivate(routeSnapshot, null).catch(val => {
        expect(val).toEqual(false);
      });
    });
  })));
});

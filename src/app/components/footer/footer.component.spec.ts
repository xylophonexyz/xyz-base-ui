import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {FeatherModule} from '../../../modules/feather/feather.module';
import {footerNotifierStub} from '../../../test/stubs/footer-notifier.service.stub.spec';
import {ToggleOnClickDirective} from '../../directives/toggle-on-click/toggle-on-click.directive';
import {NavActionItem} from '../../models/nav-action-item';
import {FooterDelegateService} from '../../providers/footer-delegate.service';

import {FooterComponent} from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FooterComponent, ToggleOnClickDirective],
      providers: [
        {provide: FooterDelegateService, useValue: footerNotifierStub}
      ],
      imports: [FeatherModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
  });

  it('should subscribe to FooterDelegate subjects on init', () => {
    const delegate = getTestBed().get(FooterDelegateService);
    spyOn(delegate.shouldDisplay$, 'subscribe').and.callThrough();
    spyOn(delegate.leftActionItems$, 'subscribe').and.callThrough();
    spyOn(delegate.centerActionItems$, 'subscribe').and.callThrough();
    spyOn(delegate.rightActionItems$, 'subscribe').and.callThrough();

    delegate.shouldDisplay$.next(true);
    delegate.leftActionItems$.next([]);
    delegate.centerActionItems$.next([]);
    delegate.rightActionItems$.next([]);

    fixture.detectChanges();

    expect(delegate.shouldDisplay$.subscribe).toHaveBeenCalled();
    expect(delegate.leftActionItems$.subscribe).toHaveBeenCalled();
    expect(delegate.centerActionItems$.subscribe).toHaveBeenCalled();
    expect(delegate.rightActionItems$.subscribe).toHaveBeenCalled();
  });

  it('should provide a method to return custom css values given a NavActionItem', () => {
    const item1 = new NavActionItem('Foo', {
      isButton: true
    });
    expect(component.getFullCssClassString(item1)).toEqual('button is-block-mobile');

    const item2 = new NavActionItem('Foo', {
      isButton: false,
      cssClass: 'foo'
    });
    expect(component.getFullCssClassString(item2)).toEqual('foo');

    const item3 = new NavActionItem('Foo', {
      isButton: true,
      cssClass: 'foo'
    });
    expect(component.getFullCssClassString(item3)).toEqual('button foo is-block-mobile');

    const item4 = new NavActionItem('Foo');
    expect(component.getFullCssClassString(item4)).toEqual('');
  });
});

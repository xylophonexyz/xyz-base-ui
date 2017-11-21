import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {NavActionItem} from '../../models/nav-action-item';
import {FooterDelegateService} from '../../providers/footer-delegate.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent implements OnInit {

  @Input() shouldDisplay = false;
  @Input() leftActionItems: NavActionItem[];
  @Input() centerActionItems: NavActionItem[];
  @Input() rightActionItems: NavActionItem[];
  menuIsOpen = false;

  constructor(private delegate: FooterDelegateService, private ref: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.delegate.shouldDisplay.subscribe(shouldDisplay => {
      this.shouldDisplay = shouldDisplay;
      this.ref.markForCheck();
    });
    this.delegate.leftActionItems.subscribe((actionItems: NavActionItem[]) => {
      this.leftActionItems = actionItems;
      this.ref.markForCheck();
    });
    this.delegate.centerActionItems.subscribe((actionItems: NavActionItem[]) => {
      this.centerActionItems = actionItems;
      this.ref.markForCheck();
    });
    this.delegate.rightActionItems.subscribe((actionItems: NavActionItem[]) => {
      this.rightActionItems = actionItems;
      this.ref.markForCheck();
    });
  }

  getFullCssClassString(item: NavActionItem) {
    if (item.isButton()) {
      return `button${item.cssClass ? ` ${item.cssClass}` : ''} is-block-mobile`;
    } else {
      return item.cssClass;
    }
  }

}

import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {NavActionItem} from '../models/nav-action-item';

@Injectable()
export class FooterDelegateService {

  static readonly timeoutThreshold = 0;

  private shouldDisplay$ = new BehaviorSubject<boolean>(false);
  shouldDisplay = this.shouldDisplay$.asObservable();
  private leftActionItems$ = new ReplaySubject<NavActionItem[]>(Infinity);
  leftActionItems = this.leftActionItems$.asObservable();
  private scheduler: any = null;
  private rightActionItems$ = new ReplaySubject<NavActionItem[]>(Infinity);
  rightActionItems = this.rightActionItems$.asObservable();
  private centerActionItems$ = new ReplaySubject<NavActionItem[]>(Infinity);
  centerActionItems = this.centerActionItems$.asObservable();

  /**
   * Hide or show the footer
   * @param {boolean} value
   */
  displayFooter(value: boolean) {
    this.shouldDisplay$.next(value);
  }

  /**
   * Set left items
   * @param {NavActionItem[]} actionItems
   */
  setLeftActionItems(actionItems: NavActionItem[]) {
    if (actionItems.length) {
      this.scheduler = setTimeout(() => {
        this.leftActionItems$.next(actionItems);
        this.scheduler = null;
      }, FooterDelegateService.timeoutThreshold);
    }
  }

  /**
   * Set center items
   * @param {NavActionItem[]} actionItems
   */
  setCenterActionItems(actionItems: NavActionItem[]) {
    if (actionItems.length) {
      this.scheduler = setTimeout(() => {
        this.centerActionItems$.next(actionItems);
        this.scheduler = null;
      }, FooterDelegateService.timeoutThreshold);
    }
  }

  /**
   * Set right items
   * @param {NavActionItem[]} actionItems
   */
  setRightActionItems(actionItems: NavActionItem[]) {
    if (actionItems.length) {
      this.scheduler = setTimeout(() => {
        this.rightActionItems$.next(actionItems);
        this.scheduler = null;
      }, FooterDelegateService.timeoutThreshold);
    }
  }

  /**
   * Clear all action items from the toolbar
   */
  clearActionItems() {
    this.clearLeftActionItems();
    this.clearCenterActionItems();
    this.clearRightActionItems();
  }

  /**
   * Clear only the left items from the toolbar.
   * Clearing items set on a timer to ensure we receive close updates last. It would suck to have this called right
   * after a setActionItems() call
   */
  clearLeftActionItems() {
    if (this.scheduler === null) {
      this.leftActionItems$.next([]);
    }
  }

  /**
   * Clear only the center items from the toolbar
   * Clearing items set on a timer to ensure we receive close updates last. It would suck to have this called right
   * after a setActionItems() call
   */
  clearCenterActionItems() {
    if (this.scheduler === null) {
      this.centerActionItems$.next([]);
    }
  }

  /**
   * Clear only the right items from the toolbar
   * Clearing items set on a timer to ensure we receive close updates last. It would suck to have this called right
   * after a setActionItems() call
   */
  clearRightActionItems() {
    if (this.scheduler === null) {
      this.rightActionItems$.next([]);
    }
  }
}

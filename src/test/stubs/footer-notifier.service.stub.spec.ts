import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {NavActionItem} from '../../app/models/nav-action-item';

const shouldDisplay$ = new BehaviorSubject<boolean>(false);
const leftActionItems$ = new ReplaySubject<NavActionItem[]>(Infinity);
const rightActionItems$ = new ReplaySubject<NavActionItem[]>(Infinity);
const centerActionItems$ = new ReplaySubject<NavActionItem[]>(Infinity);

export const footerNotifierStub = {
  shouldDisplay$: shouldDisplay$,
  leftActionItems$: leftActionItems$,
  rightActionItems$: rightActionItems$,
  centerActionItems$: centerActionItems$,
  shouldDisplay: shouldDisplay$,
  leftActionItems: leftActionItems$,
  rightActionItems: rightActionItems$,
  centerActionItems: centerActionItems$,
  scheduler: null,
  displayFooter: (value: boolean) => {
    shouldDisplay$.next(value);
  },

  setLeftActionItems: (actionItems: NavActionItem[]) => {
    leftActionItems$.next(actionItems);
  },

  setCenterActionItems: (actionItems: NavActionItem[]) => {
    centerActionItems$.next(actionItems);
  },

  setRightActionItems: (actionItems: NavActionItem[]) => {
    rightActionItems$.next(actionItems);
  },

  clearActionItems() {
    this.clearLeftActionItems();
    this.clearCenterActionItems();
    this.clearRightActionItems();
  },

  clearLeftActionItems() {
    this.leftActionItems$.next([]);
  },

  clearCenterActionItems() {
    this.centerActionItems$.next([]);
  },

  clearRightActionItems() {
    this.rightActionItems$.next([]);
  },
};

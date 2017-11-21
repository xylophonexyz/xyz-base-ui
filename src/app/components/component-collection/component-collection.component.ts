import {ChangeDetectionStrategy, Component, Input, QueryList, ViewChildren} from '@angular/core';
import {sortBy} from 'lodash';
import {ComponentCollection} from '../../models/component-collection';
import {Page} from '../../models/page';
import {ComponentCollectionService} from '../../providers/component-collection.service';
import {FooterDelegateService} from '../../providers/footer-delegate.service';
import {PagesService} from '../../providers/pages.service';
import {UIEmbedComponent} from '../embed-component/embed.component';
import {UIImageComponent} from '../image-component/image-component.component';
import {UISectionComponent} from '../section-component/section-component.component';
import {UISpacerComponent} from '../spacer-component/spacer-component.component';
import {UITextComponent} from '../text-component/text-component.component';
import {UIFreeFormHtmlComponent} from '../free-form-html-component/free-form-html-component.component';

@Component({
  selector: 'app-component-collection',
  templateUrl: './component-collection.component.html',
  styleUrls: ['./component-collection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UIComponentCollectionComponent {

  @ViewChildren(UISectionComponent) sectionComponents: QueryList<UISectionComponent>;
  @ViewChildren(UITextComponent) textComponents: QueryList<UITextComponent>;
  @ViewChildren(UIImageComponent) imageComponents: QueryList<UIImageComponent>;
  @ViewChildren(UISpacerComponent) spacerComponents: QueryList<UISpacerComponent>;
  @ViewChildren(UIEmbedComponent) embedComponents: QueryList<UIEmbedComponent>;
  @ViewChildren(UIFreeFormHtmlComponent) htmlComponents: QueryList<UIFreeFormHtmlComponent>;

  @Input() page: Page;
  @Input() componentCollection: ComponentCollection;
  @Input() editable = false;
  childShouldShowOptions = false;

  constructor(private pagesService: PagesService,
              private footer: FooterDelegateService,
              private componentCollectionService: ComponentCollectionService) {
  }

  /**
   * Return all of the ViewChildren ComponentCollections that are resizable.
   * @returns {any[]}
   */
  allComponentCollectionViewChildren() {
    return [].concat(this.sectionComponents.map(c => c))
      .concat(this.textComponents.map(c => c))
      .concat(this.imageComponents.map(c => c))
      .concat(this.embedComponents.map(c => c))
      .concat(this.spacerComponents.map(c => c))
      .concat(this.htmlComponents.map(c => c));
  }

  /**
   * Add additional configuration options to the footer when this event is received. Instruction is sent to
   * the child component to provide fine grained options.
   */
  showOptions() {
    this.childShouldShowOptions = true;
  }

  /**
   * Hide additional configuration options from the footer when this event is received. Instruction is sent to
   * the child component to provide fine grained options.
   */
  hideOptions() {
    this.childShouldShowOptions = false;
  }

  /**
   * Move this component up on the page. This operation will swap indices with the first
   * ComponentCollection with a lower index found on the Page
   */
  moveUp(event: MouseEvent) {
    const currentIndex = this.componentCollection.index;
    const collectionAbove = sortBy(this.page.components, 'index').filter(c => c.index < currentIndex).pop();
    if (collectionAbove) {
      const swapIndex = collectionAbove.index;
      collectionAbove.index = currentIndex;
      this.componentCollection.index = swapIndex;

      this.updateComponentCollectionIndices(this.componentCollection, collectionAbove, currentIndex, swapIndex);
    }
    event.stopPropagation();
  }

  /**
   * Move this component down on the page. This operation will swap indices with the first
   * ComponentCollection with a higher index found on the Page
   */
  moveDown(event: MouseEvent) {
    const currentIndex = this.componentCollection.index;
    const collectionBelow = sortBy(this.page.components, 'index').filter(c => c.index > currentIndex)[0];
    if (collectionBelow) {
      const swapIndex = collectionBelow.index;
      collectionBelow.index = currentIndex;
      this.componentCollection.index = swapIndex;

      this.updateComponentCollectionIndices(this.componentCollection, collectionBelow, currentIndex, swapIndex);
    }
    event.stopPropagation();
  }

  /**
   * Cycle the size on the ComponentCollection's underlying Component
   */
  toggleLayout(event: MouseEvent) {
    this.allComponentCollectionViewChildren().forEach(c => c.toggleLayout());
    event.stopPropagation();
  }

  /**
   * Remove the ComponentCollection and all associated Components from the Page. Backend does not perform a hard
   * delete -- ComponentCollection objects are stored in a "pool" and may be reincorporated later.
   */
  remove() {
    this.page.components = this.page.components.filter(c => c.id !== this.componentCollection.id);
    this.pagesService.removeComponentCollection(this.page.id, this.componentCollection.id).subscribe(null, err => {
      console.log('Error removing component collection', err);
    });
    // clear any lingering configuration options
    this.footer.clearCenterActionItems();
  }

  /**
   * Provide popover placement dynamically in order to resolve edge cases where the popover is positioned outside of
   * the bounds of the window. This can happen when the navbar is hidden and the popover is activated on the first
   * component on the page.
   * @returns {'bottom' | 'top'}
   */
  popoverPlacement(): 'bottom' | 'top' {
    if (this.page) {
      const firstCollection = sortBy(this.page.components, 'index')[0];
      if (this.pageSuggestsBottomPopoverPlacement() && this.componentCollection === firstCollection) {
        return 'bottom';
      }
    }
    return 'top';
  }

  /**
   * Helper to make backend call to save indices after swap operation
   * @param {ComponentCollection} source
   * @param {ComponentCollection} target
   * @param {number} originalSourceIndex
   * @param {number} originalTargetIndex
   */
  private updateComponentCollectionIndices(source: ComponentCollection,
                                           target: ComponentCollection,
                                           originalSourceIndex: number,
                                           originalTargetIndex: number) {
    this.componentCollectionService.update(source.id, source.asJson()).subscribe(() => {
      this.componentCollectionService.update(target.id, target.asJson()).subscribe(null, () => {
        // error, revert
        source.index = originalSourceIndex;
        target.index = originalTargetIndex;
      });
    }, () => {
      // error, revert
      source.index = originalSourceIndex;
      target.index = originalTargetIndex;
    });
  }

  private pageSuggestsBottomPopoverPlacement(): boolean {
    try {
      return this.page.hasTransparentHeader() || !this.page.metadata.showNav;
    } catch (e) {
      return false;
    }
  }
}

import {Component} from '@angular/core';
import {ConfigurableUIComponent} from '../component/component.component';
import {NavActionItem} from '../../models/nav-action-item';
import {XzRichTextDirective} from '../../directives/xz-rich-text-directive/xz-rich-text.directive';
import {SafeHtml} from '@angular/platform-browser';

export enum FreeFormHtmlLayoutOption {
  FullWidth = 'FullWidth',
}

@Component({
  selector: 'app-free-form-html-component',
  templateUrl: './free-form-html-component.component.html',
  styleUrls: ['./free-form-html-component.component.scss']
})
export class UIFreeFormHtmlComponent extends ConfigurableUIComponent {

  /**
   * Generate a text preview of the HTML. For use in server side rendering.
   */
  htmlPreview = '';

  get htmlModel(): SafeHtml {
    return this.component.media;
  }

  htmlDidChange(html: any) {
    this.component.media = html;
    this.ref.markForCheck();
  }

  get layoutOptions(): [FreeFormHtmlLayoutOption] {
    return [
      FreeFormHtmlLayoutOption.FullWidth,
    ];
  }

  get layout(): FreeFormHtmlLayoutOption {
    return super.getLayout();
  }

  set layout(layout: FreeFormHtmlLayoutOption) {
    this.setLayout(layout);
  }

  configuration(): NavActionItem[] {
    return [];
  }

  editorIsInFocus(): boolean {
    return this.showOptions;
  }

  isEditable(): boolean {
    return this.editable;
  }

  getHtml(): SafeHtml {
    try {
      return this.sanitizer.bypassSecurityTrustHtml(XzRichTextDirective.textContent(JSON.parse(this.component.media)));
    } catch (e) {
      return null;
    }
  }

  protected fallbackLayout(): FreeFormHtmlLayoutOption {
    return FreeFormHtmlLayoutOption.FullWidth;
  }
}

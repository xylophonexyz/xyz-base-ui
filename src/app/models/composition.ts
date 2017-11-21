import {CompositionCustomDomain, CompositionDataInterface, CompositionInterface, CompositionMetadata} from '../index';
import {
  colorIsLight,
  colorIsValidFullHexString,
  darkenHexColorString,
  getHexColorString,
  lightenHexColorString
} from '../util/colors';
import {Page} from './page';

export class Composition implements CompositionInterface {

  static readonly DefaultMetadata: CompositionMetadata = {
    hasTabbedNav: false,
    showLogoInHeader: true,
    hasHeaderShadow: true,
    theme: {
      primaryColor: '#000000',
      headerColor: '#FFFFFF'
    },
    customDomain: null,
    favicon: null
  };

  private _compositions: Composition[];
  private _id: number;
  private _title: string;
  private _published: boolean;
  private _publishedOn: Date;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _parent: Composition;
  private _cover: any;
  private _metadata: CompositionMetadata;
  private _pages: Page[];
  private _errors: any[];

  constructor(params: CompositionDataInterface) {

    this._pages = [];
    this._compositions = [];

    if (params) {
      this._id = params.id;
      this._title = params.title;
      this._published = params.published;
      this._createdAt = new Date(params.created_at);
      this._updatedAt = new Date(params.updated_at);
      this._cover = params.cover;
      this._metadata = params.metadata || {};
      this._errors = params.errors;

      if (params.published_on) {
        this._publishedOn = new Date(params.published_on);
      }

      if (params.compositions && params.compositions.length) {
        this._compositions = params.compositions.map(c => {
          return new Composition(c);
        });
      }

      if (params.pages && params.pages.length) {
        this._pages = params.pages.map(p => {
          return new Page(p);
        }).sort(Page.sortFn);
      }

      if (params.parent) {
        this._parent = new Composition(params.parent);
      }
    }
  }

  get id(): number {
    return this._id;
  }

  get title(): string {
    return this._title || '';
  }

  set title(title: string) {
    this._title = title;
  }

  get published(): boolean {
    return this._published;
  }

  set published(shouldPublish: boolean) {
    this._published = shouldPublish;
    if (shouldPublish) {
      this._publishedOn = new Date();
    }
  }

  get publishedOn(): Date {
    return this._publishedOn;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get parent(): Composition {
    return this._parent;
  }

  get cover(): string {
    if (this._cover && this._cover.media.url) {
      return this._cover.media.url;
    } else {
      return '/assets/img/placeholder.svg';
    }
  }

  set cover(coverUrl: string) {
    try {
      this._cover.media.url = coverUrl;
    } catch (e) {
      this._cover = {media: {url: coverUrl}};
    }
  }

  get metadata(): any {
    return this._metadata;
  }

  get favicon(): string {
    const fallback = '/assets/img/placeholder.svg';
    try {
      const collection = this._metadata.favicon;
      return collection.components[0].media.url || fallback;
    } catch (e) {
      return fallback;
    }
  }

  get pages(): Page[] {
    return this._pages;
  }

  set pages(pages: Page[]) {
    this._pages = pages;
  }

  get errors(): any[] {
    return this._errors;
  }

  get primaryColor(): string {
    if (this._metadata && this._metadata.theme) {
      return this._metadata.theme.primaryColor || '';
    } else {
      return '';
    }
  }

  set primaryColor(color: string) {
    if (this._metadata) {
      if (this._metadata.theme) {
        if (colorIsValidFullHexString(color)) {
          this._metadata.theme.primaryColor = getHexColorString(color);
        }
      } else {
        this._metadata.theme = {
          primaryColor: null,
          headerColor: null
        };
        this.primaryColor = color;
      }
    }
  }

  get primaryColorLight(): string {
    const primary = this.primaryColor;
    if (primary) {
      if (colorIsLight(this.headerColor)) {
        return darkenHexColorString(primary, 0.2);
      } else {
        return lightenHexColorString(primary, 0.2);
      }
    } else {
      return primary;
    }
  }

  get headerColor(): string {
    if (this._metadata && this._metadata.theme) {
      return this._metadata.theme.headerColor || '';
    } else {
      return '';
    }
  }

  set headerColor(color: string) {
    if (this._metadata) {
      if (this._metadata.theme) {
        if (colorIsValidFullHexString(color)) {
          this._metadata.theme.headerColor = getHexColorString(color);
        }
      } else {
        this._metadata.theme = {
          headerColor: null,
          primaryColor: null
        };
        this.headerColor = color;
      }
    }
  }

  get sites(): Composition[] {
    return this._compositions;
  }

  set customDomain(customDomain: CompositionCustomDomain) {
    if (this._metadata) {
      this._metadata.customDomain = customDomain;
    }
  }

  get customDomain(): CompositionCustomDomain {
    if (this._metadata && this._metadata.customDomain) {
      return this._metadata.customDomain;
    } else {
      return null;
    }
  }

  shouldShowLogoInHeader(): boolean {
    if (this.metadata && this.metadata.hasOwnProperty('showLogoInHeader')) {
      return this.metadata.showLogoInHeader;
    } else {
      return false;
    }
  }

  hasHeaderShadow(): boolean {
    if (this.metadata && this.metadata!.hasOwnProperty('hasHeaderShadow')) {
      return this.metadata.hasHeaderShadow;
    } else {
      return false;
    }
  }

  hasTabbedNav(): boolean {
    if (this.metadata && this.metadata.hasOwnProperty('hasTabbedNav')) {
      return this.metadata.hasTabbedNav;
    } else {
      return false;
    }
  }

  hasCover(): boolean {
    try {
      return this._cover.media.url;
    } catch (e) {
      return false;
    }
  }

  hasFavicon(): boolean {
    try {
      const collection = this._metadata.favicon;
      return !!collection.components[0].media.url;
    } catch (e) {
      return false;
    }
  }

  isPublished(): boolean {
    return this.published;
  }

  asJson(): CompositionDataInterface {
    return {
      id: this._id,
      title: this._title,
      published: this._published,
      published_on: this._publishedOn ? this._publishedOn.getTime() : null,
      created_at: this._createdAt ? this._createdAt.getTime() : null,
      updated_at: this._updatedAt ? this._updatedAt.getTime() : null,
      parent: this._parent ? this._parent.asJson() : null,
      cover: this._cover,
      metadata: this._metadata,
      compositions: this._compositions ? this._compositions.map(c => c.asJson()) : [],
      pages: this._pages ? this._pages.map(p => p.asJson()) : []
    };
  }
}

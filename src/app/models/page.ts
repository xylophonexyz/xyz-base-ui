import {PageDataInterface, PageInterface, PageMetadata, PageNavigationItemNavigationStrategy, PageNavigationType} from '../index';
import {ComponentCollection} from './component-collection';
import {Composition} from './composition';
import {User} from './user';

export class Page implements PageInterface {

  private _guessedTitle: string;
  private _id: number;
  private _title: string;
  private _description: string;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _published: boolean;
  private _cover: any;
  private _components: ComponentCollection[];
  private _session: any;
  private _rating: number;
  private _commentCount: number;
  private _views: number;
  private _nods: any[];
  private _metadata: PageMetadata;
  private _userId: number;
  private _user?: User;
  private _compositionId: number;
  private _composition: Composition;
  private _tags: any[];
  private _errors?: any[];

  static sortFn(a, b) {
    try {
      if (a.metadata.index > b.metadata.index) {
        return 1;
      } else if (a.metadata.index < b.metadata.index) {
        return -1;
      } else {
        return 0;
      }
    } catch (e) {
      return 0;
    }
  }

  static swap(source: Page, target: Page, incr: number) {
    try {
      if (target._metadata.index === (source._metadata.index + incr)) {
        const temp = target._metadata.index;
        target._metadata.index = source._metadata.index;
        source._metadata.index = temp;
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }

  constructor(params: PageDataInterface) {
    if (params) {
      this._id = params.id;
      this._title = params.title;
      this._description = params.description;
      this._createdAt = new Date(params.created_at);
      this._updatedAt = new Date(params.updated_at);
      this._published = params.published;
      this._cover = params.cover;
      this._guessedTitle = params.guessed_title;
      this._session = params.session;
      this._rating = params.rating;
      this._commentCount = params.comment_count;
      this._views = params.views;
      this._nods = params.nods;
      this._metadata = params.metadata;
      this._userId = params.user ? params.user.id : (params.user_id ? params.user_id : null);
      this._user = new User(params.user);
      this._compositionId = params.composition ? params.composition.id : null;
      this._composition = new Composition(params.composition);
      this._tags = params.tags;
      this._errors = params.errors;

      if (params.components) {
        this._components = params.components.map(c => {
          return new ComponentCollection(c);
        });
      } else {
        this._components = [];
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

  get description(): string {
    return this._description || '';
  }

  set description(description: string) {
    this._description = description;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get published(): boolean {
    return this._published;
  }

  set published(shouldPublish: boolean) {
    this._published = shouldPublish;
  }

  get cover(): any {
    if (this.hasCover()) {
      return this._cover;
    } else {
      return '/assets/img/placeholder.svg';
    }
  }

  get components(): ComponentCollection[] {
    return this._components;
  }

  set components(components: ComponentCollection[]) {
    this._components = components;
  }

  get session(): any {
    return this._session;
  }

  get rating(): number {
    return this._rating;
  }

  get commentCount(): number {
    return this._commentCount;
  }

  get views(): number {
    return this._views;
  }

  get nods(): any[] {
    return this._nods;
  }

  get metadata(): PageMetadata {
    return this._metadata;
  }

  set metadata(metadata: PageMetadata) {
    this._metadata = metadata;
  }

  get userId(): number {
    return this._userId;
  }

  get user(): User {
    return this._user;
  }

  get compositionId(): number {
    return this._compositionId;
  }

  get composition(): Composition {
    return this._composition;
  }

  get tags(): any[] {
    return this._tags;
  }

  get errors(): any[] {
    return this._errors;
  }

  get bestGuessTitle(): string {
    return this._guessedTitle || 'Untitled';
  }

  get index(): number {
    try {
      return this._metadata.index;
    } catch (e) {
      return Infinity;
    }
  }

  set navigationType(navigationType: PageNavigationType) {
    try {
      this._metadata.navigationType = navigationType;
    } catch (e) {
    }
  }

  set navigationHref(url: string) {
    try {
      this._metadata.navigationHref = url;
    } catch (e) {
    }
  }

  get navigationHref(): string {
    try {
      return this._metadata.navigationHref;
    } catch (e) {
      return null;
    }
  }

  hasCover(): boolean {
    return !!this._cover;
  }

  hasHeader(): boolean {
    if (this._metadata) {
      return this._metadata.showNav;
    } else {
      return false;
    }
  }

  hasTransparentHeader(): boolean {
    if (this._metadata) {
      return this._metadata.hasTransparentHeader;
    } else {
      return false;
    }
  }

  isExternalNavigationType(): boolean {
    if (this._metadata) {
      return this._metadata.navigationType === PageNavigationItemNavigationStrategy.External;
    } else {
      return false;
    }
  }

  isNavigationItem(): boolean {
    if (this._metadata) {
      return this._metadata.navigationItem;
    } else {
      return false;
    }
  }

  isPublished(): boolean {
    return this.published;
  }

  asJson(): PageDataInterface {
    return {
      id: this._id,
      title: this._title,
      description: this._description,
      created_at: this._createdAt.getTime(),
      updated_at: this._updatedAt.getTime(),
      published: this._published,
      cover: this._cover,
      components: this._components.map(c => {
        return c.asJson();
      }),
      guessed_title: this._guessedTitle,
      session: this._session,
      rating: this._rating,
      comment_count: this._commentCount,
      views: this._views,
      nods: this._nods,
      metadata: this._metadata,
      user_id: this._userId,
      user: this.user ? this.user.asJson() : null,
      composition_id: this._compositionId,
      composition: this._composition.asJson(),
      tags: this._tags,
      errors: this._errors
    };
  }
}

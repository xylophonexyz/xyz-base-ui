import {
  CanonicalComponentCollectionType,
  ComponentCollectionDataInterface,
  ComponentCollectionInterface,
  ComponentDataInterface,
  LocalComponentType
} from '../index';
import {Component} from './component';

export class ComponentCollection implements ComponentCollectionInterface {

  private _id: number;
  private _index: number;
  private _type: CanonicalComponentCollectionType;
  private _collectibleId: number;
  private _collectibleType: string;
  private _components: Component[];
  private _metadata: any;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(params: ComponentCollectionDataInterface) {
    if (params) {
      this._id = params.id;
      this._index = params.index;
      this._type = params.type;
      this._collectibleId = params.collectible_id;
      this._collectibleType = params.collectible_type;
      this._metadata = params.metadata;
      this._createdAt = new Date(params.created_at);
      this._updatedAt = new Date(params.updated_at);

      if (params.components) {
        this._components = params.components.map((c: ComponentDataInterface) => {
          return new Component(c);
        });
      } else {
        this._components = [];
      }
    }
  }

  get id(): number {
    return this._id;
  }

  set id(id: number) {
    this._id = id;
  }

  get index(): number {
    return this._index;
  }

  set index(index: number) {
    this._index = index;
  }

  get type(): CanonicalComponentCollectionType {
    return this._type;
  }

  get collectibleId(): number {
    return this._collectibleId;
  }

  get collectibleType(): string {
    return this._collectibleType;
  }

  get components(): Component[] {
    return this._components;
  }

  get metadata(): any {
    return this._metadata;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get metatype(): LocalComponentType {
    if (this.metadata && this.metadata.metatype) {
      return this.metadata.metatype;
    } else {
      return 'ComponentCollection';
    }
  }

  asJson(): ComponentCollectionDataInterface {
    return {
      id: this._id,
      type: this._type,
      metadata: this._metadata,
      index: this._index,
      components: this._components.map(c => {
        return c.asJson();
      }),
      collectible_id: this._collectibleId,
      collectible_type: this._collectibleType,
      created_at: this._createdAt.getTime(),
      updated_at: this._updatedAt.getTime()
    };
  }
}

import {ComponentDataInterface, ComponentInterface, ComponentMedia, ComponentMetadata} from '../index';

export class Component implements ComponentInterface<ComponentMedia, ComponentMetadata> {

  private _id: number;
  private _index: number;
  private _type: string;
  private _media: any;
  private _mediaIsProcessing: boolean;
  private _componentCollectionId: number;
  private _metadata: any;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(params: ComponentDataInterface) {
    if (params) {
      this._id = params.id;
      this._index = params.index;
      this._type = params.type;
      this._media = params.media;
      this._mediaIsProcessing = params.media_processing;
      this._componentCollectionId = params.component_collection_id;
      this._metadata = params.metadata;
      this._createdAt = new Date(params.created_at);
      this._updatedAt = new Date(params.updated_at);
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

  get type(): string {
    return this._type;
  }

  get media(): any {
    return this._media;
  }

  set media(media: any) {
    this._media = media;
  }

  get mediaIsProcessing(): boolean {
    return this._mediaIsProcessing;
  }

  set mediaIsProcessing(isProcessing: boolean) {
    this._mediaIsProcessing = isProcessing;
  }

  get componentCollectionId(): number {
    return this._componentCollectionId;
  }

  set componentCollectionId(id: number) {
    this._componentCollectionId = id;
  }

  get metadata(): any {
    return this._metadata;
  }

  set metadata(metadata: any) {
    this._metadata = metadata;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  asJson(): ComponentDataInterface {
    return {
      id: this._id,
      index: this._index,
      type: this._type,
      media: this._media,
      media_processing: this._mediaIsProcessing,
      component_collection_id: this._componentCollectionId,
      metadata: this._metadata,
      created_at: this._createdAt.getTime(),
      updated_at: this._updatedAt.getTime()
    };
  }
}

import {ComponentCollectionDataInterface} from '../index';
import {Component} from './component';
import {ComponentCollection} from './component-collection';
import {mockComponentData} from './component.spec';

export const mockComponentCollectionData: ComponentCollectionDataInterface = {
  id: 1,
  index: 0,
  type: 'ComponentCollection',
  collectible_id: 2,
  collectible_type: 'Page',
  metadata: {},
  components: [
    mockComponentData
  ],
  created_at: new Date().getTime(),
  updated_at: new Date().getTime()
};

describe('ComponentCollection', () => {
  it('should take a ComponentDataInterface object as a constructor arg', () => {
    const collection = new ComponentCollection(mockComponentCollectionData);
    expect(collection).toBeTruthy();
  });

  it('should take a ComponentDataInterface object as a constructor arg', () => {
    const collection = new ComponentCollection(Object.assign({}, mockComponentCollectionData, {components: null}));
    expect(collection).toBeTruthy();
  });

  it('should take null arg in constructor', () => {
    const collection = new ComponentCollection(null);
    expect(collection).toBeTruthy();
  });

  it('should provide getters for all public attributes', () => {
    const collection = new ComponentCollection(mockComponentCollectionData);
    expect(collection.id).toEqual(mockComponentCollectionData.id);
    expect(collection.index).toEqual(mockComponentCollectionData.index);
    expect(collection.type).toEqual(mockComponentCollectionData.type);
    expect(collection.metatype).toEqual('ComponentCollection');
    expect(collection.collectibleId).toEqual(mockComponentCollectionData.collectible_id);
    expect(collection.collectibleType).toEqual(mockComponentCollectionData.collectible_type);
    expect(collection.metadata).toEqual(mockComponentCollectionData.metadata);
    expect(collection.createdAt.getTime()).toEqual(mockComponentCollectionData.created_at);
    expect(collection.updatedAt.getTime()).toEqual(mockComponentCollectionData.updated_at);
    expect(collection.components.length).toEqual(1);
    expect(collection.components[0] instanceof Component).toEqual(true);
  });

  it('should provide a setter for the id field', () => {
    const collection = new ComponentCollection(mockComponentCollectionData);
    expect(collection.id).toEqual(mockComponentCollectionData.id);
    collection.id = 1234;
    expect(collection.id).toEqual(1234);
  });

  it('should provide a setter for the index field', () => {
    const collection = new ComponentCollection(mockComponentCollectionData);
    expect(collection.index).toEqual(mockComponentCollectionData.index);
    collection.index = 1234;
    expect(collection.index).toEqual(1234);
  });

  it('should serialize the collection', () => {
    const collection = new ComponentCollection(mockComponentCollectionData);
    expect(collection.asJson()).toEqual(mockComponentCollectionData);
  });
});

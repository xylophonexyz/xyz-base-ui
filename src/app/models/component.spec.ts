import {ComponentDataInterface} from '../index';
import {Component} from './component';

export const mockComponentData: ComponentDataInterface = {
  id: 123,
  index: 0,
  type: 'Component',
  media: null,
  media_processing: true,
  component_collection_id: 1,
  metadata: {} as any,
  created_at: new Date().getTime(),
  updated_at: new Date().getTime()
};

describe('Component', () => {
  it('should take a ComponentDataInterface object as a constructor arg', () => {
    const component = new Component(mockComponentData);
    expect(component).toBeTruthy();
  });

  it('should take null arg in constructor', () => {
    const component = new Component(null);
    expect(component).toBeTruthy();
  });

  it('should provide getters for all public attributes', () => {
    const component = new Component(mockComponentData);
    expect(component.id).toEqual(mockComponentData.id);
    expect(component.index).toEqual(mockComponentData.index);
    expect(component.type).toEqual(mockComponentData.type);
    expect(component.media).toEqual(mockComponentData.media);
    expect(component.mediaIsProcessing).toEqual(mockComponentData.media_processing);
    expect(component.componentCollectionId).toEqual(mockComponentData.component_collection_id);
    expect(component.metadata).toEqual(mockComponentData.metadata);
    expect(component.createdAt.getTime()).toEqual(mockComponentData.created_at);
    expect(component.updatedAt.getTime()).toEqual(mockComponentData.updated_at);
  });

  it('should provide setters', () => {
    const component = new Component(mockComponentData);
    component.media = ['foo'];
    expect(component.media).toEqual(['foo']);
    expect(component.id).toEqual(mockComponentData.id);
    component.id = 1234;
    expect(component.id).toEqual(1234);
  });

  it('should serialize the component', () => {
    const component = new Component(mockComponentData);
    expect(component.asJson()).toEqual(mockComponentData);
  });
});

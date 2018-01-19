import {CompositionDataInterface} from '../index';
import {mockPageData} from '../providers/pages.service.spec';
import {getMockCompositionData, mockCompositionData} from '../providers/sites.service.spec';
import {darkenHexColorString, lightenHexColorString} from '../util/colors';
import {Composition} from './composition';
import {Page} from './page';

describe('Composition', () => {

  let compositionData: CompositionDataInterface = null;
  let composition: Composition = null;

  beforeEach(() => {
    compositionData = Object.assign({}, getMockCompositionData(), {pages: [mockPageData]});
  });

  it('should create a composition from a CompositionDataInterface object', () => {
    composition = new Composition(compositionData);
    expect(composition.id).toEqual(1);
  });

  it('should provide getters for all public attributes', () => {
    expect(composition.title).toEqual('MySite');
    expect(composition.published).toEqual(false);
    expect(composition.createdAt).toBeDefined();
    expect(composition.updatedAt).toBeDefined();
    expect(composition.sites).toEqual([]);
    expect(composition.pages.length).toEqual(1);
    expect(composition.metadata).toBeDefined();
    expect(composition.customDomain).toBeDefined();
    expect(composition.primaryColor).toEqual('');
    expect(composition.headerColor).toEqual('');
    expect(composition.headerHoverColor).toEqual('');
    expect(composition.favicon).toBeDefined();
    expect(composition.pages[0] instanceof Page).toEqual(true);
    expect(composition.cover).toBeDefined();
    expect(composition.publishedOn).toBeDefined();
    expect(composition.parent).not.toBeDefined();
    expect(composition.errors).toEqual([]);
  });

  it('should provide helpers to return configuration status', () => {
    expect(composition.shouldShowLogoInHeader()).toBeFalsy();
    composition.metadata.showLogoInHeader = true;
    expect(composition.shouldShowLogoInHeader()).toEqual(true);
    expect(composition.hasHeaderShadow()).toBeFalsy();
    composition.metadata.hasHeaderShadow = true;
    expect(composition.hasHeaderShadow()).toEqual(true);
    expect(composition.hasTabbedNav()).toBeFalsy();
    composition.metadata.hasTabbedNav = true;
    expect(composition.hasTabbedNav()).toEqual(true);
  });

  it('should provide a getter for a favicon', () => {
    composition.metadata.favicon = {components: [{media: {url: 'foo.jpg'}}]};
    expect(composition.favicon).toEqual('foo.jpg');
  });

  it('should provide a setter for custom domain', () => {
    composition.customDomain = {
      zoneId: '123',
      domainName: 'example.com',
      nameServers: [],
      domainMappings: [],
      requiredDnsRecords: [],
      selfManagedDns: false
    };
    expect(composition.customDomain).toBeDefined();
    expect(composition.customDomain.zoneId).toEqual('123');
  });

  it('should catch errors when returning configuration status', () => {
    composition = new Composition(Object.assign({}, mockCompositionData, {metadata: 123}));
    expect(composition.hasTabbedNav()).toBeFalsy();
    expect(composition.hasHeaderShadow()).toBeFalsy();
    expect(composition.shouldShowLogoInHeader()).toBeFalsy();
  });

  it('should return a cover image', () => {
    compositionData.cover = {media: {url: 'cat.jpg'}};
    composition = new Composition(compositionData);
    expect(composition.cover).toBeDefined();
    expect(composition.cover).not.toBeNull();
  });

  it('should provide a fallback cover image', () => {
    composition = new Composition(compositionData);
    expect(composition.cover).toBeDefined();
    expect(composition.cover).not.toBeNull();
  });

  it('should create composition objects for each CompositionDataInterface object in "sites"', () => {
    compositionData.compositions.push({title: 'bar'} as CompositionDataInterface);
    composition = new Composition(compositionData);
    expect(composition.sites[0].title).toEqual('bar');
  });

  it('should create composition objects for each CompositionDataInterface object in "parent"', () => {
    compositionData.parent = {title: 'bar'} as CompositionDataInterface;
    composition = new Composition(compositionData);
    expect(composition.parent.title).toEqual('bar');
  });

  it('should allow setting the title', () => {
    composition = new Composition(compositionData);
    composition.title = 'New Title!';
    expect(composition.title).toEqual('New Title!');
  });

  it('should allow setting the published value', () => {
    composition = new Composition(compositionData);
    compositionData.published_on = null;
    composition.published = true;
    expect(composition.published).toEqual(true);
    expect(composition.publishedOn).not.toBeNull();
  });

  it('should provide a method to serialize a composition object', () => {
    compositionData.compositions = [null];
    composition = new Composition(compositionData);
    expect(composition.asJson().title).toEqual(compositionData.title);
    expect(composition.asJson().id).toEqual(compositionData.id);
    expect(composition.asJson().published).toEqual(compositionData.published);
  });

  it('should allow setters', () => {
    composition = new Composition(compositionData);
    expect(composition.pages.length).toEqual(1);
    composition.pages = [];
    expect(composition.pages.length).toEqual(0);
  });

  it('should provide a setter for primaryColor', () => {
    composition = new Composition(Object.assign(compositionData, {metadata: null}));
    expect(composition.primaryColor).toEqual('');
    composition.primaryColor = 'FFEEff';
    expect(composition.primaryColor).toEqual('#FFEEFF');

    composition = new Composition(Object.assign(compositionData, {metadata: null}));
    expect(composition.primaryColor).toEqual('');
    composition.primaryColor = 'asdf234';
    expect(composition.primaryColor).toEqual('');
  });

  it('should provide a setter for headerColor', () => {
    composition = new Composition(Object.assign(compositionData, {metadata: null}));
    expect(composition.headerColor).toEqual('');
    composition.headerColor = 'FFEEff';
    expect(composition.headerColor).toEqual('#FFEEFF');

    composition = new Composition(Object.assign(compositionData, {metadata: null}));
    expect(composition.headerColor).toEqual('');
    composition.headerColor = 'asdf234';
    expect(composition.headerColor).toEqual('');
  });

  it('should provide a setter for headerHoverColor', () => {
    composition = new Composition(Object.assign(compositionData, {metadata: null}));
    expect(composition.headerHoverColor).toEqual('');
    composition.headerHoverColor = 'FFEEff';
    expect(composition.headerHoverColor).toEqual('#FFEEFF');

    composition = new Composition(Object.assign(compositionData, {metadata: null}));
    expect(composition.headerHoverColor).toEqual('');
    composition.headerHoverColor = 'asdf234';
    expect(composition.headerHoverColor).toEqual('');
  });

  it('should return a lightened or darkened version of the primary color', () => {
    composition = new Composition(Object.assign(compositionData, {metadata: null}));
    expect(composition.primaryColorLight).toEqual('');
    composition.headerColor = '#FFFFFF';
    composition.primaryColor = '#53aFFF';
    expect(composition.primaryColorLight).toEqual(darkenHexColorString('#53aFFF', 0.2));
    composition.headerColor = '#000000';
    composition.primaryColor = '#53aFFF';
    expect(composition.primaryColorLight).toEqual(lightenHexColorString('#53aFFF', 0.2));
  });

});

import {PageDataInterface, PageNavigationItemNavigationStrategy} from '../index';
import {mockPageData} from '../providers/pages.service.spec';
import {Page} from './page';

describe('Page', () => {

  let pageData: PageDataInterface = null;
  let page: Page = null;

  beforeEach(() => {
    pageData = Object.assign({}, mockPageData);
  });

  it('should create a page from a PageDataInterface object', () => {
    page = new Page(pageData);
    expect(page.id).toEqual(1);
  });

  it('should provide getters for all public attributes', () => {
    page = new Page(pageData);
    expect(page.title).toEqual('MyTitle');
    expect(page.description).toEqual('My Descript');
    expect(page.published).toEqual(false);
    expect(page.createdAt).toBeDefined();
    expect(page.updatedAt).toBeDefined();
    expect(page.cover).toBeDefined();
    expect(page.bestGuessTitle).toBeDefined();
    expect(page.session).toBeDefined();
    expect(page.rating).toEqual(10000);
    expect(page.commentCount).toEqual(0);
    expect(page.views).toEqual(1);
    expect(page.nods.length).toEqual(0);
    expect(page.tags.length).toEqual(0);
    expect(page.metadata).toEqual({
      index: 0,
      showNav: false,
      navigationItem: false,
      hasTransparentHeader: false,
      navigationType: PageNavigationItemNavigationStrategy.Internal,
      navigationHref: null
    });
    expect(page.userId).toBeDefined();
    expect(page.compositionId).toBeDefined();
    expect(page.composition).toBeDefined();
    expect(page.errors).toEqual([]);
    expect(page.components.length).toEqual(1);
  });

  it('should return a cover image', () => {
    pageData.cover = {media: {url: 'cat.jpg'}};
    page = new Page(pageData);
    expect(page.cover).toBeDefined();
    expect(page.cover).not.toBeNull();
  });

  it('should provide a fallback cover image', () => {
    page = new Page(pageData);
    expect(page.cover).toBeDefined();
    expect(page.cover).not.toBeNull();
  });

  it('should return whether the page has a cover image defined', () => {
    page = new Page(Object.assign({}, pageData));
    expect(page.hasCover()).toEqual(false);
  });

  it('should return whether the page has a header that is hidden or shown', () => {
    page = new Page(Object.assign({}, pageData, {metadata: {showNav: true}}));
    expect(page.hasHeader()).toEqual(true);
    page = new Page(Object.assign({}, pageData, {metadata: null}));
    expect(page.hasHeader()).toEqual(false);
  });

  it('should provide a getter for the index', () => {
    const p1 = new Page(Object.assign({}, mockPageData, {metadata: {index: 0}}));
    expect(p1.index).toEqual(0);

    page = new Page(Object.assign({}, pageData, {metadata: null}));
    expect(page.index).toEqual(Infinity);
  });

  it('should provide a setter for the published variable', () => {
    const p1 = new Page(Object.assign({}, mockPageData, {metadata: {index: 0}}));
    expect(p1.published).toEqual(false);
    p1.published = true;
    expect(p1.published).toEqual(true);
  });

  it('should provide a setter for metadata', () => {
    const p1 = new Page(Object.assign({}, mockPageData, {metadata: {index: 0}}));
    p1.metadata = {index: 2, showNav: false, navigationItem: false, hasTransparentHeader: false};
    expect(p1.metadata).toEqual({index: 2, showNav: false, navigationItem: false, hasTransparentHeader: false});
  });

  it('should provide a setter for components', () => {
    const p1 = new Page(Object.assign({}, mockPageData, {metadata: {index: 0}}));
    p1.components = [];
    expect(p1.components).toEqual([]);
  });

  it('should provide a setter for description', () => {
    const p1 = new Page(Object.assign({}, mockPageData, {metadata: {index: 0}}));
    p1.description = 'Hello World';
    expect(p1.description).toEqual('Hello World');
  });

  it('should provide a method to tell if it is a navigation item', () => {
    expect(page.isNavigationItem()).toEqual(false);
    page.metadata = {navigationItem: true, index: page.index, showNav: true, hasTransparentHeader: false};
    expect(page.isNavigationItem()).toEqual(true);
  });

  it('should provide a method to tell if it is published', () => {
    expect(page.isPublished()).toEqual(false);
    page.published = true;
    expect(page.isPublished()).toEqual(true);
  });

  describe('Sorting', () => {
    it('should provide a default sort function', () => {
      const pData1 = Object.assign({}, mockPageData, {metadata: {index: 0}});
      const pData2 = Object.assign({}, mockPageData, {metadata: {index: 2}});
      const pData3 = Object.assign({}, mockPageData, {metadata: {index: 2}});
      const pData4 = Object.assign({}, mockPageData, {metadata: null});
      const pData5 = Object.assign({}, mockPageData, {metadata: {index: 6}});
      const pData6 = Object.assign({}, mockPageData, {metadata: {index: 5}});
      const p1 = new Page(pData1);
      const p2 = new Page(pData2);
      const p3 = new Page(pData3);
      const p4 = new Page(pData4);
      const p5 = new Page(pData5);
      const p6 = new Page(pData6);
      const array = [p6, p5, p2, p3, p1, p4];
      array.sort(Page.sortFn);
      expect(array[0]).toEqual(p1);
    });
  });

  describe('Swapping indicies', () => {
    it('should provide a swap function', () => {
      const pData1 = Object.assign({}, mockPageData, {metadata: {index: 0}});
      const pData2 = Object.assign({}, mockPageData, {metadata: {index: 2}});
      const p1 = new Page(pData1);
      const p2 = new Page(pData2);
      Page.swap(p1, p2, 2);
      expect(p1.metadata.index).toEqual(2);
      expect(p2.metadata.index).toEqual(0);
    });

    it('should return true if the operation proceeds', () => {
      const pData1 = Object.assign({}, mockPageData, {metadata: {index: 0}});
      const pData2 = Object.assign({}, mockPageData, {metadata: {index: 2}});
      const p1 = new Page(pData1);
      const p2 = new Page(pData2);
      expect(Page.swap(p1, p2, 2)).toEqual(true);
      expect(p1.metadata.index).toEqual(2);
      expect(p2.metadata.index).toEqual(0);
    });

    it('should return false if the operation fails', () => {
      const pData1 = Object.assign({}, mockPageData, {metadata: {index: 0}});
      const pData2 = Object.assign({}, mockPageData, {metadata: {index: 2}});
      const p1 = new Page(pData1);
      const p2 = new Page(pData2);
      expect(Page.swap(p1, p2, 1)).toEqual(false);
      expect(p1.metadata.index).toEqual(0);
      expect(p2.metadata.index).toEqual(2);
    });

    it('should ignore the swap operation if the target element doesnt have the specified index', () => {
      const pData1 = Object.assign({}, mockPageData, {metadata: {index: 0}});
      const pData2 = Object.assign({}, mockPageData, {metadata: {index: 2}});
      const p1 = new Page(pData1);
      const p2 = new Page(pData2);
      Page.swap(p1, p2, 1);
      expect(p1.metadata.index).toEqual(0);
      expect(p2.metadata.index).toEqual(2);
    });

    it('should ignore malformed data', () => {
      const pData1 = Object.assign({}, mockPageData, {metadata: null});
      const pData2 = Object.assign({}, mockPageData, {metadata: {index: 2}});
      const p1 = new Page(pData1);
      const p2 = new Page(pData2);
      expect(Page.swap(p1, p2, 1)).toEqual(false);
      expect(p1.metadata).toEqual(null);
      expect(p2.metadata.index).toEqual(2);
    });

    it('should provide a getter for navigation href', () => {
      const pData1 = Object.assign({}, mockPageData, {metadata: {navigationHref: 'http://foo.com'}});
      const pData2 = Object.assign({}, mockPageData, {metadata: null});
      const p1 = new Page(pData1);
      const p2 = new Page(pData2);
      expect(p1.navigationHref).toEqual('http://foo.com');
      expect(p2.navigationHref).toBeNull();
    });

    it('should provide a method to determine the navigation type', () => {
      const pData1 = Object.assign({}, mockPageData, {metadata: {navigationHref: 'http://foo.com', navigationType: PageNavigationItemNavigationStrategy.Internal}});
      const pData2 = Object.assign({}, mockPageData, {metadata: null});
      const p1 = new Page(pData1);
      const p2 = new Page(pData2);
      expect(p1.isExternalNavigationType()).toEqual(false);
      expect(p2.isExternalNavigationType()).toEqual(false);
    });
  });
});

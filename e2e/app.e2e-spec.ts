import {XyzUiPage} from './app.po';

describe('xyz-ui App', () => {
  let page: XyzUiPage;

  beforeEach(() => {
    page = new XyzUiPage();
  });

  xit('should display message saying app works', (done) => {
    page.navigateTo();
    page.getParagraphText().then(text => {
      expect(text).toEqual('app works!');
      done();
    });
  });
});

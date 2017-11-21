import createSpy = jasmine.createSpy;

export const storageStub = {
  get: createSpy('get').and.callFake(() => {
    return new Promise(resolve => resolve({access_token: '1234'}));
  }),
  set: createSpy('set').and.callFake(() => {
    return new Promise(resolve => resolve());
  }),
  remove: createSpy('remove').and.callFake(() => {
    return new Promise(resolve => resolve());
  }),
  ready: createSpy('ready').and.callFake(() => {
    return new Promise(resolve => resolve());
  })
};

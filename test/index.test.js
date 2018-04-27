import VFFLoader from '..';

describe('built VFFLoader', () => {
  it('should pass smoke test', () => {
    const loader = new VFFLoader();
    expect(loader).toBeInstanceOf(VFFLoader);
  });
});

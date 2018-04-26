import VFFLoader from '..';

describe('VFFLoader', () => {
  it('should be a constructor', () => {
    const loader = new VFFLoader();
    expect(loader).toBeInstanceOf(VFFLoader);
  });
});

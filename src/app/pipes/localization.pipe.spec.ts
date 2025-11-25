import { LocalizePipe } from './localization.pipe';

describe('LocalizationPipe', () => {
  it('create an instance', () => {
    const pipe = new LocalizePipe();
    expect(pipe).toBeTruthy();
  });
});

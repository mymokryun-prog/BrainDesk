import { describe, expect, it } from 'vitest';
import { createQuickItemInput } from '../utils/quickAdd';

describe('createQuickItemInput', () => {
  it('trims title and uses the active category when available', () => {
    expect(createQuickItemInput('  Call finance team  ', 'Company', 'task')).toMatchObject({
      title: 'Call finance team',
      category: 'Company',
      type: 'task',
    });
  });

  it('returns undefined for blank titles and falls back to Personal for All category', () => {
    expect(createQuickItemInput('   ', 'Company', 'note')).toBeUndefined();
    expect(createQuickItemInput('Read notes', 'All', 'note')).toMatchObject({
      category: 'Personal',
    });
  });
});

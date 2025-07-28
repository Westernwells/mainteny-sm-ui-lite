import {normalizeString} from 'utils/string';
import {assert} from 'vitest';

describe('normalizeString', () => {
  it('should match copy-pasted and original customer names with special characters', () => {
    const original = 'W. Grote Vermögensverwaltungs GmbH & Co. KG';

    const pasted = 'W. Grote Vermögensverwaltungs GmbH & Co. KG\u200B ';
    assert(normalizeString(pasted) === normalizeString(original));
  });

  it('should ignore case', () => {
    const original = 'W. Grote Vermögensverwaltungs GmbH & Co. KG';
    const pasted = 'w. grote vermögensverwaltungs gmbh & co. kg';
    assert(
      normalizeString(pasted).toLowerCase() ===
        normalizeString(original).toLowerCase(),
    );
  });

  it('should normalize newlines and whitespace', () => {
    const original = 'W. Grote Vermögensverwaltungs GmbH & Co. KG';
    const withNewline = 'W. Grote Vermögensverwaltungs\nGmbH & Co. KG';
    assert(normalizeString(withNewline) === normalizeString(original));
  });
});

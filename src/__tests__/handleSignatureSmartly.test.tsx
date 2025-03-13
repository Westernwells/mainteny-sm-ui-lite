import {handleSignatureSmartly} from 'utils/rich-field-string';
import {describe, it, expect} from 'vitest';

describe('handleSignatureSmartly', () => {
  const textWithSignature = `
    <p>This is text content</p>
    <p>Okay now</p>
    <table><tr><td><p>Best regards,<br/>John Doe</p></td></tr></table>
  `;

  const plainTextSignature = `
    <table><tr><td><p>Best regards,<br/>John Doe</p></td></tr></table>
  `;

  const imageSignature = `
    <table><tr><td><img src="cid:signature-image"/></td></tr></table>
  `;

  const imageAndTextSignature = `
    <table><tr>
      <td><img src="cid:signature-image"/></td>
      <td><p>Best regards,<br/>John Doe</p></td>
    </tr></table>
  `;

  const emptySignature = `
    <table><tr><td>&nbsp;</td></tr></table>
  `;

  const partialTextWithEmptyImage = `
    <table><tr>
      <td><img src=""/></td>
      <td><p>Best regards,<br/>John Doe</p></td>
    </tr></table>
  `;

  it('should not affect text before signature and only modify signature table', () => {
    const result = handleSignatureSmartly(textWithSignature);

    expect(result).toContain('<p>This is text content</p>');
    expect(result).toContain('<p>Okay now</p>');

    expect(result).toContain('<table data-signature="true"');
    expect(result).toContain('Best regards');
    expect(result).toContain('John Doe');
  });

  it('should preserve text-only signature', () => {
    const result = handleSignatureSmartly(plainTextSignature);
    expect(result).toContain('Best regards');
    expect(result).toContain('<table');
  });

  it('should preserve image-only signature if valid image provided', () => {
    const result = handleSignatureSmartly(imageSignature, 'signature-image');
    expect(result).toContain('cid:signature-image');
    expect(result).toContain('<table');
  });

  it('should remove image-only signature if image is missing', () => {
    const result = handleSignatureSmartly(imageSignature);
    expect(result).not.toContain('<table');
  });

  it('should preserve combined image+text signature if valid image provided', () => {
    const result = handleSignatureSmartly(
      imageAndTextSignature,
      'signature-image',
    );
    expect(result).toContain('cid:signature-image');
    expect(result).toContain('Best regards');
  });

  it('should fallback to text-only if image missing in combined signature', () => {
    const result = handleSignatureSmartly(imageAndTextSignature);
    expect(result).toContain('Best regards');
    expect(result).not.toContain('src=');
  });

  it('should remove empty signature', () => {
    const result = handleSignatureSmartly(emptySignature);
    expect(result).not.toContain('<table');
  });

  it('should fallback to text if image invalid but text present', () => {
    const result = handleSignatureSmartly(partialTextWithEmptyImage);
    expect(result).toContain('Best regards');
    expect(result).not.toContain('src=');
  });
});

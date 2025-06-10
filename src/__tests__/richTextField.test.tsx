import {HTML_PDF_FONT_SIZE} from 'models/richTextField';
import {
  normalizePdfInlineStyles,
  modifyHTMLFontSizeForPDFRendering,
  generateTextIndent,
  flattenTableHtml,
} from 'utils/rich-text-field';
import {describe, it, expect} from 'vitest';
import {collapseNBSPParagraphs} from 'utils/text-block';
import {sampleRawHtml} from './mocks/richTextField';

describe('normalizePdfInlineStyles', () => {
  it('strips out color and font-family but keeps font-size(px) and padding(px)', () => {
    const input = `
      <p style="font-family: Arial; color: red; font-size: 20px; padding-left: 24px; padding-right: 8px; background-color: yellow">
        Hello
      </p>
    `.trim();

    const output = normalizePdfInlineStyles(input);

    expect(output).toContain(
      'style="padding-left: 24px; padding-right: 8px; font-size: 20px"',
    );
    expect(output).not.toContain('color:');
    expect(output).not.toContain('font-family:');
    expect(output).not.toContain('background-color:');
  });

  it('converts font-size: XXem → px correctly (1em = 16px)', () => {
    const input = `<span style="font-size:1.2em; padding-left: 2em; color:blue">X</span>`;
    const output = normalizePdfInlineStyles(input);

    expect(output).toContain('style="padding-left: 32px; font-size: 19.2px"');
    expect(output).not.toContain('color:');
  });

  it('keeps padding-left/right in em → px (emToPx) and carries font-size:px → px', () => {
    const input = `<div style="padding-left:0.5em; padding-right:16px; font-size:14px; text-indent: 10px">
      Content
    </div>`;
    const output = normalizePdfInlineStyles(input);

    expect(output).toContain(
      'style="padding-left: 8px; padding-right: 16px; font-size: 14px"',
    );
    expect(output).not.toContain('text-indent');
  });

  it('drops the entire style attribute if no font-size or padding-left/right present', () => {
    const input = `<p style="color:green">NoStyles</p>`;
    const output = normalizePdfInlineStyles(input);

    expect(output).toBe(`<p>NoStyles</p>`);
  });

  it('handles multiple tags in a single string', () => {
    const input = `
      <div style="font-size:12px; padding-left:4px">A</div>
      <span style="font-size: 1em; padding-right:0.25em; background: black">B</span>
      <p style="font-family: serif;">C</p>
    `;
    const output = normalizePdfInlineStyles(input);

    expect(output).toContain(
      `<div style="padding-left: 4px; font-size: 12px">A</div>`,
    );

    expect(output).toContain(
      `<span style="padding-right: 4px; font-size: 16px">B</span>`,
    );

    expect(output).toContain(`<p>C</p>`);
  });
});

describe('modifyHTMLFontSizeForPDFRendering', () => {
  it('maps SMALL (12px) → HTML_PDF_FONT_SIZE.SMALL (9px)', () => {
    const raw = `<p><span style="font-size: 12px">Text</span></p>`;
    const out = modifyHTMLFontSizeForPDFRendering(raw);
    expect(out).toContain(`font-size: ${HTML_PDF_FONT_SIZE.SMALL}`);
  });

  it('maps LARGE (20px) → HTML_PDF_FONT_SIZE.LARGE (14px)', () => {
    const raw = `<p><span style="font-size: 20px">Large</span></p>`;
    const out = modifyHTMLFontSizeForPDFRendering(raw);
    expect(out).toContain(`font-size: ${HTML_PDF_FONT_SIZE.LARGE}`);
  });

  it('maps any other value → HTML_PDF_FONT_SIZE.NORMAL (11px)', () => {
    const raw = `<p><span style="font-size: 16px">Default</span></p>`;
    const out = modifyHTMLFontSizeForPDFRendering(raw);
    expect(out).toContain(`font-size: ${HTML_PDF_FONT_SIZE.NORMAL}`);
  });

  it('leaves elements without font-size untouched', () => {
    const raw = `<p>NoFontSize</p>`;
    const out = modifyHTMLFontSizeForPDFRendering(raw);
    expect(out).toContain(`<p>NoFontSize</p>`);
  });
});

describe('generateTextIndent', () => {
  it('adds a margin-left equal to text-indent (px case)', () => {
    const html = `<p style="text-indent:32px">Indented</p>`;
    const out = generateTextIndent(html);

    expect(out).toContain('text-indent: 32px');
    expect(out).toContain('margin-left: 32px');
  });

  it('adds a margin-left equal to text-indent (em case) but does not remove text-indent', () => {
    const html = `<div style="text-indent:1.5em; color:blue">X</div>`;
    const out = generateTextIndent(html);

    expect(out).toContain('text-indent: 1.5em');
    expect(out).toContain('margin-left: 1.5em');
    expect(out).toContain('color: blue');
  });

  it('handles multiple nodes and preserves everything else', () => {
    const html = `
      <div style="text-indent:16px;color:red">A</div>
      <p style="text-indent:1em">B</p>
      <span>C</span>
    `;
    const out = generateTextIndent(html);

    expect(out).toContain('text-indent: 16px');
    expect(out).toContain('margin-left: 16px');
    expect(out).toContain('color: red');

    expect(out).toContain('text-indent: 1em');
    expect(out).toContain('margin-left: 1em');
    expect(out).toContain(`<span>C</span>`);
  });
});

describe('Full pipeline on a complex <table> snippet', () => {
  it('removes all table-related tags', () => {
    const flattened = flattenTableHtml(sampleRawHtml);
    expect(flattened).not.toContain('<table');
    expect(flattened).not.toContain('<tr');
    expect(flattened).not.toContain('<td');
    expect(flattened).not.toContain('<colgroup');
    expect(flattened).not.toContain('<tbody');
    expect(flattened).not.toContain('</table>');
    expect(flattened).not.toContain('</tr>');
    expect(flattened).not.toContain('</td>');
    expect(flattened).not.toContain('</colgroup');
  });

  it('strips disallowed inline styles and preserves paragraph text', () => {
    const flattened = flattenTableHtml(sampleRawHtml);
    const indented = generateTextIndent(flattened);
    const normalized = normalizePdfInlineStyles(indented);

    expect(normalized).not.toContain('<span style=');

    expect(normalized).toContain(
      'Maschinenraumloser Aufzug mit energiesparendem getriebelosem Antrieb',
    );
    expect(normalized).toContain('Fahrtenzahl 180 je Stunde');
    expect(normalized).toContain(
      'Demontage und Entsorgung der alten Aufzugsanlage inklusive',
    );

    expect(normalized).not.toContain('margin:');
    expect(normalized).not.toContain('line-height:');
    expect(normalized).not.toContain('white-space:');
    expect(normalized).not.toContain('font-family:');

    const disallowedInP =
      /<p[^>]*style="[^"]*(?:(margin:|line-height:|white-space:|font-family:))[^"]*"/;
    expect(disallowedInP.test(normalized)).toBe(false);

    expect(normalized).toContain('p style="padding-right: 16px"');
  });
});

describe('collapseNBSPParagraphs()', () => {
  it('should collapse a `<p><span>&nbsp;</span></p>` by setting inline styles', () => {
    const input = `
      <div>
        <p><span>&nbsp;</span></p>
      </div>
    `;

    const output = collapseNBSPParagraphs(input);
    const container = document.createElement('div');
    container.innerHTML = output;
    const p = container.querySelector('p') as HTMLParagraphElement;

    expect(p).not.toBeNull();

    expect(p.style.margin).toBe('0px');
    expect(p.style.padding).toBe('0px');
    expect(p.style.lineHeight).toBe('0');
    expect(p.style.overflow).toBe('hidden');
  });

  it('should not collapse a `<p>` that has text content', () => {
    const input = `
      <div>
        <p><span>Hello world</span></p>
      </div>
    `;

    const output = collapseNBSPParagraphs(input);
    const container = document.createElement('div');
    container.innerHTML = output;
    const p = container.querySelector('p') as HTMLParagraphElement;

    expect(p).not.toBeNull();

    expect(p.style.margin).toBe('');
    expect(p.style.padding).toBe('');
    expect(p.style.lineHeight).toBe('');
    expect(p.style.overflow).toBe('');
  });

  it('should not collapse a `<p>` that has multiple children (even if one child is &nbsp;)', () => {
    const input = `
      <div>
        <p>
          <span>&nbsp;</span>
          <span>Real text</span>
        </p>
      </div>
    `;

    const output = collapseNBSPParagraphs(input);
    const container = document.createElement('div');
    container.innerHTML = output;
    const p = container.querySelector('p') as HTMLParagraphElement;

    expect(p).not.toBeNull();

    expect(p.style.margin).toBe('');
    expect(p.style.lineHeight).toBe('');
  });

  it('should not collapse a `<p>` that has a <span> with something other than &nbsp; (e.g. whitespace text)', () => {
    const input = `
      <div>
        <p><span>  </span></p>  <!-- Two normal spaces, not a single \u00A0 -->
      </div>
    `;

    const output = collapseNBSPParagraphs(input);
    const container = document.createElement('div');
    container.innerHTML = output;
    const p = container.querySelector('p') as HTMLParagraphElement;

    expect(p).not.toBeNull();

    expect(p.style.lineHeight).toBe('');
  });

  it('should collapse only those <p> elements with exactly one <span> containing &nbsp;, leaving siblings intact', () => {
    const input = `
      <div>
        <p><span>&nbsp;</span></p>
        <p><span>Visible text</span></p>
        <p><span>&nbsp;</span></p>
      </div>
    `;

    const output = collapseNBSPParagraphs(input);
    const container = document.createElement('div');
    container.innerHTML = output;
    const paragraphs = Array.from(container.querySelectorAll('p'));

    expect(paragraphs.length).toBe(3);

    // First <p> should be collapsed:
    expect(paragraphs[0].style.lineHeight).toBe('0');
    expect(paragraphs[0].style.margin).toBe('0px');

    // Second <p> should remain untouched:
    expect(paragraphs[1].style.lineHeight).toBe('');
    expect(paragraphs[1].textContent).toBe('Visible text');

    // Third <p> (again only &nbsp;) should be collapsed:
    expect(paragraphs[2].style.lineHeight).toBe('0');
    expect(paragraphs[2].style.margin).toBe('0px');
  });

  it('should leave completely unrelated tags untouched', () => {
    const input = `
      <div>
        <h1>Title</h1>
        <p><span>&nbsp;</span></p>
        <ul>
          <li><span>Item 1</span></li>
        </ul>
      </div>
    `;

    const output = collapseNBSPParagraphs(input);
    const container = document.createElement('div');
    container.innerHTML = output;

    // <h1> should remain exactly as-is:
    const h1 = container.querySelector('h1')!;
    expect(h1.textContent).toBe('Title');
    expect(h1.getAttribute('style')).toBeNull();

    // The <li> should remain untouched as well:
    const li = container.querySelector('li')!;
    expect(li.textContent).toBe('Item 1');
    expect(li.getAttribute('style')).toBeNull();

    // The only <p> should still exist but be collapsed:
    const p = container.querySelector('p')!;
    expect(p.style.lineHeight).toBe('0');
  });
});

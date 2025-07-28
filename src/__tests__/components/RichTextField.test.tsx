import React, {act} from 'react';
import {describe, it, expect, vi} from 'vitest';
import {screen} from '@testing-library/react';
import RichTextField from 'components/RichTextField';
import {
  renderWithProvidersAsync,
  waitForStateUpdates,
} from '__tests__/config/providers';

describe('RichTextField html-sync behavior', () => {
  const updateHtml = vi.fn();

  it('shows initial html then clears when html=""', async () => {
    const {rerender} = await renderWithProvidersAsync(
      <RichTextField
        name="description"
        html="Hello, world!"
        updateHtml={updateHtml}
        disabled
      />,
    );

    expect(screen.getByText('Hello, world!')).toBeInTheDocument();

    await act(async () => {
      rerender(
        <RichTextField
          name="description"
          html=""
          updateHtml={updateHtml}
          disabled
        />,
      );
      await waitForStateUpdates();
    });

    expect(screen.queryByText('Hello, world!')).toBeNull();
  });
});

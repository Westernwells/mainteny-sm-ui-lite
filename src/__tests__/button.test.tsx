import {render, screen} from '@testing-library/react';
import {vi, expect} from 'vitest';
import {Button} from 'components/Button';
import '@testing-library/jest-dom';

vi.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => ({
    t: (str: string) => str,
    i18n: {
      changeLanguage: () => new Promise(() => {}),
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}));

describe('Button component', () => {
  it('renders with given label', () => {
    render(<Button label="test-label" testId="button" />);
    const button = screen.getByTestId('button');
    expect(button).toHaveTextContent('test-label');
  });

  it('renders with given children', () => {
    render(
      <Button testId="button">
        <span>Child Content</span>
      </Button>,
    );
    const button = screen.getByTestId('button');
    expect(button).toHaveTextContent('Child Content');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled testId="button" />);
    const button = screen.getByTestId('button');
    expect(button).toBeDisabled();
  });
});

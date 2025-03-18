import {vi, describe, it, expect, beforeEach, afterEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import {ArticleView, ArticleType} from 'models/article';
import {State} from 'models/misc';
import {ArticleAutocomplete} from 'components/ArticleAutoComplete';
import {useArticles} from 'hooks/reactQuery/useArticle';

// Mock the hooks
vi.mock('hooks/reactQuery/useArticle');
vi.mock('utils/currency', () => ({
  useCurrentCurrency: () => ({
    code: 'EUR',
    rate: 1,
  }),
  getCurrencySymbol: {
    EUR: '€',
  },
  centsToMoney: () => '10.00',
}));
vi.mock('i18next', () => ({
  t: (key: string) => key,
}));

const mockArticle: ArticleView = {
  id: '1',
  externalId: 'ART001',
  name: 'Test Article & spéciål grōōt',
  description: 'Test Description',
  category: 'Test Category',
  unitSellingAmount: {
    netAmount: 1000,
    vats: [],
    currency: 'EUR',
  },
  canDelete: true,
  manufacturer: 'Test Manufacturer',
  meta: {
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    state: State.ACTIVE,
  },
  model: 'Test Model',
  type: ArticleType.LABOR,
  number: '123',
  search: 'test',
  serviceCompanyId: '1',
  stock: {
    currentStock: 100,
    maxStock: 200,
    minOrderQuantity: 10,
    minStock: 5,
  },
  storageLocation: 'Test Storage Location',
  subCategory: 'Test Sub Category',
  unit: 'Test Unit',
  suppliers: [],
};

describe('ArticleAutocomplete', () => {
  beforeEach(() => {
    // Mock the useArticles hook to return data with the mockArticle
    (useArticles as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        data: [mockArticle],
        page: {
          pageIndex: 0,
          pageSize: 10,
        },
        total: 1,
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without initial value', () => {
    render(<ArticleAutocomplete />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders with initial value', () => {
    render(<ArticleAutocomplete initialValue={mockArticle} />);
    expect(screen.getByDisplayValue(mockArticle.name)).toBeInTheDocument();
  });

  it('handles search with special characters and Dutch characters', async () => {
    const getQuery = vi.fn();
    render(<ArticleAutocomplete getQuery={getQuery} />);

    const input = screen.getByRole('combobox');
    const keyword = '& spéciål grōōt';
    await userEvent.type(input, keyword);

    await waitFor(
      () => {
        expect(useArticles).toHaveBeenCalledWith(
          expect.objectContaining({
            query: keyword,
          }),
          expect.any(Object),
          true,
        );
        expect(screen.getByText(keyword)).toBeInTheDocument();
      },
      {timeout: 1000},
    );
  });

  it('calls getArticle when article is selected', async () => {
    const getArticle = vi.fn();

    render(<ArticleAutocomplete getArticle={getArticle} />);

    const input = screen.getByRole('combobox');

    await userEvent.type(input, mockArticle.name);

    const option = await screen.findByText(mockArticle.name);
    await userEvent.click(option);

    expect(getArticle).toHaveBeenCalledWith(mockArticle);

    expect(input).toHaveValue(mockArticle.name);
  });

  it('clears selection when input is cleared', async () => {
    const getArticle = vi.fn();
    render(
      <ArticleAutocomplete
        getArticle={getArticle}
        initialValue={mockArticle}
      />,
    );

    const input = screen.getByRole('combobox');

    fireEvent.change(input, {target: {value: ''}});
    fireEvent.blur(input);

    expect(getArticle).toHaveBeenCalledWith(null);

    expect(input).toHaveValue('');
  });

  it('respects disabled prop', () => {
    render(<ArticleAutocomplete disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});

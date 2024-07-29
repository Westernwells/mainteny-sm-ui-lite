import {vi} from 'vitest';

const mockNotistack = () => {
  vi.mock('notistack', () => ({
    useSnackbar: () => ({
      enqueueSnackbar: vi.fn(),
    }),
  }));
};

export default mockNotistack;

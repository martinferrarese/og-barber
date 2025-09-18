import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

jest.mock('@vercel/kv', () => ({
  kv: {
    lpush: jest.fn(),
    lrange: jest.fn().mockResolvedValue([]),
    del: jest.fn(),
  },
}));

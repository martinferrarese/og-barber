import { render, screen } from '@testing-library/react';

function Sum(a: number, b: number) {
  return a + b;
}

test('adds 1 + 2 to equal 3', () => {
  expect(Sum(1, 2)).toBe(3);
});

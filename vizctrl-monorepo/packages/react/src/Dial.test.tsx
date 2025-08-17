import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Dial from './Dial';

// extend jest assertions for accessibility
expect.extend(toHaveNoViolations);

test('Dial renders and is accessible', async () => {
  const { container } = render(<Dial value={50} onChange={() => {}} min={0} max={100} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
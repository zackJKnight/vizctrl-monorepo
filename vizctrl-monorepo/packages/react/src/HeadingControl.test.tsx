import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { HeadingControl } from './HeadingControl';
import '@testing-library/jest-dom';

expect.extend(toHaveNoViolations);

test('HeadingControl is accessible', async () => {
  const { container } = render(<HeadingControl value={90} onChange={() => {}} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
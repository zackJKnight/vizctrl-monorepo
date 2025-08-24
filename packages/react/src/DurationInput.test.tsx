import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { DurationInput } from './DurationInput';
import '@testing-library/jest-dom';

expect.extend(toHaveNoViolations);

test('DurationInput is accessible', async () => {
  const { container } = render(<DurationInput value={3661} onChange={() => {}} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
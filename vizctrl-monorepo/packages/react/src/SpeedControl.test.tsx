import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { SpeedControl } from './SpeedControl';
import '@testing-library/jest-dom';

expect.extend(toHaveNoViolations);

test('SpeedControl is accessible', async () => {
  const { container } = render(
    <SpeedControl
      value={{ value: 50, unit: 'kmh' }}
      onChange={() => {}}
      presets={[{ value: 10, unit: 'ms' }, { value: 60, unit: 'kmh' }]}
    />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
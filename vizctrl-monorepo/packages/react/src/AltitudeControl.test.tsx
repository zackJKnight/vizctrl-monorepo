import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AltitudeControl } from './AltitudeControl';
import '@testing-library/jest-dom';

expect.extend(toHaveNoViolations);

test('AltitudeControl is accessible', async () => {
  const { container } = render(
    <AltitudeControl
      value={{ value: 1000, unit: 'ft' }}
      onChange={() => {}}
      presets={[{ value: 500, unit: 'ft' }, { value: 1000, unit: 'ft' }]}
    />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
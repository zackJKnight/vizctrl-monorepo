import React, { useState } from 'react';
import { Dial, AltitudeControl, SpeedControl, HeadingControl, DurationInput } from '@vizctrl/react';
import { GeoPointPicker } from '@vizctrl/maps-openlayers';
import { Quantity } from '@vizctrl/core/quantity';

export default function App() {
  const [altitude, setAltitude] = useState<Quantity<'ft' | 'm'>>({ value: 1000, unit: 'ft' });
  const [speed, setSpeed] = useState<Quantity<'ms' | 'kmh' | 'mph' | 'kts'>>({ value: 50, unit: 'kmh' });
  const [heading, setHeading] = useState(90);
  const [duration, setDuration] = useState(3600); // seconds
  const [position, setPosition] = useState<[number, number]>([-122.44, 37.77]);

  return (
    <div style={{ padding: 20, display: 'grid', gap: 20 }}>
      <AltitudeControl
        value={altitude}
        onChange={setAltitude}
        presets={[
          { value: 500, unit: 'ft' },
          { value: 1000, unit: 'ft' },
          { value: 10000, unit: 'ft' },
        ]}
      />
      <SpeedControl
        value={speed}
        onChange={setSpeed}
        presets={[
          { value: 10, unit: 'ms' },
          { value: 50, unit: 'kmh' },
          { value: 100, unit: 'mph' },
        ]}
      />
      <HeadingControl value={heading} onChange={setHeading} />
      <DurationInput value={duration} onChange={setDuration} />
      <GeoPointPicker value={position} onChange={setPosition} />
    </div>
  );
}
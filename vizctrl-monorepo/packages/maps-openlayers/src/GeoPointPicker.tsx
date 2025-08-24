import React, { useRef, useEffect } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { defaults as defaultInteractions, Modify } from 'ol/interaction';

export interface GeoPointPickerProps {
  /**
   * Current geographic coordinate as [longitude, latitude].
   */
  value: [number, number];
  /**
   * Called when the coordinate changes. Receives [lon, lat].
   */
  onChange: (coord: [number, number]) => void;
  /** Initial zoom level. */
  zoom?: number;
  /** Optional label displayed above the map. */
  label?: string;
}

/**
 * A lightweight OpenLayers adapter that renders a map and allows the
 * user to pick a single coordinate by clicking. A draggable marker
 * reflects the current value and updates when dragged.
 */
export default function GeoPointPicker({ value, onChange, zoom = 4, label }: GeoPointPickerProps) {
  const mapDiv = useRef<HTMLDivElement>(null);
  const markerRef = useRef<Feature<Point> | null>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapDiv.current) return;

    // initialise marker
    const marker = new Feature(new Point(fromLonLat(value)));
    markerRef.current = marker;
    const vectorSource: VectorSource<Feature<Point>> = new VectorSource({ features: [marker] });
    const markerLayer = new VectorLayer({ source: vectorSource });

    const map = new Map({
      target: mapDiv.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        markerLayer,
      ],
      view: new View({ center: fromLonLat(value), zoom }),
      interactions: defaultInteractions().extend([new Modify({ source: vectorSource as unknown as VectorSource })]),
    });

    // update on click
    map.on('click', (e) => {
      const lonlat = toLonLat(e.coordinate);
      marker.getGeometry()?.setCoordinates(e.coordinate);
      onChange([lonlat[0], lonlat[1]]);
    });

    // update on drag
    marker.on('change', () => {
      const geom = marker.getGeometry();
      if (geom) {
        const ll = toLonLat(geom.getCoordinates());
        onChange([ll[0], ll[1]]);
      }
    });

    mapRef.current = map;
    return () => {
      map.setTarget(undefined);
    };
  }, []);

  // update marker if value prop changes
  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      const transformed = fromLonLat(value);
      markerRef.current.getGeometry()?.setCoordinates(transformed);
      mapRef.current.getView().setCenter(transformed);
    }
  }, [value]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label>{label}</label>}
      <div ref={mapDiv} style={{ width: '100%', height: '300px' }} />
    </div>
  );
}
import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import MapComponent from '../../../components/MapComponent';

type Marker = {
  latitude: number;
  longitude: number;
  description?: string;
  name?: string;
  age?: number;
  gender?: string;
  date?: string;
  id?: string;
};

type Props = {
  riskMarkers: Marker[];
  helpMarkers: Marker[];
  onRiskDeleted: (id: string) => void;
  style: StyleProp<ViewStyle>;
};

export default function HomeMapSection({ riskMarkers, helpMarkers, onRiskDeleted, style }: Props) {
  return (
    <View style={style}>
      <MapComponent
        key={[...riskMarkers, ...helpMarkers].map((marker) => `${marker.latitude}-${marker.longitude}`).join(',')}
        riskMarkers={riskMarkers as any}
        helpMarkers={helpMarkers as any}
        onRiskDeleted={onRiskDeleted}
      />
    </View>
  );
}

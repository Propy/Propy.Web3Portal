import React from 'react';
import { Group } from '@visx/group';
import { AreaClosed, LinePath } from '@visx/shape';
import { AxisLeft, AxisBottom, AxisScale } from '@visx/axis';
import { LinearGradient } from '@visx/gradient';
import { curveStep } from '@visx/curve';

import { ITimeseries } from '../BasicAreaChart'

// Initialize some variables
const axisColor = '#000';
const axisBottomTickLabelProps = {
  textAnchor: 'middle' as const,
  fontFamily: 'Arial',
  fontSize: 10,
  fill: axisColor,
};
const axisLeftTickLabelProps = {
  dx: '-0.25em',
  dy: '0.25em',
  fontFamily: 'Arial',
  fontSize: 10,
  textAnchor: 'end' as const,
  fill: axisColor,
};

// accessors
const getDate = (d: ITimeseries) => new Date(d.date);
const getStockValue = (d: ITimeseries) => d.value;

export default function AreaChart({
  data,
  accentColor,
  width,
  yMax,
  margin,
  xScale,
  yScale,
  hideBottomAxis = false,
  hideLeftAxis = false,
  top,
  left,
  children,
}: {
  data: ITimeseries[];
  accentColor: string;
  xScale: AxisScale<number>;
  yScale: AxisScale<number>;
  width: number;
  yMax: number;
  margin: { top: number; right: number; bottom: number; left: number };
  hideBottomAxis?: boolean;
  hideLeftAxis?: boolean;
  top?: number;
  left?: number;
  children?: React.ReactNode;
}) {
  if (width < 10) return null;
  return (
    //@ts-ignore
    <Group left={left || margin.left} top={top || margin.top}>
      <LinearGradient
        id="gradient"
        from={accentColor}
        fromOpacity={0.4}
        to={accentColor}
        toOpacity={0}
      />
      <AreaClosed<ITimeseries>
        data={data}
        x={(d) => xScale(getDate(d)) || 0}
        y={(d) => yScale(getStockValue(d)) || 0}
        yScale={yScale}
        strokeWidth={1}
        stroke="url(#gradient)"
        fill="url(#gradient)"
        curve={curveStep}
      />
      <LinePath
        curve={curveStep}
        stroke={"#37a6fa"}
        strokeWidth={1}
        data={data}
        x={(d: ITimeseries) => xScale(getDate(d)) || 0}
        y={(d: ITimeseries) => yScale(getStockValue(d)) || 0}
      />
      {!hideBottomAxis && (
        <AxisBottom
          top={yMax}
          scale={xScale}
          numTicks={width > 520 ? 10 : 5}
          stroke={axisColor}
          tickStroke={axisColor}
          tickLabelProps={() => axisBottomTickLabelProps}
        />
      )}
      {!hideLeftAxis && (
        <AxisLeft
          scale={yScale}
          numTicks={5}
          stroke={axisColor}
          tickStroke={axisColor}
          tickLabelProps={() => axisLeftTickLabelProps}
        />
      )}
      {children}
    </Group>
  );
}

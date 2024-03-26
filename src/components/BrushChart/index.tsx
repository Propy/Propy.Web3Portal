import React, { useRef, useMemo } from 'react';
import { scaleLinear, scaleTime, scaleSymlog } from "d3-scale";
import { Brush } from '@visx/brush';
import { Bounds } from '@visx/brush/lib/types';
import BaseBrush from '@visx/brush/lib/BaseBrush';
import { PatternLines } from '@visx/pattern';
import { Group } from '@visx/group';
import { min, max, extent } from 'd3-array';

import AreaChart from './AreaChart';
import { ITimeseries } from '../BasicAreaChart'

type HandleProps = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type BrushHandleRenderProps = HandleProps & {
  /** if brush extent is not active this prop is set to false */
  isBrushActive: boolean;
  className: string;
};

// Initialize some variables
const brushMargin = { top: 0, bottom: 0, left: 5, right: 5 };
const PATTERN_ID = 'brush_pattern';
const GRADIENT_ID = 'brush_gradient';
export const selectionColor = '#6f6f6f';
export const accentColor = '#37a6fa';
export const accentColorDark = '#75daad';
export const background = '#000';
export const background2 = '#af8baf';
const selectedBrushStyle = {
  fill: `#0000001a`,
  stroke: 'white',
};

// accessors
const getDate = (d: ITimeseries) => new Date(d.date);
const getStockValue = (d: ITimeseries) => d.value;

export type BrushProps = {
  width: number
  height: number
  margin?: { top: number; right: number; bottom: number; left: number }
  compact?: boolean
  timeseries: ITimeseries[]
  setFilteredChartData?: (arg0: ITimeseries[]) => void
  isLoadingPlaceholder?: boolean
  scaleType?: string
};

function BrushChart({
  compact = false,
  timeseries,
  setFilteredChartData,
  width,
  height,
  margin = {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  isLoadingPlaceholder,
  scaleType = 'linear',
}: BrushProps) {
  const brushRef = useRef<BaseBrush | null>(null);

  const onBrushChange = (domain: Bounds | null) => {
    if (!domain) return;
    const { x0, x1, y0, y1 } = domain;
    const stockCopy = timeseries.filter((s) => {
      const x = getDate(s).getTime();
      const y = getStockValue(s);
      return x > x0 && x < x1 && y > y0 && y < y1;
    });
    if(setFilteredChartData && (stockCopy.length >= 1)) {
      setFilteredChartData(stockCopy);
    }
  };

  const innerHeight = height - margin.top - margin.bottom;
  const bottomChartHeight = innerHeight;

  // bounds
  const xBrushMax = Math.max(width - brushMargin.left - brushMargin.right, 0);
  const yBrushMax = Math.max(bottomChartHeight - brushMargin.top - brushMargin.bottom, 0);

  // scales
  const brushDateScale = useMemo(
    () =>
      scaleTime().domain(extent(timeseries, getDate) as [Date, Date]).range([0, xBrushMax]),
    [xBrushMax, timeseries],
  );
  const brushStockScale = useMemo(
    () => scaleType === 'linear' 
        ? scaleLinear().domain([min(timeseries, getStockValue) || 0, max(timeseries, getStockValue) || 0]).range([yBrushMax, 0])
        : scaleSymlog().domain([min(timeseries, getStockValue) || 0, max(timeseries, getStockValue) || 0]).range([yBrushMax, 0]),
    [yBrushMax, timeseries, scaleType],
  );

  const initialBrushPosition = useMemo(
    () => ({
      start: { x: brushDateScale(getDate(timeseries[0])) },
      end: { x: brushDateScale(getDate(timeseries[timeseries.length - 1])) },
    }),
    [brushDateScale, timeseries],
  );

  return (
    <div>
      <svg width={width} height={height}>
        {/* <LinearGradient id={GRADIENT_ID} from={background} to={background2} rotate={45} /> */}
        <rect x={0} y={0} width={width} height={height} fill={`url(#${GRADIENT_ID})`} rx={14} />
        <AreaChart
          hideBottomAxis
          hideLeftAxis
          data={isLoadingPlaceholder ? [] : timeseries}
          width={width}
          yMax={yBrushMax}
          xScale={brushDateScale}
          yScale={brushStockScale}
          margin={brushMargin}
          top={margin.top}
          accentColor={accentColor}
        >
          <PatternLines
            id={PATTERN_ID}
            height={16}
            width={16}
            stroke={selectionColor}
            strokeWidth={1}
            orientation={['diagonal']}
          />
          <Brush
            xScale={brushDateScale}
            yScale={brushStockScale}
            width={xBrushMax}
            height={yBrushMax}
            margin={brushMargin}
            handleSize={8}
            innerRef={brushRef}
            resizeTriggerAreas={['left', 'right']}
            brushDirection="horizontal"
            initialBrushPosition={initialBrushPosition}
            onChange={onBrushChange}
            selectedBoxStyle={selectedBrushStyle}
            useWindowMoveEvents
            renderBrushHandle={(props) => <BrushHandle {...props} />}
          />
        </AreaChart>
      </svg>
      {/* <button onClick={handleClearClick}>Clear</button>&nbsp;
      <button onClick={handleResetClick}>Reset</button> */}
    </div>
  );
}
// We need to manually offset the handles for them to be rendered at the right position
const BrushHandle = ({ x, height, isBrushActive }: BrushHandleRenderProps) => {
  const pathWidth = 8;
  const pathHeight = 15;
  if (!isBrushActive) {
    return null;
  }
  return (
    <Group left={x + pathWidth / 2} top={(height - pathHeight) / 2}>
      <path
        fill="#f2f2f2"
        d="M -4.5 0.5 L 3.5 0.5 L 3.5 15.5 L -4.5 15.5 L -4.5 0.5 M -1.5 4 L -1.5 12 M 0.5 4 L 0.5 12"
        stroke="#999999"
        strokeWidth="1"
        style={{ cursor: 'ew-resize' }}
      />
    </Group>
  );
};

export default BrushChart;
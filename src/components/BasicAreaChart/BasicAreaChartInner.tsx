import React, { useMemo, useState, useCallback } from 'react';
import { AreaClosed, Line, Bar, LinePath } from '@visx/shape';
import { curveStep } from '@visx/curve';
import { scaleLinear, scaleTime, scaleSymlog } from "d3-scale";
import { PatternLines } from '@visx/pattern';
import { withTooltip, Tooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip';
import { localPoint } from '@visx/event';
import { LinearGradient } from '@visx/gradient';
import { AxisBottom } from '@visx/axis';
import { min, max, extent, bisector } from 'd3-array';
import { timeFormat, utcFormat } from 'd3-time-format';

import { ITimeseries } from '.';

export const background = '#f7f7f7';
export const background2 = '#f7f7f7';
export const accentColor = '#37a6fa';
export const accentColorDark = '#75daad';
export const tooltipVerticalLineColor = '#37a6fad9';
export const tooltipVerticalLineCircleColor = 'white';
const tooltipStyles = {
  ...defaultStyles,
  background,
  border: '1px solid black',
  color: 'black',
  // transition: 'all 0.2s'
};

// util
const formatDate = timeFormat("%I:%M %p | %b %d %Y");
const formatDateHideTime = timeFormat("%b %d %Y");

const formatDateUTC = utcFormat("%I:%M %p | %b %d %Y");
const formatDateHideTimeUTC = utcFormat("%b %d %Y");

const tickDateFormat = timeFormat('%b %d');
const formatTickDate = (date: any) => {
  let result = tickDateFormat(date as Date);
  return result;
};
const tickTimeFormat = timeFormat('%I:%M %p');
const formatTickTime = (date: any) => {
  let result = tickTimeFormat(date as Date);
  return result;
};

// accessors
const getDate = (d: ITimeseries) => new Date(d.date);
const getStockValue = (d: ITimeseries) => d.value;
const bisectDate = bisector<ITimeseries, Date>((d) => new Date(d.date)).left;

export type AreaProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  timeseries: ITimeseries[],
  hideTime?: boolean,
  formatValue: (arg0: string | number) => string
  isLoadingPlaceholder?: boolean
  utc?: boolean
  scaleType?: string
};

export default withTooltip<AreaProps, ITimeseries>(
  ({
    width,
    height,
    margin = { top: 0, right: 0, bottom: 35, left: 0 },
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
    timeseries,
    formatValue,
    hideTime,
    isLoadingPlaceholder = false,
    utc = false,
    scaleType = 'linear',
  }: AreaProps & WithTooltipProvidedProps<ITimeseries>) => {
    if (width < 10) return null;

    const [tooltipDateTranslateLeft, setTooltipDateTranslateLeft] = useState(false);
    const [tooltipDateTranslateRight, setTooltipDateTranslateRight] = useState(false);

    const firstPointX = timeseries[0];
    const currentPointX = timeseries[timeseries.length - 1];

    // timeseries = appleStock
    const maxValuesData = [
        {
            date: getDate(firstPointX),
            value: max(timeseries, getStockValue)
        }, {
            date: getDate(currentPointX),
            value: max(timeseries, getStockValue)
        }
    ]

    const minValuesData = [
        {
            date: getDate(firstPointX),
            value: min(timeseries, getStockValue)
        }, {
            date: getDate(currentPointX),
            value: min(timeseries, getStockValue)
        }
    ]

    // bounds
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // scales
    const dateScale = useMemo(
      () =>
        scaleTime().domain(extent(timeseries, getDate) as [Date, Date]).range([margin.left, innerWidth + margin.left]),
      [innerWidth, margin.left, timeseries],
    );
    const stockValueScale = useMemo(
      () => scaleType === 'linear' 
        ? scaleLinear().domain([(min(timeseries, getStockValue) || 0), (max(timeseries, getStockValue) || 0)]).range([innerHeight + margin.top, margin.top])
        : scaleSymlog().domain([(min(timeseries, getStockValue) || 0), (max(timeseries, getStockValue) || 0)]).range([innerHeight + margin.top, margin.top]),
      [margin.top, innerHeight, timeseries, scaleType],
    );

    // tooltip handler
    const handleTooltip = useCallback(
      (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
        const { x } = localPoint(event) || { x: 0 };
        const x0 = dateScale.invert(x);
        const index = bisectDate(timeseries, x0, 1);
        const d0 = timeseries[index - 1];
        const d1 = timeseries[index];
        let d = d0;
        if (d1 && getDate(d1)) {
          d = x0.valueOf() - getDate(d0).valueOf() > getDate(d1).valueOf() - x0.valueOf() ? d1 : d0;
        }
        const totalGraphWidth = dateScale(getDate(timeseries[timeseries.length - 1]));
        let tooltipLeft = dateScale(getDate(d));
        if((totalGraphWidth - tooltipLeft) < 100){
          setTooltipDateTranslateLeft(true);
        }else{
          setTooltipDateTranslateLeft(false);
        }
        if(tooltipLeft < 100){
          setTooltipDateTranslateRight(true);
        }else{
          setTooltipDateTranslateRight(false);;
        }
        showTooltip({
          tooltipData: d,
          tooltipLeft: x,
          tooltipTop: stockValueScale(getStockValue(d)),
        });
      },
      [showTooltip, stockValueScale, dateScale, timeseries],
    );
    
    return (
      <div>
        <svg width={width} height={height} style={{borderBottomLeftRadius: 10, borderBottomRightRadius: 10}}>
        <filter id="drop-shadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
            <feOffset dx="0" dy="0" result="offsetblur"/>
            <feFlood floodColor="#f7f7f7"/>
            <feComposite in2="offsetblur" operator="in"/>
            <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="url(#area-background-gradient)"
            rx={0}
          />
          {!isLoadingPlaceholder && 
            <AxisBottom
              tickLabelProps={() => ({
                fill: '#000',
                fontSize: 11,
                textAnchor: 'middle',
              })}
              tickStroke={"#6f6f6f"}
              tickFormat={formatTickDate}
              top={innerHeight}
              //@ts-ignore
              data={timeseries}
              scale={dateScale}
              x={(d: ITimeseries) => dateScale(getDate(d)) ?? 0}
              hideAxisLine
              numTicks={5}
              className={"monospace"}
            />
          }
          {!isLoadingPlaceholder && 
            <AxisBottom
              tickLabelProps={() => ({
                fill: '#000',
                fontSize: 11,
                textAnchor: 'middle',
              })}
              tickStroke={"#6f6f6f"}
              tickFormat={formatTickTime}
              top={innerHeight + 15}
              //@ts-ignore
              data={timeseries}
              scale={dateScale}
              x={(d: ITimeseries) => dateScale(getDate(d)) ?? 0}
              hideAxisLine
              hideTicks
              numTicks={5}
              className={"monospace"}
            />
          }
          <LinearGradient id="area-background-gradient" from={background} to={background2} />
          <LinearGradient id="area-gradient" from={accentColor} to={accentColor} fromOpacity={0.4} toOpacity={0} />
          {!isLoadingPlaceholder && 
            <PatternLines
              id="dLines"
              height={6}
              width={6}
              stroke="#7ec8ff"
              strokeWidth={1}
              orientation={['diagonal']}
            />
          }
          {!isLoadingPlaceholder && 
            <AreaClosed<ITimeseries>
              data={timeseries}
              x={(d) => dateScale(getDate(d)) ?? 0}
              y={(d) => stockValueScale(getStockValue(d)) ?? 0}
              yScale={stockValueScale}
              strokeWidth={0}
              stroke="url(#area-gradient)"
              fill="url(#area-gradient)"
              curve={curveStep}
            />
          }
          {!isLoadingPlaceholder && 
            <AreaClosed<ITimeseries>
              data={timeseries}
              x={(d) => dateScale(getDate(d)) ?? 0}
              y={(d) => stockValueScale(getStockValue(d)) ?? 0}
              yScale={stockValueScale}
              fill="url(#dLines)"
              curve={curveStep}
            />
          }
          {!isLoadingPlaceholder && 
            <LinePath
              curve={curveStep}
              stroke={"#37a6fa"}
              strokeWidth={1}
              data={timeseries}
              x={(d) => dateScale(getDate(d)) ?? 0}
              y={(d) => stockValueScale(getStockValue(d)) ?? 0}
            />
          }
          <Bar
            x={margin.left}
            y={margin.top}
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            rx={14}
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={() => hideTooltip()}
          />
          <g>
              <LinePath
                  //@ts-ignore
                  data={maxValuesData}
                  x={(d: ITimeseries) => dateScale(getDate(d))}
                  y={(d: ITimeseries) => stockValueScale(getStockValue(d))}
                  strokeDasharray="4,4"
                  stroke={"#6f6f6f"}
              />
              {!isLoadingPlaceholder && 
                <text filter="url(#drop-shadow)" className={"monospace"} y={stockValueScale(max(timeseries, getStockValue) || 0)} fill="black" dy="1.3em" dx="1em" fontSize="14">
                    {formatValue((max(timeseries, getStockValue) || 0).toString())}
                </text>
              }
          </g>
          <g>
              <LinePath
                  //@ts-ignore
                  data={minValuesData}
                  x={(d: ITimeseries) => dateScale(getDate(d))}
                  y={(d: ITimeseries) => stockValueScale(getStockValue(d))}
                  strokeDasharray="4,4"
                  stroke={"#6f6f6f"}
              />
              {!isLoadingPlaceholder && 
                <text filter="url(#drop-shadow)"className={"monospace"} y={stockValueScale(min(timeseries, getStockValue) || 0) - 25} fill="black" dy="1.3em" dx="1em" fontSize="14">
                    {formatValue((min(timeseries, getStockValue) || 0).toString())}
                </text>
              }
          </g>
          {tooltipData && (
            <g>
              <Line
                from={{ x: tooltipLeft, y: margin.top }}
                to={{ x: tooltipLeft, y: innerHeight + margin.top }}
                stroke={tooltipVerticalLineColor}
                strokeWidth={2}
                pointerEvents="none"
                strokeDasharray="5,2"
              />
              <circle
                cx={tooltipLeft}
                cy={tooltipTop + 1}
                r={4}
                fill="#f7f7f7"
                fillOpacity={0.1}
                stroke="#f7f7f7"
                strokeOpacity={0.1}
                strokeWidth={3}
                pointerEvents="none"
              />
              <circle
                cx={tooltipLeft}
                cy={tooltipTop}
                r={4}
                fill={tooltipVerticalLineCircleColor}
                stroke="#0083ff"
                strokeWidth={3}
                pointerEvents="none"
              />
            </g>
          )}
        </svg>
        {tooltipData && (
          <div>
            <TooltipWithBounds
              key={Math.random()}
              top={((innerHeight - tooltipTop) < 30) ? (innerHeight - 40) : tooltipTop - 12}
              left={tooltipLeft + 12}
              style={{
                ...tooltipStyles,
              }}
            >
              {`${formatValue(getStockValue(tooltipData))}`}
            </TooltipWithBounds>
            <Tooltip
              top={innerHeight + margin.top - 10}
              left={tooltipLeft}
              style={{
                ...defaultStyles,
                ...tooltipStyles,
                minWidth: 72,
                textAlign: 'center',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                ...(tooltipDateTranslateLeft && {transform: 'translateX(-105%)'}),
                ...(tooltipDateTranslateRight && {transform: 'translateX(0%)'}),
                ...(!tooltipDateTranslateLeft && !tooltipDateTranslateRight && {transform: 'translateX(-50%)'})
              }}
            >
              {utc &&
                <>
                  {hideTime ? formatDateHideTimeUTC(getDate(tooltipData)) : formatDateUTC(getDate(tooltipData))} (UTC)
                </>
              }
              {!utc &&
                <>
                  {hideTime ? formatDateHideTime(getDate(tooltipData)) : formatDate(getDate(tooltipData))}
                </>
              }
            </Tooltip>
          </div>
        )}
      </div>
    );
  },
);
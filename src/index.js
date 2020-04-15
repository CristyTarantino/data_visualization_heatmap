'use strict';

import 'normalize.css';

require('./styles/index.scss');

localStorage.setItem('example_project', 'D3: Heat Map');

const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

const margin = {
    top: 100,
    right: 20,
    bottom: 60,
    left: 60
  },
  width = 1420 - margin.left - margin.right,
  height = 630 - margin.top - margin.bottom;

const svg = d3.select('main')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .attr('class', 'graph')
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// User Story #1: I can see a title element that has a corresponding id="title".
// title
svg.append('text')
  .attr('id', 'title')
  .attr('x', (width / 2))
  .attr('y', 0 - (margin.top / 2))
  .attr('text-anchor', 'middle')
  .style('font-size', '30px')
  .text('Monthly Global Land-Surface Temperature');

const legendThreshold = (min, max, count) => {
  let array = [];
  const step = (max - min) / count;
  for (let i = 1; i < count; i++) {
    array.push(min + i * step);
  }
  return array;
};

const buildHeatMap = (dataset) => {
  const {baseTemperature, monthlyVariance} = dataset;
  const min = d3.min(monthlyVariance, d => baseTemperature + d.variance);
  const max = d3.max(monthlyVariance, d => baseTemperature + d.variance);

  // User Story #2: My heat map should have a description with a corresponding id="description".
  // description
  svg.append('text')
    .attr('id', 'description')
    .attr('x', (width / 2))
    .attr('y', 35 - (margin.top / 2))
    .attr('text-anchor', 'middle')
    .style('font-size', '20px')
    .text('1753 - 2015: base temperature ' + baseTemperature);

  const xScale = d3.scaleBand()
    .domain(monthlyVariance.map(d => d.year))
    .range([1, width]);

  // User Story #12: My heat map should have multiple tick labels on the x-axis with the years between 1754 and 2015.
  const xAxis = d3.axisBottom(xScale)
    .tickValues(xScale.domain().filter(year => year % 10 === 0))
    .tickFormat(d3.format('d'))
    .tickSize(10, 1);

  // User Story #3: My heat map should have an x-axis with a corresponding id="x-axis".
  svg.append('g')
    .call(xAxis)
    .attr('id', 'x-axis')
    .attr('transform', `translate(0, ${height - margin.bottom})`);

  const yScale = d3.scaleBand()
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) //months
    .range([0, height - margin.bottom]);

  const yAxis = d3.axisLeft(yScale)
    .tickValues(yScale.domain())
    // User Story #11: My heat map should have multiple tick labels on the y-axis with the full month name.
    .tickFormat((month) => {
      const date = new Date(0);
      date.setUTCMonth(month);
      return d3.utcFormat('%B')(date);
    });

  // User Story #4: My heat map should have a y-axis with a corresponding id="y-axis".
  svg.append('g')
    .call(yAxis)
    .attr('id', 'y-axis')
    .attr('transform', `translate(0, 0)`);

  const numOfColors = 10;
  const colorScale = d3.scaleThreshold()
    .domain(d3.range(min, max, (max-min)/numOfColors))
    .range(d3.schemeRdYlBu[numOfColors+1].reverse());

  const tooltip = d3.tip()
    .attr('class', 'd3-tip')
    .attr('id', 'tooltip')
    .html(d => {
      tooltip.attr('data-year', d.year);
      const date = new Date(d.year, d.month - 1);
      return '<span class=\'date\'>' +
        d3.timeFormat('%Y - %B')(date) +
        '</span>' +
        '<br />' +
        '<span class=\'temperature\'>' +
        d3.format('.1f')(baseTemperature + d.variance) +
        '&#8451;' +
        '</span>' +
        '<br />' +
        '<span class=\'variance\'>' +
        d3.format('+.1f')(d.variance) +
        '&#8451;' +
        '</span>';
    })
    .direction('n')
    .offset([-10, 0]);

  svg.call(tooltip);

  // User Story #5: My heat map should have rect elements with a class="cell" that represent the data.
  svg.append('g')
    .classed('map', true)
    .selectAll('rect')
    .data(monthlyVariance)
    .enter()
    .append('rect')
    .attr('class', 'cell')
    // User Story #9: My heat map should have cells that align with the corresponding month on the y-axis.
    .attr('x', d => xScale(d.year))
    // User Story #10: My heat map should have cells that align with the corresponding year on the x-axis.
    .attr('y', d => yScale(d.month - 1))
    // User Story #7: Each cell will have the properties data-month, data-year, data-temp containing their
    // corresponding month, year, and temperature values. User Story #8: The data-month, data-year of each cell should
    // be within the range of the data.
    .attr('data-month', d => d.month - 1)
    .attr('data-year', d => d.year)
    .attr('data-temp', d => baseTemperature + d.variance)
    .attr('width', xScale.bandwidth())
    .attr('height', yScale.bandwidth())
    .attr('fill', d => colorScale(baseTemperature + d.variance))
    .on('mouseover', tooltip.show)
    .on('mouseout', tooltip.hide);

  const blockSize = 30;

  const legendX = d3.scaleLinear()
    .domain([min, max])
    .range([0, numOfColors * blockSize]);

  const legendXAxis = d3.axisBottom(legendX)
    .tickSize(numOfColors, 0)
    // the tick starts from the second value
    .tickValues(colorScale.domain().slice(1))
    .tickFormat(d3.format('.1f'));

  const legend = svg
    .append('g')
    .attr('id', 'legend')
    .attr('transform', 'translate(' + 0 + ',' + height + ')');

  legend
    .selectAll('rect')
    .data(colorScale.domain())
    .enter()
    .append('rect')
    .attr('width', blockSize)
    .attr('height', blockSize)
    .attr('x', (d, i) => i * blockSize)
    .attr('y', -blockSize)
    .style('fill', colorScale);

  legend.call(legendXAxis);
};

d3.json(url, (error, dataset) => !error && buildHeatMap(dataset));

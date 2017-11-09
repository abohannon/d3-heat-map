/* global d3:true */
/* eslint no-undef: "error" */

// create app

const app = (data) => {
  if (!data) {
    console.log('Loading...')
  }
  console.log('data', data)

  const tempData = data.monthlyVariance
  const baseTemp = data.baseTemperature

  console.log(baseTemp)

  const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const colors = ['#5e4fa2',
    '#3288bd',
    '#66c2a5',
    '#abdda4',
    '#e6f598',
    '#ffffbf',
    '#fee08b',
    '#fdae61',
    '#f46d43',
    '#d53e4f',
    '#9e0142']

  const colorScale = d3.scaleQuantile()
    .domain([
      d3.min(tempData, d => d.variance + baseTemp),
      d3.max(tempData, d => d.variance + baseTemp)
    ])
    .range(colors)

  const colorRange = [0].concat(colorScale.quantiles())
  console.log('color range', colorRange)

  // create chart dimensions
  const w = 1100
  const h = 600
  const padding = 100
  const rectWidth = tempData.length / w
  const rectHeight = (h - padding * 2) / month.length
  console.log('gridWidth', rectWidth)

  // create svg canvas
  const svg = d3.select('svg')
    .attr('width', w)
    .attr('height', h)
    .attr('class', 'chart')

  // chart title
  svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('x', w / 2)
    .attr('y', padding - 20)
    .style('font-weight', 900)
    .style('font-size', '1.5rem')
    .text(`Global Land-Surface Temperature,
1753 - 2015`)

  // legend
  const legendRectSize = 30

  const legend = svg.selectAll('.legend')
    .data(colorRange)
    .enter()
    .append('g')
    .attr('class', 'legend')

  legend.append('rect')
    .attr('x', (d, i) => {
      return legendRectSize * i + (w - padding - legendRectSize * colors.length)
    })
    .attr('y', h - padding + 50)
    .attr('width', legendRectSize)
    .attr('height', rectHeight / 2)
    .style('fill', (d, i) => colors[i])

  legend.append('text')
    .attr('x', (d, i) => {
      return legendRectSize * i + (w - padding - legendRectSize * colors.length) + 3
    })
    .attr('y', h - padding + 80)
    .style('font-size', 11)
    .text(d => d.toFixed(1))

  // x scale and axis
  // need to convert to date objects to use scaleTime()
  const minYear = new Date(d3.min(tempData, (d) => d.year), 0)
  const maxYear = new Date(d3.max(tempData, (d) => d.year), 0)

  const xScale = d3.scaleTime()
    .domain([minYear, maxYear])
    .range([padding, w - padding])

  const xAxis = d3.axisBottom(xScale)

  svg.append('g')
    .attr('transform', `translate(0, ${h - padding})`)
    .call(xAxis)

  svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('x', w / 2)
    .attr('y', h - padding / 2)
    .attr('class', 'chart-label')
    .text('Year')

  // y scale and axis
  const minMonth = d3.min(tempData, (d) => d.month)
  const maxMonth = d3.max(tempData, (d) => d.month)

  const yScale = d3.scaleBand()
    .domain(month)
    .range([h - padding, padding])

  const yAxis = d3.axisLeft(yScale)

  svg.append('g')
    .attr('transform', `translate(${padding}, 0)`)
    .attr('class', 'yAxis')
    .call(yAxis)

  svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(${padding / 2 - 10}, ${h / 2})rotate(-90)`)
    .attr('class', 'chart-label')
    .text('Month')

  // tooltip
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)

  // plot the data
  svg.selectAll('rect')
    .data(tempData)
    .enter()
    .append('rect')
    .attr('x', (d, i) => xScale(new Date(d.year, 0)))
    .attr('y', (d, i) => (d.month - 1) * rectHeight + padding)
    .attr('year', d => (d.year)) // TODO: Remove
    .attr('month', d => (d.month)) // TODO: Remove
    .attr('variance', d => (d.variance)) // TODO: Remove
    .attr('width', rectWidth)
    .attr('height', rectHeight)
    .attr('fill', d => colorScale(d.variance + baseTemp))
    .on('mouseover', (d) => {
      tooltip
        .transition()
        .style('opacity', 1)
      tooltip
        .html(`
          <div><b>${month[month.length - d.month]} - ${d.year}</b></div>
          <div>${(d.variance + baseTemp).toFixed(2)}&deg;C</div>
          `)
        .style('left', xScale(new Date(d.year, 0)) + 20 + 'px')
        /* must go here instead of above because the transition affects the styling */
        .style('top', (d.month - 1) * rectHeight + padding - 20 + 'px')
    })
    .on('mouseout', () => {
      tooltip
        .transition()
        .style('opacity', 0)
    })
}

// fetch data
const DATA_URL = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json'

fetch(DATA_URL)
  .then((response) => {
    if (response.status !== 200) {
      console.log('There was a problem with the response.', response.status)
    } else {
      return response.json()
    }
  })
  .then((data) => { app(data) })
  .catch((error) => { console.log('There was an error. Promise rejected.', error) })

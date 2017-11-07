/* global d3:true */
/* eslint no-undef: "error" */

// create app

const app = (data) => {
  if (!data) {
    console.log('Loading...')
  }
  console.log('data', data)

  const tempData = data.monthlyVariance
  console.log('tempData', tempData, tempData.length)

  const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  console.log(month)

  const colors = ['#225ea8', '#41b6c4', '#a1dab4', '#ffffb2', '#fecc5c', '#fd8d3c', '#e31a1c']

  const colorScale = d3.scaleQuantize()
    .domain([
      d3.min(tempData, d => d.variance),
      d3.max(tempData, d => d.variance)
    ])
    .range(colors)

  // create dimensions
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

  // x scale and axis
  // Need to convert to date objects to use scaleTime()
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
    .call(yAxis)

  svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(${padding / 2}, ${h / 2})rotate(-90)`)
    .attr('class', 'chart-label')
    .text('Month')

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
    .attr('fill', d => colorScale(d.variance))
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

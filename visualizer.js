document.addEventListener('DOMContentLoaded', function() {
    const data = [
        { key: 'Sedan', value: 30, company: 'Company A' },
        { key: 'SUV', value: 50, company: 'Company B' },
        { key: 'Truck', value: 20, company: 'Company C' }
    ];

    const rangeData = [
        { key: 'Model X', value: 300 },
        { key: 'Model Y', value: 280 },
        { key: 'Model 3', value: 310 }
    ];

    const msrpData = [
        { key: 'Model X', value: 80000 },
        { key: 'Model Y', value: 60000 },
        { key: 'Model 3', value: 40000 }
    ];

    if (document.getElementById('vehicle-types-viz')) {
        createBarChart('#vehicle-types-viz', data, 'Electric Vehicle Type', 'Count', false, 'Distribution of Electric Vehicle Types');
    }

    if (document.getElementById('electric-range-viz')) {
        createBarChart('#electric-range-viz', rangeData, 'Model', 'Electric Range', false, 'Electric Range of Various Models');
    }

    if (document.getElementById('base-msrp-viz')) {
        createBarChart('#base-msrp-viz', msrpData, 'Model', 'Base MSRP', false, 'Base MSRP of Electric Vehicles');
    }

    function createBarChart(container, data, xLabel, yLabel, isHorizontal = false, title) {
        const margin = { top: 50, right: 50, bottom: 50, left: 50 };
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const x = d3.scaleBand()
            .range([0, width])
            .domain(data.map(d => d.key))
            .padding(0.1);

        const y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(data, d => d.value)]);

        const xAxis = d3.axisBottom(x);
        const yAxis = d3.axisLeft(y);

        svg.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis);

        svg.append('g')
            .call(yAxis);

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        svg.selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.key))
            .attr('y', d => y(d.value))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d.value))
            .attr('fill', d => color(d.company));

        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height + 40)
            .attr('text-anchor', 'middle')
            .text(xLabel);

        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -40)
            .attr('text-anchor', 'middle')
            .text(yLabel);

        svg.append('text')
            .attr('x', width / 2)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .style('font-size', '20px')
            .text(title);
    }
});

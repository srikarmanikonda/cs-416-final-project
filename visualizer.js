document.addEventListener('DOMContentLoaded', function() {
    d3.csv('narrative_viz_electric_vehicles.csv').then(data => {
        const vehicleTypesData =
        // give me hard coded data

        [
            { key: 'SUV', value: 5 },
            { key: 'Sedan', value: 5 },
            { key: 'Hatchback', value: 3 },
            { key: 'Truck', value: 2 },
            { key: 'Coupe', value: 1 },
            { key: 'Van', value: 1 }
        ];

        const rangeData = data.map(d => ({
            model: d.Model,
            electricRange: +d['Electric Range'],
            msrp: +d['Base MSRP']
        }));

        const msrpData = data.map(d => ({
            key: d.Model,
            value: +d['Base MSRP']
        }));

        if (document.getElementById('vehicle-types-viz')) {
            createBarChart('#vehicle-types-viz', vehicleTypesData, 'Electric Vehicle Type', 'Count', false, 'Distribution of Electric Vehicle Types');
        }

        if (document.getElementById('electric-range-viz')) {
            createBarChart('#electric-range-viz', rangeData, 'Model', 'Electric Range', false, 'Electric Range of Various Models');
        }

        if (document.getElementById('base-msrp-viz')) {
            createBarChart('#base-msrp-viz', msrpData, 'Model', 'Base MSRP', false, 'Base MSRP of Electric Vehicles');
        }

        if (document.getElementById('scatter-plot-viz')) {
            createScatterPlot('#scatter-plot-viz', rangeData, 'Base MSRP', 'Electric Range', 'Electric Range vs. Base MSRP');
        }
    });

    function createBarChart(container, data, xLabel, yLabel, isHorizontal = false, title) {
        const margin = { top: 50, right: 50, bottom: 50, left: 50 };
        const width = 800 - margin.left - margin.right;
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
            .attr('fill', d => color(d.key));

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

    function createScatterPlot(container, data, xLabel, yLabel, title) {
        const margin = { top: 50, right: 50, bottom: 50, left: 50 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const x = d3.scaleLinear()
            .range([0, width])
            .domain([0, d3.max(data, d => d.msrp)]);

        const y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(data, d => d.electricRange)]);

        const xAxis = d3.axisBottom(x);
        const yAxis = d3.axisLeft(y);

        svg.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis);

        svg.append('g')
            .call(yAxis);

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        svg.selectAll('.dot')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('cx', d => x(d.msrp))
            .attr('cy', d => y(d.electricRange))
            .attr('r', 5)
            .attr('fill', d => color(d.model))
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Model: ${d.model}<br>MSRP: $${d.msrp}<br>Range: ${d.electricRange} miles`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

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

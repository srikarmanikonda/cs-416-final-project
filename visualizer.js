document.addEventListener('DOMContentLoaded', function() {
    const vehicleTypesData = [
        { key: 'SUV', value: 5 },
        { key: 'Sedan', value: 5 },
        { key: 'Hatchback', value: 3 },
        { key: 'Truck', value: 2 },
        { key: 'Coupe', value: 1 },
        { key: 'Van', value: 1 }
    ];

    const rangeData = [
        { model: 'Chevrolet Bolt EV', brand: 'Chevrolet', electricRange: 259, msrp: 36620 },
        { model: 'Chevrolet Bolt EUV', brand: 'Chevrolet', electricRange: 247, msrp: 33995 },
        { model: 'Ford Mustang Mach-E', brand: 'Ford', electricRange: 300, msrp: 42500 },
        { model: 'Hyundai Kona Electric', brand: 'Hyundai', electricRange: 258, msrp: 37400 },
        { model: 'Kia Niro EV', brand: 'Kia', electricRange: 239, msrp: 39990 },
        { model: 'Nissan Leaf', brand: 'Nissan', electricRange: 149, msrp: 31500 },
        { model: 'Tesla Model 3', brand: 'Tesla', electricRange: 263, msrp: 39990 },
        { model: 'Tesla Model S', brand: 'Tesla', electricRange: 396, msrp: 79990 },
        { model: 'Tesla Model X', brand: 'Tesla', electricRange: 340, msrp: 89990 },
        { model: 'Tesla Model Y', brand: 'Tesla', electricRange: 326, msrp: 49990 },
        { model: 'Volkswagen ID.4', brand: 'Volkswagen', electricRange: 250, msrp: 39995 }
    ];

    const msrpHardcodedData = [
        { key: 'Chevrolet Bolt EV', value: 36620 },
        { key: 'Chevrolet Bolt EUV', value: 33995 },
        { key: 'Ford Mustang Mach-E', value: 42500 },
        { key: 'Hyundai Kona Electric', value: 37400 },
        { key: 'Kia Niro EV', value: 39990 },
        { key: 'Nissan Leaf', value: 31500 },
        { key: 'Tesla Model 3', value: 39990 },
        { key: 'Tesla Model S', value: 79990 },
        { key: 'Tesla Model X', value: 89990 },
        { key: 'Tesla Model Y', value: 49990 },
        { key: 'Volkswagen ID.4', value: 39995 }
    ];

    if (document.getElementById('vehicle-types-viz')) {
        createPieChart('#vehicle-types-viz', vehicleTypesData, 'Distribution of Electric Vehicle Types');
    }

    if (document.getElementById('electric-range-viz')) {
        createScatterPlot('#electric-range-viz', rangeData, 'Base MSRP', 'Electric Range', 'Electric Range of Various Models');
    }

    if (document.getElementById('base-msrp-viz')) {
        createBarChart('#base-msrp-viz', msrpHardcodedData, 'Model', 'Base MSRP', false, 'Base MSRP of Electric Vehicles');
    }

 

    function createPieChart(container, data, title) {
        const width = 800;
        const height = 400;
        const radius = Math.min(width, height) / 2;

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2}, ${height / 2})`);

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const pie = d3.pie()
            .value(d => d.value);

        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);

        const arcs = svg.selectAll('.arc')
            .data(pie(data))
            .enter()
            .append('g')
            .attr('class', 'arc');

        arcs.append('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data.key));

        arcs.append('text')
            .attr('transform', d => `translate(${arc.centroid(d)})`)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .text(d => d.data.key);

        svg.append('text')
            .attr('x', 0)
            .attr('y', -height / 2 + 40)
            .attr('text-anchor', 'middle')
            .style('font-size', '20px')
            .text(title);


        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        arcs.on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            const percentage = ((d.data.value / d3.sum(data.map(d => d.value))) * 100).toFixed(2);
            tooltip.html(`${d.data.key}: ${d.data.value} (${percentage}%)`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        }).on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });


        const annotations = [
            {
                note: {
                    label: 'Most common vehicle types',
                    title: 'SUV and Sedan',
                    wrap: 200
                },
                connector: {
                    end: "arrow"
                },
                color: ["#E8336D"],
                x: arc.centroid(pie(data)[0])[0],
                y: arc.centroid(pie(data)[0])[1],
                dx: 50,
                dy: -50
            },
            {
                note: {
                    label: 'Least common vehicle types',
                    title: 'Coupe and Van',
                    wrap: 200
                },
                connector: {
                    end: "arrow"
                },
                color: ["#E8336D"],
                x: arc.centroid(pie(data)[4])[0],
                y: arc.centroid(pie(data)[4])[1],
                dx: -50,
                dy: 50
            }
        ];

        const makeAnnotations = d3.annotation()
            .annotations(annotations)
            .type(d3.annotationCalloutCircle)
            .accessors({
                x: d => d.x,
                y: d => d.y
            });

        svg.append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations);
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
                tooltip.html(`Model: ${d.model}<br>Brand: ${d.brand}<br>MSRP: $${d.msrp}<br>Range: ${d.electricRange} miles`)
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

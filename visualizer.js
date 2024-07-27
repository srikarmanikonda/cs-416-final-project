document.addEventListener('DOMContentLoaded', async function() {
    const vehicleTypesDataHardcoded = [
        { key: 'SUV', value: 5 },
        { key: 'Sedan', value: 5 },
        { key: 'Hatchback', value: 3 },
        { key: 'Truck', value: 2 },
        { key: 'Coupe', value: 1 },
        { key: 'Van', value: 1 }
    ];

    const rangeDataHardcoded = [
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

    const hardcodedModelsArray = [
        { make: 'Chevrolet', model: 'Bolt EV' },
        { make: 'Chevrolet', model: 'Bolt EUV' },
        { make: 'Ford', model: 'Mustang Mach-E' },
        { make: 'Hyundai', model: 'Kona Electric' },
        { make: 'Kia', model: 'Niro EV' },
        { make: 'Nissan', model: 'Leaf' },
        { make: 'Tesla', model: 'Model 3' },
        { make: 'Tesla', model: 'Model S' },
        { make: 'Tesla', model: 'Model X' },
        { make: 'Tesla', model: 'Model Y' },
        { make: 'Volkswagen', model: 'ID.4' }
    ];

    const data = await d3.csv('narrative_viz_electric_vehicle.csv');
    console.log('CSV Data:', data);

    const filteredData = data.filter(d =>
        hardcodedModelsArray.some(hardcodedModel =>
            d['Make'].toLowerCase() === hardcodedModel.make.toLowerCase() &&
            d['Model'].toLowerCase() === hardcodedModel.model.toLowerCase()
        )
    );

    const msrpData = filteredData.map(d => ({
        key: `${d['Make']} ${d['Model']}`,
        value: +d['Base MSRP']
    }));

    console.log('MSRP Data:', msrpData);

    const vehicleTypeCounts = data.reduce((acc, d) => {
        acc[d['Electric Vehicle Type']] = (acc[d['Electric Vehicle Type']] || 0) + 1;
        return acc;
    }, {});

    const vehicleTypesData = Object.keys(vehicleTypeCounts).map(key => ({
        key,
        value: vehicleTypeCounts[key]
    }));

    const rangeData = filteredData.map(d => ({
        model: d['Model'],
        brand: d['Make'],
        electricRange: +d['Electric Range'],
        msrp: +d['Base MSRP']
    }));

    console.log('Range Data:', rangeData);

    if (document.getElementById('vehicle-types-viz')) {
        createPieChart('#vehicle-types-viz', vehicleTypesData, 'Distribution of Electric Vehicle Types');
    }

    if (document.getElementById('electric-range-viz')) {
        createScatterPlot('#electric-range-viz', rangeData, 'Base MSRP', 'Electric Range', 'Electric Range of Various Models');
    }

    if (document.getElementById('base-msrp-viz')) {
        createBarChart('#base-msrp-viz', msrpData, 'Model', 'Base MSRP', 'Base MSRP of Electric Vehicles');
    }

    function createBarChart(container, data, xLabel, yLabel, title) {
        const margin = { top: 60, right: 100, bottom: 100, left: 100 };
        const width = 1100 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom + 50)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const x = d3.scaleBand()
            .range([0, width])
            .domain(data.map(d => d.key))
            .padding(0.1);

        const y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(data, d => d.value)]);

        const xAxis = d3.axisBottom(x)
            .tickSize(0)
            .tickPadding(10);

        const yAxis = d3.axisLeft(y)
            .tickSize(0)
            .tickPadding(10);

        svg.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis)
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end');

        svg.append('g')
            .call(yAxis);

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("background-color", "white")
            .style("padding", "10px")
            .style("border-radius", "5px")
            .style("border", "1px solid black")
            .style("position", "absolute")
            .style("color", "black");

        svg.selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.key))
            .attr('y', d => y(d.value))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d.value))
            .attr('fill', d => color(d.key))
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(150)
                    .style("opacity", .9);
                tooltip.html(`Make and Model: ${d.key}<br>MSRP: $${d.value}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            });

        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height + 90)
            .attr('text-anchor', 'middle')
            .text(xLabel);

        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -60)
            .attr('text-anchor', 'middle')
            .text(yLabel);

        svg.append('text')
            .attr('x', width / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .style('font-size', '20px')
            .text(title);

        const averagePrice = d3.mean(data, d => d.value);

        svg.append("line")
            .attr("x1", 0)
            .attr("y1", y(averagePrice))
            .attr("x2", width)
            .attr("y2", y(averagePrice))
            .attr("stroke", "black")
            .attr("stroke-dasharray", "4");

        svg.append('text')
            .attr('x', width + 10)
            .attr('y', y(averagePrice))
            .attr('text-anchor', 'start')
            .style('font-size', '12px')
            .text('Average MSRP');
    }

    function createPieChart(container, data, title) {
        const width = 800;
        const height = 500;
        const radius = Math.min(width, height) / 2;
        const pieChartOffsetY = 50;

        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height + pieChartOffsetY)
            .append('g')
            .attr('transform', `translate(${width / 2}, ${(height / 2) + pieChartOffsetY})`);

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

        const titleGroup = d3.select(container)
            .select('svg')
            .append('g')
            .attr('transform', `translate(${width / 2}, 20)`);

        titleGroup.append('text')
            .attr('text-anchor', 'middle')
            .style('font-size', '20px')
            .text(title);

        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("background-color", "white")
            .style("padding", "10px")
            .style("border-radius", "5px")
            .style("border", "1px solid black")
            .style("position", "absolute")
            .style("color", "black");

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
                    label: 'Over three quarters of electric vehicles are battery-powered',
                    title: 'Battery cars dominate',
                    wrap: 200,
                    padding: 5, 
                    align: 'left' 
                },
                connector: {
                    end: "arrow"
                },
                color: ["#000000"],
                x: 250,
                y: -140,
                dx: 150,
                dy: -50,
                subject: {
                    radius: 20,  
                    radiusPadding: 10 
                }
            },
        ];
        

        const makeAnnotations = d3.annotation()
            .annotations(annotations)
            .type(d3.annotationCallout)
            .accessors({
                x: d => d.x,
                y: d => d.y
            });

        svg.append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations);
    }

    function createScatterPlot(container, data, xLabel, yLabel, title) {
        const margin = { top: 70, right: 70, bottom: 100, left: 100 }; 
        const width = 900 - margin.left - margin.right;
        const height = 450 - margin.top - margin.bottom;

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
            .style("opacity", 0)
            .style("background-color", "white")
            .style("padding", "10px")
            .style("border-radius", "5px")
            .style("border", "1px solid black")
            .style("position", "absolute")
            .style("color", "black");

        svg.selectAll('.dot')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('cx', d => x(d.msrp))
            .attr('cy', d => y(d.electricRange))
            .attr('r', 5)
            .attr('fill', d => color(`${d.brand} ${d.model}`))
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
            .attr('y', height + 80)
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

        data.forEach(d => {
            d.efficiency = d.msrp / d.electricRange;
        });

        const mostEfficientCar = data.reduce((prev, curr) => (prev.efficiency < curr.efficiency ? prev : curr));
        const leastEfficientCar = data.reduce((prev, curr) => (prev.efficiency > curr.efficiency ? prev : curr));

        const annotations = [
            {
                note: {
                    label: `The most efficient car is: ${mostEfficientCar.model}`,
                    wrap: 200
                },
                connector: {
                    end: "arrow"
                },
                subject: {
                    radius: 10,
                    radiusPadding: 5
                },
                color: ["#000000"],
                x: x(mostEfficientCar.msrp),
                y: y(mostEfficientCar.electricRange),
                dx: 50,
                dy: -50
            },
            {
                note: {
                    label: `The least efficient car is: ${leastEfficientCar.model}`,
                    wrap: 200
                },
                connector: {
                    end: "arrow"
                },
                subject: {
                    radius: 10,
                    radiusPadding: 5
                },
                color: ["#000000"],
                x: x(leastEfficientCar.msrp),
                y: y(leastEfficientCar.electricRange),
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

});

document.addEventListener('DOMContentLoaded', function() {
    // Hardcoded data for each chart
    const vehicleTypesData = [
        { key: 'Sedan', value: 120 },
        { key: 'SUV', value: 80 },
        { key: 'Truck', value: 40 },
        { key: 'Coupe', value: 30 }
    ];

    const electricRangeData = [
        { key: 'Model S', value: 370 },
        { key: 'Model 3', value: 350 },
        { key: 'Leaf', value: 226 },
        { key: 'Bolt', value: 259 }
    ];

    const baseMsrpData = [
        { key: 'Model S', value: 79990 },
        { key: 'Model 3', value: 39990 },
        { key: 'Leaf', value: 31990 },
        { key: 'Bolt', value: 36990 }
    ];

    const scene1Viz = document.getElementById('vehicle-types-viz');
    if (scene1Viz) renderVehicleTypes(vehicleTypesData);

    const scene2Viz = document.getElementById('electric-range-viz');
    if (scene2Viz) renderElectricRange(electricRangeData);

    const scene3Viz = document.getElementById('base-msrp-viz');
    if (scene3Viz) renderBaseMsrp(baseMsrpData);

    function renderVehicleTypes(data) {
        console.log('Rendering vehicle types');
        createBarChart('#vehicle-types-viz', data, 'Electric Vehicle Type', 'Count', false, 'Distribution of Electric Vehicle Types');
    }

    function renderElectricRange(data) {
        console.log('Rendering electric range');
        createBarChart('#electric-range-viz', data, 'Model', 'Electric Range', true, 'Electric Range of Various Models');
    }

    function renderBaseMsrp(data) {
        console.log('Rendering base MSRP');
        createBarChart('#base-msrp-viz', data, 'Model', 'Base MSRP', true, 'Base MSRP of Electric Vehicles');
    }

    function createBarChart(container, data, xLabel, yLabel, isHorizontal = false, title) {
        console.log(`Creating bar chart: ${title}`);
        
        const svg = d3.select(container).attr('width', '100%').attr('height', '500px');
        const margin = { top: 20, right: 30, bottom: 40, left: 90 };
        const width = parseInt(svg.style('width')) - margin.left - margin.right;
        const height = parseInt(svg.style('height')) - margin.top - margin.bottom;

        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        let x, y;
        if (isHorizontal) {
            x = d3.scaleLinear().range([0, width]);
            y = d3.scaleBand().range([height, 0]).padding(0.1);
        } else {
            x = d3.scaleBand().range([0, width]).padding(0.1);
            y = d3.scaleLinear().range([height, 0]);
        }

        x.domain(isHorizontal ? [0, d3.max(data, d => d.value)] : data.map(d => d.key));
        y.domain(isHorizontal ? data.map(d => d.key) : [0, d3.max(data, d => d.value)]);

        g.append('g').attr('class', 'x axis').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x));
        g.append('g').attr('class', 'y axis').call(d3.axisLeft(y));

        g.selectAll('.bar').data(data).enter().append('rect').attr('class', 'bar')
            .attr(isHorizontal ? 'y' : 'x', d => isHorizontal ? y(d.key) : x(d.key))
            .attr(isHorizontal ? 'x' : 'y', d => isHorizontal ? x(0) : y(d.value))
            .attr(isHorizontal ? 'width' : 'height', d => isHorizontal ? x(d.value) : height - y(d.value))
            .attr(isHorizontal ? 'height' : 'width', y.bandwidth());

        g.append('text').attr('class', 'axis-label').attr('x', width / 2).attr('y', height + margin.bottom)
            .attr('dy', '-0.5em').style('text-anchor', 'middle').text(xLabel);

        g.append('text').attr('class', 'axis-label').attr('transform', 'rotate(-90)')
            .attr('x', -height / 2).attr('y', -margin.left + 20).style('text-anchor', 'middle').text(yLabel);

        g.append('text').attr('class', 'title').attr('x', width / 2).attr('y', -margin.top / 2)
            .attr('dy', '1em').style('text-anchor', 'middle').style('font-size', '16px').text(title);

        addAnnotations(g, data, x, y, isHorizontal);
    }

    function addAnnotations(g, data, x, y, isHorizontal) {
        console.log('Adding annotations');
        
        let annotations = [];

        if (g.node().parentNode.id === 'scene1') {
            const maxType = d3.max(data, d => d.value);
            const maxData = data.filter(d => d.value === maxType)[0];
            annotations.push({
                note: { label: `Most common: ${maxData.key} (${maxType})`, title: "Key Insight" },
                x: isHorizontal ? x(maxType) + 5 : x(maxData.key) + x.bandwidth() / 2,
                y: isHorizontal ? y(maxData.key) + y.bandwidth() / 2 : y(maxType) - 5,
                dx: 10,
                dy: -10
            });
        } else if (g.node().parentNode.id === 'scene2') {
            const maxRange = d3.max(data, d => d.value);
            const maxData = data.filter(d => d.value === maxRange)[0];
            annotations.push({
                note: { label: `Longest range: ${maxData.key} (${maxRange} miles)`, title: "Key Insight" },
                x: isHorizontal ? x(maxRange) + 5 : x(maxData.key) + x.bandwidth() / 2,
                y: isHorizontal ? y(maxData.key) + y.bandwidth() / 2 : y(maxRange) - 5,
                dx: 10,
                dy: -10
            });
        } else if (g.node().parentNode.id === 'scene3') {
            const maxMsrp = d3.max(data, d => d.value);
            const maxData = data.filter(d => d.value === maxMsrp)[0];
            annotations.push({
                note: { label: `Highest MSRP: ${maxData.key} ($${maxMsrp})`, title: "Key Insight" },
                x: isHorizontal ? x(maxMsrp) + 5 : x(maxData.key) + x.bandwidth() / 2,
                y: isHorizontal ? y(maxData.key) + y.bandwidth() / 2 : y(maxMsrp) - 5,
                dx: 10,
                dy: -10
            });
        }

        const makeAnnotations = d3.annotation().annotations(annotations);
        g.append("g").attr("class", "annotation-group").call(makeAnnotations);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    d3.csv('narrative_viz_electric_vehicles.csv').then(function(data) {
        console.log('CSV data loaded successfully:', data);
        
        data.forEach(d => {
            d['Electric Range'] = +d['Electric Range'];
            d['Base MSRP'] = +d['Base MSRP'];
        });

        renderVehicleTypes(data);
        renderElectricRange(data);
        renderBaseMsrp(data);
    }).catch(function(error) {
        console.error('Error loading the CSV file:', error);
    });

    function renderVehicleTypes(data) {
        console.log('Rendering vehicle types');
        
        const vehicleTypesData = Array.from(d3.rollup(data, v => v.length, d => d['Electric Vehicle Type']));
        createBarChart('#vehicle-types-viz', vehicleTypesData, 'Electric Vehicle Type', 'Count', false, 'Distribution of Electric Vehicle Types');
    }

    function renderElectricRange(data) {
        console.log('Rendering electric range');
        
        const electricRangeData = data.map(d => ({ model: d.Model, range: d['Electric Range'] }));
        createBarChart('#electric-range-viz', electricRangeData, 'Model', 'Electric Range', true, 'Electric Range of Various Models');
    }

    function renderBaseMsrp(data) {
        console.log('Rendering base MSRP');
        
        const baseMsrpData = data.map(d => ({ model: d.Model, msrp: d['Base MSRP'] }));
        createBarChart('#base-msrp-viz', baseMsrpData, 'Model', 'Base MSRP', true, 'Base MSRP of Electric Vehicles');
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

        x.domain(isHorizontal ? [0, d3.max(data, d => d[1])] : data.map(d => d[0]));
        y.domain(isHorizontal ? data.map(d => d[0]) : [0, d3.max(data, d => d[1])]);

        g.append('g').attr('class', 'x axis').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x));
        g.append('g').attr('class', 'y axis').call(d3.axisLeft(y));

        g.selectAll('.bar').data(data).enter().append('rect').attr('class', 'bar')
            .attr(isHorizontal ? 'y' : 'x', d => isHorizontal ? y(d[0]) : x(d[0]))
            .attr(isHorizontal ? 'x' : 'y', d => isHorizontal ? x(d[1]) : y(d[1]))
            .attr(isHorizontal ? 'width' : 'height', d => isHorizontal ? width - x(d[1]) : height - y(d[1]))
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

        if (currentScene === 1) {
            const maxType = d3.max(data, d => d[1]);
            const maxData = data.filter(d => d[1] === maxType)[0];
            annotations.push({
                note: { label: `Most common: ${maxData[0]} (${maxType})`, title: "Key Insight" },
                x: isHorizontal ? x(maxType) + 5 : x(maxData[0]) + x.bandwidth() / 2,
                y: isHorizontal ? y(maxData[0]) + y.bandwidth() / 2 : y(maxType) - 5,
                dx: 10,
                dy: -10
            });
        } else if (currentScene === 2) {
            const maxRange = d3.max(data, d => d.range);
            const maxData = data.filter(d => d.range === maxRange)[0];
            annotations.push({
                note: { label: `Longest range: ${maxData.model} (${maxRange} miles)`, title: "Key Insight" },
                x: isHorizontal ? x(maxRange) + 5 : x(maxData.model) + x.bandwidth() / 2,
                y: isHorizontal ? y(maxData.model) + y.bandwidth() / 2 : y(maxRange) - 5,
                dx: 10,
                dy: -10
            });
        } else if (currentScene === 3) {
            const maxMsrp = d3.max(data, d => d.msrp);
            const maxData = data.filter(d => d.msrp === maxMsrp)[0];
            annotations.push({
                note: { label: `Highest MSRP: ${maxData.model} ($${maxMsrp})`, title: "Key Insight" },
                x: isHorizontal ? x(maxMsrp) + 5 : x(maxData.model) + x.bandwidth() / 2,
                y: isHorizontal ? y(maxData.model) + y.bandwidth() / 2 : y(maxMsrp) - 5,
                dx: 10,
                dy: -10
            });
        }

        const makeAnnotations = d3.annotation().annotations(annotations);
        g.append("g").attr("class", "annotation-group").call(makeAnnotations);
    }
});

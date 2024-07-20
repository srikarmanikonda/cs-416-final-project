document.addEventListener('DOMContentLoaded', function() {
    let currentScene = 1;

    d3.csv('narrative_viz_electric_vehicles.csv').then(function(data) {
        data.forEach(d => {
            d['Electric Range'] = +d['Electric Range'];
            d['Base MSRP'] = +d['Base MSRP'];
        });

        d3.select('#scene1-btn').on('click', () => loadScene(1, data));
        d3.select('#scene2-btn').on('click', () => loadScene(2, data));
        d3.select('#scene3-btn').on('click', () => loadScene(3, data));

        loadScene(currentScene, data);
    }).catch(function(error) {
        console.error('Error loading the CSV file:', error);
    });

    function loadScene(scene, data) {
        const sceneContainer = d3.select('#scene-container');
        sceneContainer.html('');
        
        if (scene === 1) {
            currentScene = 1;
            renderVehicleTypes(data);
            addNarrativeText(sceneContainer, "Vehicle Types", "This scene shows the distribution of different types of electric vehicles in the dataset.");
        } else if (scene === 2) {
            currentScene = 2;
            renderElectricRange(data);
            addNarrativeText(sceneContainer, "Electric Range", "This scene illustrates the electric range of various electric vehicles.");
        } else if (scene === 3) {
            currentScene = 3;
            renderBaseMsrp(data);
            addNarrativeText(sceneContainer, "Base MSRP", "This scene shows the base MSRP of electric vehicles, highlighting the affordability and premium segments.");
        }
    }

    function renderVehicleTypes(data) {
        const vehicleTypesData = Array.from(d3.rollup(data, v => v.length, d => d['Electric Vehicle Type']));
        createBarChart('#scene-container', vehicleTypesData, 'Electric Vehicle Type', 'Count', false, 'Distribution of Electric Vehicle Types');
    }

    function renderElectricRange(data) {
        const electricRangeData = data.map(d => ({ model: d.Model, range: d['Electric Range'] }));
        createBarChart('#scene-container', electricRangeData, 'Model', 'Electric Range', true, 'Electric Range of Various Models');
    }

    function renderBaseMsrp(data) {
        const baseMsrpData = data.map(d => ({ model: d.Model, msrp: d['Base MSRP'] }));
        createBarChart('#scene-container', baseMsrpData, 'Model', 'Base MSRP', true, 'Base MSRP of Electric Vehicles');
    }

    function createBarChart(container, data, xLabel, yLabel, isHorizontal = false, title) {
        const svg = d3.select(container).append('svg').attr('width', '100%').attr('height', '500px');
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
            .attr(isHorizontal ? 'y' : 'x', d => x(isHorizontal ? d[1] : d[0]))
            .attr(isHorizontal ? 'x' : 'y', d => y(isHorizontal ? d[0] : d[1]))
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

    function addNarrativeText(container, title, text) {
        container.append('h2').text(title);
        container.append('p').text(text);
    }
});

class BaserowChart {
    current_title = '';
    countries = []

    constructor(charts_to_render) {
        const title = document.querySelector('title');
        const page_title = title.textContent;
        console.log('Initial page title:', page_title);
        this.charts_to_render = charts_to_render;
        this.init(page_title);

        const observer = new MutationObserver(() => {
            if (this.current_title !== page_title) {
                console.log('Title changed to:', page_title);
                this.renderAllCharts(page_title);
                this.current_title = page_title;
            }
        });
        observer.observe(title, { childList: true });
    }

    async init(page_title) {
        this.countries = await this.getCountries();
        this.renderAllCharts(page_title);
    }

    async getCountries() {
        const response = await fetch('https://unpkg.com/world-atlas/countries-50m.json');
        const data = await response.json();
        return ChartGeo.topojson.feature(data, data.objects.countries).features;
    }
    renderAllCharts(page_title) {
        console.log('Rendering charts for page:', page_title);
        this.charts_to_render.filter(chart => chart.page_title === page_title).forEach(chart => this.renderChart(chart))
    }

    renderChart(chart) {
        console.log('Preparing to render chart:', chart);
        this.get_table_data(chart.data_table, chart.column_number, (data) => {
            console.log('Rendering chart:', chart, 'with data:', data);
            this.draw_chart(document.querySelector(`.${chart.container}`), chart.type, data, chart.page_title);
        });
    }

    get_table_data(data_table, column_number, callback) {
        const tryGetData = () => {
            const table = document.querySelector(`.${data_table}`);
            let labels = [];
            let values = [];
            let title = '';
            // check if it is a table element or column element
            if (table.classList.contains('table-element')) {
                labels = Array.from(table.querySelectorAll(`tr > td:nth-child(1) .ab-link`)).map(i => i.textContent.trim());
                values = Array.from(table.querySelectorAll(`tr > td:nth-child(${column_number}) .ab-text`)).map(i => parseFloat(i.textContent));
                title = table.querySelector(`thead tr th:nth-child(${column_number})`).textContent.trim();
            }
            if (table.classList.contains('column-element')) {
                // labels: loop over all the columns and search for the fist .ab-text element
                console.log('Column element detected');
                console.log(table.querySelectorAll(`.ab-text`));
                console.log(table.querySelectorAll(`.column-element__column:nth-child(1) .ab-link`));
                labels = Array.from(table.querySelectorAll(`.column-element__column:nth-child(1) .ab-link`)).map(i => i.textContent.trim());
                values = Array.from(table.querySelectorAll(`.column-element__column:nth-child(${column_number}) .ab-link`)).map(i => parseFloat(i.textContent));
                title = 'Number of works'

            }
            console.log('Extracted labels:', labels, 'values:', values, 'title:', title);

            if (labels.length > 0 && values.length > 0) {
                return { labels, values, title };
            }
            return null;
        };

        let result = tryGetData();

        if (result) {
            callback(result);
        } else {
            const interval = setInterval(() => {
                result = tryGetData();
                if (result) {
                    clearInterval(interval);
                    callback(result);
                }
            }, 500);
        }
    }

    draw_chart(container, chart_type, data) {
        const existing_canvas = container.querySelector('canvas');
        if (existing_canvas) {
            existing_canvas.remove();
        }
        const ctx = document.createElement('canvas')
        container.appendChild(ctx)

        // set configuration based on the chart type
        let backgroundColors = ['rgb(255, 179, 186)', 'rgb(255, 223, 186)', 'rgb(255, 255, 186)', 'rgb(186, 255, 201)', 'rgb(186, 225, 255)', 'rgb(255, 204, 229)', 'rgb(204, 255, 229)', 'rgb(229, 204, 255)', 'rgb(204, 229, 255)', 'rgb(255, 239, 186)']
        let options = {}
        console.log('Chart type:', chart_type);

        if (chart_type === 'bar') {
            options = {
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
            backgroundColors = ['rgb(46,144,250)']
        }

        if (chart_type === 'pie') {
            options = {
                plugins: {
                    legend: {
                        display: true
                    }
                }
            }
        }

        if (chart_type === 'choropleth') {
            options = {
                showOutline: true,
                showGraticule: false,
                plugins: {
                    legend: {
                        display: false
                    },
                },
                scales: {
                    projection: {
                        axis: 'x',
                        projection: 'equalEarth'
                    }
                },
                color: {
                    quantize: 15,
                    axis: 'x',
                    legend: {
                        position: 'bottom-right',
                        align: 'right',
                    }
                }
            }

            const original_labels = data.labels;
            data.labels = this.countries.map(c => c.properties.name);

            const original_values = data.values;
            data.values = this.countries.map((country) => {
                const index = original_labels.findIndex(label => label.toLowerCase() === country.properties.name.toLowerCase());
                if (index > -1) {
                    return { feature: country, value: original_values[index] };
                } else {
                    return { feature: country, value: 0 };
                }
            });
        }

        console.log('Chart options:', options);
        const chart = new Chart(ctx, {
            type: chart_type,
            data: {
                labels: data.labels,
                datasets: [{
                    label: data.title,
                    data: data.values,
                }]
            },
            options: options

        });
        console.log('Chart rendered:', chart);
        container.style.width = '960px';
        container.style.margin = '0 auto';
        if (chart_type !== 'choropleth') {
            chart.data.datasets[0].backgroundColor = backgroundColors;
        }

    }
}

// Expose globally
window.BaserowChart = BaserowChart;
/*
// set the width of the chart 
document.querySelector('.chart__container').style.width = '960px';
*/
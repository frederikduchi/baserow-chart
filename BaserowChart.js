class BaserowChart {
    current_title = '';

    constructor(charts_to_render) {
        this.charts_to_render = charts_to_render;

        const title = document.querySelector('title');

        this.renderAllCharts(title.textContent);

        const observer = new MutationObserver(() => {
            const page_title = title.textContent;
            if (this.current_title !== page_title) {
                console.log('Title changed to:', page_title);
                this.renderAllCharts(page_title);
                this.current_title = page_title;
            }
        });
        observer.observe(title, { childList: true });
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
        let display_legend = true;
        let backgroundColors = ['rgba(231, 145, 135, 1)', 'rgba(116, 227, 162, 1)', 'rgba(134, 186, 221, 1)', 'rgba(229, 205, 108, 1)', 'rgba(242, 173, 113, 1)']
        if(chart_type === 'bar') {
            display_legend = false;
            backgroundColors = ['rgb(46,144,250)']
        }
        
;
        new Chart(ctx, {
            type: chart_type,
            data: {
                labels: data.labels,
                datasets: [{
                    label: data.title,
                    data: data.values,
                    backgroundColor: backgroundColors
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: display_legend
                    }
                }
            }
        });
        container.style.width = '960px';
        container.style.margin = '0 auto';
    }
}

// Expose globally
window.BaserowChart = BaserowChart;
/*
// set the width of the chart 
document.querySelector('.chart__container').style.width = '960px';
*/
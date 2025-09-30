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
        const data = this.get_table_data(chart.data_table, chart.column_number);
        console.log('Rendering chart:', chart, 'with data:', data);
        this.draw_chart(document.querySelector(`.${chart.container}`), chart.type, data, chart.page_title);
    }

    get_table_data(data_table, column_number) {
        const table = document.querySelector(`.${data_table}`);
        let labels = [];
        let values = [];
        let title = '';
        
        const interval_id = setInterval(() => {
            labels = Array.from(table.querySelectorAll(`tr > td:nth-child(1) .ab-text`)).map(i => i.textContent.trim());
            values = Array.from(table.querySelectorAll(`tr > td:nth-child(${column_number}) .ab-text`)).map(i => parseFloat(i.textContent));
            title = table.querySelector(`thead tr th:nth-child(${column_number})`).textContent.trim();
            console.log('Extracted labels:', labels, 'values:', values, 'title:', title);
            if (labels.length > 0 && values.length > 0) {
                clearInterval(interval_id);
            }
        }, 500);
        return { labels, values, title };
    }

    draw_chart(container, chart_type, data) {
        const existing_canvas = container.querySelector('canvas');
        if (existing_canvas) {
            existing_canvas.remove();
        }
        const ctx = document.createElement('canvas')
        container.appendChild(ctx)
        new Chart(ctx, {
            type: chart_type,
            data: {
                labels: data.labels,
                datasets: [{
                    label: data.title,
                    data: data.values,
                    backgroundColor: ['rgb(46,144,250)']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}

// Expose globally
window.BaserowChart = BaserowChart;
/*
// set the width of the chart 
document.querySelector('.chart__container').style.width = '960px';
*/
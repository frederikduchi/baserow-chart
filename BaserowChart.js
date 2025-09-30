class BaserowChart {
    constructor(charts_to_render) {
        this.charts_to_render = charts_to_render;

        const title = document.querySelector('title');
        const page_title = title.textContent;   
        this.renderAllCharts(page_title);    
        const observer = new MutationObserver(() => {
            console.log('Title changed to:', page_title);
            this.renderAllCharts(page_title);
        });
        observer.observe(title, { childList: true });
    }

    renderAllCharts(page_title){
        this.charts_to_render.filter(chart => chart.page_title === page_title).forEach(chart => this.renderChart(chart))
    }

    renderChart(chart) {
        const data = this.get_table_data(chart.data_table,chart.column_number);
        this.draw_chart(document.querySelector(`.${chart.container}`), chart.type, data, chart.page_title);
    }

    get_table_data(data_table, column_number) {
        const table = document.querySelector(`.${data_table}`);
        const labels = Array.from(table.querySelectorAll(`tr > td:nth-child(1) .ab-text`)).map(i => i.textContent.trim());
        const values = Array.from(table.querySelectorAll(`tr > td:nth-child(${column_number}) .ab-text`)).map(i => parseFloat(i.textContent));       
        const title = table.querySelector(`thead tr th:nth-child(${column_number})`).textContent.trim();
        return { labels, values,title };
    }

    draw_chart(container, chart_type, data) {
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
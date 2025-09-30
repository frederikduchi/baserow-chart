class BaserowChart {
    constructor() {
        const title = document.querySelector('title');       
        const observer = new MutationObserver(() => {
            console.log('Title changed to:', title);
        });
        observer.observe(title, { childList: true });
    }

    renderChart(data_table, column_number, container, chart_type, page_path) {
        const data = this.get_table_data(data_table,column_number);
        this.draw_chart(container, chart_type, data, page_path);
        

    }

    get_table_data(data_table, column_number) {
        const labels = Array.from(data_table.querySelectorAll(`tr > td:nth-child(1) .ab-text`)).map(i => i.textContent.trim());
        const values = Array.from(data_table.querySelectorAll(`tr > td:nth-child(${column_number}) .ab-text`)).map(i => parseFloat(i.textContent));       
        const title = data_table.querySelector(`thead tr th:nth-child(${column_number})`).textContent.trim();
        return { labels, values,title };
    }

    draw_chart(container, chart_type, data, title) {
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
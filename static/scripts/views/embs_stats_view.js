import {View} from "./view.js";

class EmbeddingsStatsView extends View{
    constructor($el, model, app) {
        super($el, model);
        this.app = app;
        this.build();
    }
    build(){
       this.modal = new bootstrap.Modal(document.getElementById('embs-stats'), {
            keyboard: false
        })
        this.ctx = $('#embs-stats-chart');
    }
    showStats(prop_url){
        let self = this;
        let nodes = self.model.getClosestNodes().map(n =>n.node);
        this.app.showLoader();
        $.post({
            url: prop_url,
            data: JSON.stringify({'nodes': nodes}),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
        }).always(function(data){
            self.app.hideLoader();
            if(data)
                self.createStats(JSON.parse(data['d']), data['ref']);
        },);
    }
    createStats(stats, ref){
        this.clearStats();
        let colors = Array(stats['index'].length).fill(Chart.defaults.backgroundColor);
        ref.forEach((r) =>{
            colors[stats['index'].indexOf(r[stats['name']])] = '#0b6efd';
        })
        this.currentChart = new Chart(this.ctx, {
            type: 'bar',
            data: {
                labels: stats['index'],
                datasets: [{
                    label: "Number of nodes",
                    data: stats["data"],
                    backgroundColor: colors
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                ticks: {
                    autoSkip: false
                },
                plugins: {
                    title: {
                        display: true,
                        text: "Distribution of the closest nodes in the embedding space w.r.t. "+stats['name'],
                        position: 'bottom'
                    }
                }
            }
        });
        this.modal.show();
    }
    clearStats() {
        if (!this.currentChart) return;
        this.currentChart.destroy();
    }
}

export {EmbeddingsStatsView}

import {View} from "./view.js";

const STATS_PROPS = [
// {
//     'name': 'Number of outgoing links',
//     'url': '/count_out'
// },
//     {
//         'name': 'Number of incoming links',
//         'url': '/count_in'
//     },
    {
        'name': 'Type',
        'url': '/value'
    }
]

class EmbsInfoView extends View{
    constructor($el, model, app) {
        super($el, model);
        let self = this;
        self.app = app;
        this.model.on('reset', function(){
            self.clear();
            if(self.model.isDistanceMode()){
                self.build();
            }
        });
        this.model.on('change:mode', function(){
           self.clear();
            if(self.model.isDistanceMode()){
                self.build();
            }
        });
        this.model.on('change:selected_node', function(node){
            if(self.model.isDistanceMode()){
                self.highlightNode(node.name);
            }
        });
        this.createStatsButton();
        this.addEventsListeners()
    }
    clear(){
        this.$('#distance_list').empty();
    }
    build(){
        let self = this;
        this.model.getClosestNodes().forEach((node) => {
                self.$('#distance_list').append('' +
                    '<li class="list-group-item d-flex justify-content-between align-items-center distance-list-item">' +
                    '<span class="close-embs-label">'+node.node+'</span>' +
                    '<div class="dropdown">' +
                    '<button class="btn btn-sm btn-tiny btn-primary dropdown-toggle" type="button" id="dd-embs-action'+
                    node.node+'" data-bs-toggle="dropdown" aria-expanded="false">' +
                    '</button>' +
                    '<ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dd-embs-action'+ node.node+'">' +
                    '<li><a class="dropdown-item goto-node" href="#" uri="'+node.node+'">Select node</a></li>' +
                    '<li><a class="dropdown-item show-paths" href="#" uri="'+node.node+'">Shortest path</a></li>' +
                    '</ul>' +
                    '</div>' +
                    '<span class="distance_list_distance badge bg-primary">'+node.distance.toFixed(2)+
                    '</span>' +
                    '</li>')
        });
        this.$('#distance_list .goto-node').on('click', function (e){
            e.preventDefault();
            if(e.target.attributes.uri){
                self.model.setSelectedNode(e.target.attributes.uri.value);
            }
        })
        this.$('#distance_list .show-paths').on('click', function (e){
            e.preventDefault();
            if(e.target.attributes.uri){
                self.model.showPaths(e.target.attributes.uri.value);
            }
        })
    }
    addEventsListeners() {
        let self = this;
        this.$('input').prop('disabled', false);
        this.$('#btn-cosine').on('click', function(){
            self.model.setCosineDistanceType();
        });
        this.$('#btn-euclidean').on('click', function(){
            self.model.setEuclideanDistanceType();
        });
        this.$('#nodes-number').on('change', function(){
            let n = parseInt(self.$('#nodes-number').val());
            self.updateNodesSlider(n);
            self.model.setNumberOfClosestNodes(n);
        });
        this.$('#nodes-number-slider').on('change', function(){
            let n = parseInt(self.$('#nodes-number-slider').val());
            self.updateNodesNumber(n);
            self.model.setNumberOfClosestNodes(n);
        });
    }
    createStatsButton(){
        let self = this;
        $('.dd-embs-stats').addClass('show');
        STATS_PROPS.forEach((p) => {
            $('.dd-embs-stats ul').append('<li><a class="dropdown-item" href="'+self.model.getURL()+p.url+'">'+p.name+'</a></li>');
        })
        $('.dd-embs-stats ul li a').on('click', function (e){
            e.preventDefault();
            self.app.showStatsFor(e.target.href);
        })
    }
    highlightNode(node){
        // TODO: scroll to the selected node in the list
        this.$('.close-embs-label').removeClass('highlighted');
        this.$('.close-embs-label:contains("'+node+'")').addClass('highlighted');
    }
    updateNodesSlider(n){
        this.$('#nodes-number-slider').val(n);
    }
    updateNodesNumber(n){
        this.$('#nodes-number').val(n);
    }
}

export {EmbsInfoView}

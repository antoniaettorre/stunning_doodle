import {View} from "./view.js";
import {LegendView} from "./legend_view.js";

class NodesOverviewView extends View{
    constructor($el, model) {
        super($el, model);
        this.removeEventListeners();
        this.addEventsListeners();
        this.generateLegend();
    }
    generateLegend(){
        this.nodeLegend = new LegendView($("#legend"), this.model);
    }
    addEventsListeners() {
        let self= this;
        this.$('.nodes-mode').on('change', function(){
            if(self.model.isTypesMode()){
                self.model.disableTypeMode();
            }else{
                self.model.enableTypeMode();
            }
        })
        this.$('.nodes-labels').on('change', function(){
            if(self.model.areNodesLabelsShown()){
                self.model.hideNodesLabels();
            }else{
                self.model.showNodesLabels();
            }
        })
        this.$('.nodes-literals').on('change', function(){
            if(self.model.areLiteralsShown()){
                self.model.hideLiteralsInGraph();
            }else{
                self.model.showLiteralsInGraph();
            }
        })
    }
    removeEventListeners(){
        this.$('.nodes-mode').off('change');
        this.$('nodes-labels').off('change');
        this.$('nodes-literals').off('change');
    }

}

export {NodesOverviewView}

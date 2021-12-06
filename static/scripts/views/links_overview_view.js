import {View} from "./view.js";
import {LinksLegendView} from "./links_legend.js";

class LinksOverviewView extends View{
    constructor($el, model) {
        super($el, model);
        this.active = false;
        this.removeEventListeners();
        this.addEventsListeners();
        this.generateLegend();
    }
    generateLegend(){
        this.legend = new LinksLegendView(this.$('#links-legend'), this.model);
    }
    addEventsListeners() {
        let self= this;
        this.$('.links-mode').on('change', function(){
            if(self.active){
                self.model.disableLinksMode();
            }else{
                self.model.enableLinksMode();
            }
            self.active = !self.active;
        })
    }
    removeEventListeners(){
        this.$('.links-mode').off('change');
    }

}

export {LinksOverviewView}

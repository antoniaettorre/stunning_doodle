import {View} from "./view.js";
import {LegendItemView} from "./legend_item.js";

class LegendView extends View{
    constructor($el, model) {
        super($el, model);
        this.setColorsList();
        this.build();
        let self = this;
        this.model.on('reset', function(){
            self.update();
        })
    }
    setColorsList(){
        this.nElements = {};
        let self = this;
        this.colors = this.getLegendItems();
        for(let t in this.colors){
            if (t) {
                self.nElements[t] = self.getNumberOfElements(t);
            } else {
                self.nElements['NoType'] = self.getNumberOfElements();
            }
        }
    }
    build(){
        this.legendItems = [];
        for(let k in this.colors){
            let item = this.createItemElement(k);
            this.legendItems.push(item);
            this.$el.append(item.getElement());
            item.setActiveFilter(!this.getActiveState(k));
            item.addEventsListeners();
        }
    }
    update(){
        this.clear();
        this.setColorsList();
        this.build();
    }
    getLegendItems(){
        return this.model.getNonEmptyTypes();
    }
    getActiveState(k){
        return this.model.isTypeFilterActive(k);
    }
    getNumberOfElements(t) {
        return t ? this.model.getNodesByType(t).length : this.model.getNodesByType().length;
    }
    createItemElement(k){
        return new LegendItemView(k, this.colors[k], this.nElements[k], this);
    }
    changeColor(item, value){
        this.model.setNewColorForClass(item, value);
    }
    addFilter(item){
        this.model.addTypeFilter(item);
    }
    removeFilter(item){
        this.model.removeTypeFilter(item);
    }
}

export {LegendView}

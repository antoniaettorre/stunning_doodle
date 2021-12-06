import {LegendView} from "./legend_view.js";
import {LegendItemView} from "./legend_item.js";


class LinksLegendView extends LegendView{
    getLegendItems(){
        return this.model.getNonEmptyLinkTypes();
    }
    getActiveState(k){
        return this.model.isLinkFilterActive(k);
    }
    getNumberOfElements(t) {
        return this.model.getLinksByType(t).length;
    }
    createItemElement(k){
        return new LegendItemView(k, this.colors[k], this.nElements[k], this);
    }
    changeColor(item, value){
        this.model.setNewColorForLink(item, value);
    }
    addFilter(item){
        this.model.addLinkFilter(item);
    }
    removeFilter(item){
        this.model.removeLinkFilter(item);
    }
}

export {LinksLegendView};

import {View} from "./view.js";
import {Utils} from "../utils.js";

class LegendItemView extends View{
    constructor(class_name, color, nodes, parent) {
        super();
        this.active = true;
        this.$el = $('<li class="list-group-item d-flex justify-content-between align-items-center"></li>');
        this.fullClassName = class_name;
        this.parent = parent;
        // if(class_name !== 'NoType') {
        //     var uri = new URL(class_name);
        //     this.class = uri.hash ? uri.hash.substring(1) : uri.pathname.substring(uri.pathname.lastIndexOf('/') + 1);
        // }else{
        //     this.class = class_name;
        // }
        this.class = Utils.djb2(class_name)
        this.nodesNumber = nodes;
        this.color = color;
        this.template = `
            <div>
            <input type="color" value="${this.color}" name="color_${this.class}" id="color_${this.class}">
            <label for="color_${this.class}">${this.fullClassName}<span class="">(${this.nodesNumber})</span></label> 
            </div>
            <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="switch_type_${this.class}" checked>
            </div>`;
        this.render();
    }
    addEventsListeners() {
        let self = this;
        this.$('#color_'+ this.class).on('input', function (e){
            self.parent.changeColor(self.fullClassName, this.value);
        })
        this.$('#switch_type_'+this.class).on('change', function(e){
            self.active = !self.active;
            if(self.active){
                self.parent.removeFilter(self.fullClassName);
            }else{
                self.parent.addFilter(self.fullClassName);
            }
        })
    }
    setActiveFilter(active){
        this.active = active;
        this.$(`#switch_type_${this.class}`).prop('checked', this.active);
    }
}

export {LegendItemView}

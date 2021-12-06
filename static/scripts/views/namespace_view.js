import {View} from "./view.js";

class NamespaceView extends View{
    constructor($el, model) {
        super($el, model);
        let self = this;
        this.model.on('reset', function (){
            self.updateInfo();
        })
        this.updateInfo();
    }
    updateInfo(){
        this.clear();
        let ns = this.model.getNamespaceList();
        for(const p in ns){
            this.$('.namespace-list').append('<li><strong>'+p+':</strong>&nbsp;'+ns[p]+'</li>');
        }
        this.showContent();
    }
    showContent(){
        this.$el.addClass('show-content');
    }
    clear(){
        this.$('.namespace-list li').remove();
    }

}

export {NamespaceView}

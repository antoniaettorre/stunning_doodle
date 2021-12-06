import {View} from "./view.js";
import {Utils} from "../utils.js";

class NodeInfoView extends View{
    constructor($el, model) {
        super($el, model);
        let self = this;
        this.addEventsListeners();
        this.model.on('change:selected_node', function (node){
            self.updateInfo(node);
        })
        this.model.on('reset', function (){
            self.updateInfo();
        })
    }
    updateInfo(node){
        if(!node){
            node = this.model.getSelectedNode();
        }
        this.clear();
        if(!node){
            return;
        }
        this.$('.node-name').text(node.name);
        this.updateDataTypeTriples(node);
        this.updateObjectTriples(node);
        this.showContent();
    }
    updateDataTypeTriples(node){
        let links = Utils.groupBy(this.model.getDataTypeTriplesForNode(node), 'type')
        for(let p in links){
            let tmp = '<dt class="col-6">'+p+'</dt><dd class="col-6">'
            links[p].forEach((l)=>{
                tmp = tmp + l.end + '<br/>';
            })
            tmp = tmp + '</dd>';
            this.$('.triples-list-datatype').append(tmp);
        }
    }
    updateObjectTriples(node){
        let links = Utils.groupBy(this.model.getObjectTriplesForNode(node), 'type')
        for(let p in links){
            let tmp = '<dt class="col-6">'+p+'</dt><dd class="col-6">'
            links[p].forEach((l)=>{
                tmp = tmp + '<a href="#" uri="'+l.end+'">' + l.end + '</a><br/>';
            })
            tmp = tmp + '</dd>';
            this.$('.triples-list-objects').append(tmp);
        }
        this.enableGoToNodes();
    }
    enableGoToNodes(){
        let self = this;
        this.$('.triples-list-objects a').on('click', function(e){
            e.preventDefault();
            if(e.target.attributes.uri){
                self.model.setSelectedNode(e.target.attributes.uri.value);
            }
        });
    }
    clear(){
        this.$('.node-name').text('');
        this.$('.triples-list-objects').empty();
        this.$('.triples-list-datatype').empty();
        this.$('.triples-list-objects a').off('click');
    }
    addEventsListeners() {
        let self = this;
        this.$('#set-center').on('click', function(e){
            e.preventDefault();
            self.model.setNewCenter();
        })
        this.$('#expand-node').on('click', function(e){
            e.preventDefault();
            self.model.expandNode();
        })
        this.$('#collapse-node').on('click', function(e){
            e.preventDefault();
            self.model.collapseNode();
        })
        this.$('#hide-node').on('click', function(e){
            e.preventDefault();
            self.model.hideNode();
        })
    }
    removeEventListeners(){
        this.$('#set-center').off('click');
        this.$('#expand-node').off('click');
        this.$('#collapse-node').off('click');
        this.$('#hide-node').off('click');
    }
    enableEmbsDistance(){
        this.$('#show-embs').removeClass('disabled')
        let self = this;
        this.$('#show-embs').on('click', function(e){
            e.preventDefault();
            self.model.enableDistanceMode();
        })
    }
    showContent(){
        this.$el.addClass('show-content');
    }

}

export {NodeInfoView}

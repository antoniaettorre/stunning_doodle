
class Model {
    constructor(id, url) {
        this.id = id;
        this.url = url ? url + '/' + id : '';
        this.events = {
            'destroy': [],
            'change':[],
            'reset':[]
        };
    }
    getID(){
        return this.id;
    }
    getURL(){
        return this.url;
    }
    fetch(params={}, url){
        let self = this;
        let use_url = url || this.url
        if(!use_url){
            return;
        }
        self.trigger('start:request');
        $.get(use_url, params, function(data){
            // TODO clear the already set props
            for(const prop in data){
                self.set(prop, data[prop], true);
            }
            self.events['reset'].forEach((f) => f());
        }).fail(function(){
            self.trigger('fail:request');
        }).always(function(){
            self.trigger('end:request');
        })

    }
    set(attr, value, silent=false){
        let old_value = Object.assign({}, this[attr]);
        this[attr] = value;
        if(silent){
            return;
        }
        this.events['change:'+attr].forEach((f) => f(value, old_value));
        this.events['change'].forEach((f) => f());
    }
    get(attr){
        return this[attr];
    }
    destroy(){
        if(!this.url || !this.id){
            return;
        }
        // TODO implement delete request
        this.events['destroy'].forEach((f) => f());
    }
    update(params, url){
        let self = this;
        let use_url = url || this.url
        if(!use_url){
            return;
        }
        self.trigger('start:request');
        $.get(use_url, params, function(data){
            // TODO controlla queste porcate
            for(const prop in data){
                if(typeof (data[prop]) === 'object'){
                    if(Array.isArray(data[prop])){
                        if(self[prop]){
                            data[prop] = self[prop].concat(data[prop].filter((item) => {
                                return !self[prop].find((n) => {
                                    return n.id === item.id;
                                })
                            }))
                        }
                    }else{
                        if(self[prop]){
                            data[prop] = Object.assign(data[prop], self[prop]);
                        }
                    }
                }
                self.set(prop, data[prop], true);
            }
            self.events['reset'].forEach((f) => f());
        }).fail(function() {
            self.trigger('fail:request');
        }).always(function() {
                self.trigger('end:request');
        });
    }
    on(event, callback){
        if(!this.events[event]){
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    off(event){
        if(this.events[event]){
            this.events[event] = [];
        }
    }
    trigger(event, new_value, old_value){
        if(this.events.hasOwnProperty(event)){
            this.events[event].forEach((f) => f(new_value, old_value));
        }
    }

}

export {Model};

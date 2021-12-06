class View{
    constructor($el, model) {
        this.model = model || null;
        this.$el = $el || null;
        this.template = null;
        // this.addEventsListeners();
    }
    render(){
        if(this.$el && this.template)
            this.$el.html(this.template);
    }
    hide(){
        this.$el.hide();
    }
    show(){
        this.$el.show();
    }
    getElement(){
        return this.$el;
    }
    setModel(model){
        this.model = model;
    }
    destroy(){
        if(this.$el){
            this.$el.empty();
            this.$el = null;
        }
        this.model = null;

    }
    clear(){
        if(this.$el){
            this.$el.empty();
        }
    }
    addEventsListeners(){

    }
    $(selector){
        return this.$el.find(selector);
    }

}
export {View};

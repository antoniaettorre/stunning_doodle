import {View} from "./view.js";

class MessageManagerView extends View{
    constructor($el) {
        super($el, null);
        this.createModal();
    }
    createModal(){
        this.modal = new bootstrap.Modal(document.getElementById('message-manager'));
        let self = this;
        this.$('.message-close').on('click', function(){
            self.$el.removeClass('confirmation');
            self.$el.removeClass('warning');
            self.$el.removeClass('error');
            self.$('.message-confirm').off('click');
        })
    }
    showConfirmationMessage(msg, callback){
        let self = this;
        this.$el.addClass('confirmation');
        this.$('.modal-title').text('Confirmation');
        this.$('.modal-body p').html(msg);
        this.$('.modal-footer .message-close').text('Cancel');
        this.$('.message-confirm').one('click', function(){
            callback();
            self.modal.hide();
        })
        this.modal.show();
    }
    showWarningMessage(msg){
        this.$el.addClass('warning');
        this.$('.modal-title').text('Warning!');
        this.$('.modal-body p').html(msg);
        this.modal.show();
    }
    showErrorMessage(msg){
        this.$el.addClass('error');
        this.$('.modal-title').text('Error!');
        this.$('.modal-body p').html(msg);
        this.modal.show();

    }
}
export {MessageManagerView};

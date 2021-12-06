import {View} from "./view.js";

class EmbeddingsView extends View{
    constructor($el, model, app) {
        super($el, model);
        this.app = app;
       // this.addEventsListeners();
    }
    addEventsListeners(){
        let self = this;
        this.$('form').on('submit', function(e){
            e.preventDefault();
            var fd = new FormData();
            fd.append('graph_id', self.model.getID());
            var files_embs = self.$('#embs-file')[0].files;

            if(files_embs.length > 0){
                fd.append('file_emb',files_embs[0]);
                self.app.showLoader();
                $.ajax({
                    url: '/upload/embs',
                    type: 'post',
                    data: fd,
                    contentType: false,
                    processData: false,
                }).always(function(response){
                    self.app.hideLoader();
                    if(response.status == 200){
                        // self.app.showWarningMessage("Embeddings uploaded!");
                        self.app.setLoadedEmbs(files_embs[0].name);
                    }
                },);
            }else{
                alert("Please select the embeddings file.");
            }
        })
    }
    enableUpload(){
        this.$('.btn.btn-primary').removeClass('disabled');
        this.addEventsListeners();
    }

}

export {EmbeddingsView}

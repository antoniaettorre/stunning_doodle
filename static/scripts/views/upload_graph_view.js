import {View} from "./view.js";

class UploadGraphView extends View{
    constructor($el, model, app) {
        super($el, model);
        this.app = app;
        this.addEventsListeners();
    }
    addEventsListeners() {
        let self = this;
        this.$('#upload-graph-form').on('submit', function (e) {
            e.preventDefault();
            if(self.app.isGraphInitialized()){
                self.app.showErrorMessage("A file is already loaded. If you want to change the graph, please refresh the page.");
                return;
            }
            var fd = new FormData();
            var files = self.$('#graph-file')[0].files;

            if (files.length > 0) {
                fd.append('file', files[0]);
                self.app.showLoader();
                $.ajax({
                    url: '/upload/graph',
                    type: 'post',
                    data: fd,
                    contentType: false,
                    processData: false,
                    success: function (response) {
                        self.app.hideLoader();
                        self.app.initializeGraph(response, files[0].name);
                    },
                });
            } else {
                alert("Please select a file.");
            }
        })
        this.$('#change-center-form').on('submit', function (e) {
            e.preventDefault();
            let center = self.$('.graph-center input:text').val();
            self.model.fetch({'center': center});
        })
    }
    setModel(model) {
        super.setModel(model);
        let self = this;
        this.model.on('reset', function(){
            self.setCenterSelection()
        });
        if(this.model.center){
            this.app.showWarningMessage("" +
                "The uploaded graph is too large to be displayed at once. Therefore only one randomly picked node " +
                "is visualized along with its close neighborhood. You can change the visualized node through the option " +
                "<b>'Set new center'</b> in the <b>'Upload RDF Graph'</b> section or navigate the graph through the actions in " +
                "the section <b>'Node in focus'</b>.");
        }
        this.setCenterSelection();
    }
    setCenterSelection(){
        if(this.model.center){
            this.$('.graph-center input:text').val(this.model.center);
            this.$('.graph-center').show();
        }
    }

}

export {UploadGraphView}

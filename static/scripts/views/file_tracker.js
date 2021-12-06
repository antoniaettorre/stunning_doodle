import {View} from "./view.js";

class FileTrackerView extends View{
    constructor($el) {
        super($el);
        this.fileToast = new bootstrap.Toast(this.$('.files-name')[0]);
    }
    showLoadedGraphFile(filename){
        this.$('.files-name').removeClass('hidden');
        this.$('p.graph-file span').text(filename);
        this.fileToast.show();
    }
    showLoadedEmbsFile(filename){
        this.$('p.embs-file span').text(filename);
        this.$('p.embs-file').removeClass('hidden');
    }
}

export {FileTrackerView}

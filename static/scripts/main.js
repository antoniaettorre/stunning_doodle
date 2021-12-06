import {GraphModel} from "./models/graph_model.js";
import {GraphView} from "./views/graph_view.js";
import {NodesOverviewView} from "./views/nodes_overview_view.js";
import {UploadGraphView} from "./views/upload_graph_view.js";
import {EmbeddingsView} from "./views/embs_view.js";
import {NodeInfoView} from "./views/node_info_view.js";
import {EmbsInfoView} from "./views/embs_info_view.js";
import {NamespaceView} from "./views/namespace_view.js";
import {LinksOverviewView} from "./views/links_overview_view.js";
import {EmbeddingsStatsView} from "./views/embs_stats_view.js";
import {MessageManagerView} from "./views/message_manager_view.js";
import {LoaderView} from "./views/loader_view.js";
import {FileTrackerView} from "./views/file_tracker.js";

class AppController {
    async start() {
        this.loadedEmbs = false;
        this.initAppView();
    }
    initAppView(){
        this.uploadGraph = new UploadGraphView($('#upload-graph'), null, this);
        this.embsView = new EmbeddingsView($('#upload-embs'), null, this);
        this.messageManagerView = new MessageManagerView($('#message-manager'));
        this.loader = new LoaderView($('.loader'));
        this.fileTracker = new FileTrackerView($('.toast-container'));
    }
    initializeGraph(data, filename){
        if(this.isGraphInitialized()){
            return;
        }
        // window.history.pushState("", "", '/'+data.id);
        this.graphModel = new GraphModel(data.id, '/graph', data.namespaces, data.nodes, data.links, data.center, this);
        this.addRequestEventListeners();
        this.graphView = new GraphView($('.svg-container svg'), this.graphModel);
        this.uploadGraph.setModel(this.graphModel);
        this.embsView.setModel(this.graphModel);
        this.embsView.enableUpload();
        this.graphView.update();
        this.nodesOverviewView = new NodesOverviewView($('#nodes-overview .accordion-body'), this.graphModel, this);
        this.linksOverviewView = new LinksOverviewView($('#links-overview .accordion-body'), this.graphModel, this);
        this.namespaceView = new NamespaceView($('#namespace-info .accordion-body'), this.graphModel, this)
        this.nodeInfoView = new NodeInfoView($('#node-info .accordion-body'), this.graphModel, this);
        this.embsInfoView = new EmbsInfoView($('#embs-info .accordion-body'), this.graphModel, this);
        this.fileTracker.showLoadedGraphFile(filename);
    }
    isGraphInitialized(){
        return (this.graphView || this.graphModel);
    }
    setLoadedEmbs(filename){
        this.loadedEmbs = true;
        this.fileTracker.showLoadedEmbsFile(filename);
        if(this.nodeInfoView) {
            this.nodeInfoView.enableEmbsDistance();
            this.embsStatsView = new EmbeddingsStatsView(null, this.graphModel, this);
        }
    }
    showConfirmationMessage(msg, callback){
        this.messageManagerView.showConfirmationMessage(msg, callback);
    }
    showWarningMessage(msg){
        this.messageManagerView.showWarningMessage(msg);
    }
    showErrorMessage(msg){
        this.messageManagerView.showErrorMessage(msg);
    }
    showLoader(){
        this.loader.show();
    }
    hideLoader(){
        this.loader.hide();
    }
    addRequestEventListeners(){
        let self = this;
        this.graphModel.on('start:request', function(){
            self.showLoader();
        });
        this.graphModel.on('end:request', function(){
            self.hideLoader();
        });
        this.graphModel.on('fail:request', function(){
            self.showErrorMessage("The required information about one or more nodes is missing.");
        });
    }

    showStatsFor(prop_url) {
        if (!this.graphModel.isDistanceMode()) return;
        this.embsStatsView.showStats(prop_url);
    }

}


window.onload = async () => {
    let app = new AppController();
    await app.start();
    window.app = app;
};

import {Model} from './model.js';
import {Utils} from '../utils.js';

const MODE = {};
MODE.NONE = 0;
MODE.TYPES = 1;
MODE.LINKS = 2;
MODE.DISTANCE = 3;

const DISTANCE = {};
DISTANCE.EUCLIDEAN = 'EUCLIDEAN';
DISTANCE.COSINE = 'COSINE';

const COLORS = {};
COLORS.EUCLIDEAN = ['#3f007d', '#54278f', '#6a51a3', '#807dba', '#9e9ac8', '#bcbddc', '#dadaeb', '#efedf5', '#fcfbfd'];
COLORS.COSINE = ['#00441b', '#006d2c', '#238b45', '#41ab5d', '#74c476', '#a1d99b', '#c7e9c0', '#e5f5e0', '#f7fcf5'];

class GraphModel extends Model{
    constructor(id, url, namespaces, nodes, links, center, app) {
        super(id, url);
        this.app = app;
        this.namespaces = namespaces;
        this.nodes = nodes;
        this.links = links;
        this.center = center;
        this.types = {};
        this.linkTypes = {};
        this.selected_node = null;
        this.color = d3.scaleLinear();
        this.typeFilters = [];
        this.linkFilters = [];
        this.showLabels = false;
        this.showLiterals = false;
        this.mode = MODE.NONE;
        this.distanceType = DISTANCE.EUCLIDEAN;
        this.nClosest = 100;
        this.setGraphBasicProperties();
        let self = this;
        this.on('reset', function (){
            self.setGraphBasicProperties();
            if(self.isDistanceMode()){
                self.checkNodesNames();
              //  self.setColorProperties();
            }
        })
    }
    getDisplayedEntityNodes(){
        return this.filterNodesByType().filter((n) => {
            return n.types.length == 0 || !this.isNodeLiteral(n);
        });
    }
    getDisplayedNodes(){
        return this.filterNodesByType();
    }
    getNodesWithLabels(){
        let nodes;
        if(this.areNodesLabelsShown()){
            nodes = this.getDisplayedNodes();
        }else{
            nodes = this.getDisplayedLiteralNodes();
        }
        return nodes.filter((n) => n.hasOwnProperty('label'));
    }
    getDisplayedLinks(){
        let nodes = [];
        let links = this.filterLinksByType();
        this.filterNodesByType().forEach((node) =>{
            nodes.push(node.name);
        });
        return links.filter((l) => {
            return nodes.includes(l.start) && nodes.includes(l.end);
        });
    }
    getDisplayedLiteralNodes(){
        return this.areLiteralsShown() ? this.getNodesByType('Literal') : [];
    }
    setGraphBasicProperties(){
        this.setNodeProperties();
        this.setLinksProperties();
        this.setTypesProperties();
        this.setLinksTypesProperties();
        this.setNamespacesProperties();
    }
    setNodeProperties(){
        this.nodes.forEach(function(node){
            node.escapedName = escape(node.name);
        })
    }
    setLinksProperties(){
        this.links.forEach(function (l) {
            if(l.name)
                return;
            l.start = l.source;
            l.end = l.target;
            l.name = escape(l.id);
        });
    }
    setTypesProperties(){
        let types_list = this.nodes.map(item => item.types[0])
            .filter((value, index, self) => self.indexOf(value) === index);
        types_list.forEach((type) => {
            if(type == 'Literal') return;
            if (this.types[type]) return;
            if (!type && this.types['NoType']) return;
            this.types[type || 'NoType'] = type ? Utils.hashStringToColor(type): '#000000';
        });
    }
    setLinksTypesProperties(){
        let types_list = this.links.map(item => item.type)
            .filter((value, index, self) => self.indexOf(value) === index);
        types_list.forEach((type) => {
            if (this.linkTypes[type]) return;
            this.linkTypes[type] = Utils.hashStringToColor(type);
        });
    }
    setNamespacesProperties(){

    }
    setSelectedNode(name){
        this.set('selected_node', this.nodes.find((node) => {
            return node.name === name;
        }))
    }
    getSelectedNode(){
        return this.selected_node
    }
    getLinkColor(link){
        if(this.isLinksMode()){
            return this.linkTypes[link];
        }
        return 'gray';
    }
    getNodeColor(node){
        if(this.isDistanceMode()){
            let clos_node = this.closest.find((n) => {
                return n.node === node.name;
            })
            if(clos_node)
                return this.floatToColor(clos_node['distance']/this.closest[this.closest.length - 1]['distance'], COLORS[this.getCurrentDistanceType()])
        }
        if(!this.isTypesMode() || node.types.length === 0 || this.isNodeLiteral(node)) return this.types['NoType'];
        return this.types[node.types[0]];

    }
    getTypes(){
        return this.types;
    }
    getNonEmptyTypes(){
        let types = {}
        for(let t in this.types){
            if(this.getNodesByType(t).length > 0)
                types[t] = this.types[t];
        }
        return types;
    }
    getNonEmptyLinkTypes(){
        let types = {}
        for(let t in this.linkTypes){
            if(this.getLinksByType(t).length > 0)
                types[t] = this.linkTypes[t];
        }
        return types;
    }
    isNodeLiteral(node){
        return node.types.includes('Literal');
    }
    getNodesByType(type){
        if(!type || type == 'NoType'){
            return this.nodes.filter(n => n.types.length === 0);
        }else{
            return this.nodes.filter(n => n.types.includes(type))
        }
    }
    getDisplayedNodesByType(type){
        if(!type || type == 'NoType'){
            return this.getDisplayedNodes().filter(n => n.types.length === 0);
        }else{
            return this.getDisplayedNodes().filter(n => n.types.includes(type))
        }
    }
    enableDistanceMode(){
        this.getDistanceData();
        this.enableMode(MODE.DISTANCE, true);
    }
    enableTypeMode(){
        this.enableMode(MODE.TYPES);
    }
    enableLinksMode(){
        this.enableMode(MODE.LINKS);
    }
    disableTypeMode(){
        this.disableMode(MODE.TYPES);
    }
    disableLinksMode(){
        this.disableMode(MODE.LINKS);
    }
    disableDistanceMode(silent){
        // TODO: check if worth to reset distances array
        this.disableMode(MODE.DISTANCE, silent);
    }
    enableMode(mode, silent=false){
        if(this.isMode(mode)) return;
        this.set('mode', this.mode + Math.pow(2,mode - 1), silent);
    }
    disableMode(mode, silent=false){
        if(!this.isMode(mode)) return;
        this.set('mode', this.mode - Math.pow(2,mode - 1), silent);
    }
    areLiteralsShown(){
        return this.showLiterals;
    }
    showLiteralsInGraph(){
        this.set('showLiterals', true);
    }
    hideLiteralsInGraph(){
        this.set('showLiterals', false);
    }
    areNodesLabelsShown(){
        return this.showLabels;
    }
    showNodesLabels(){
        this.set('showLabels', true);
    }
    hideNodesLabels(){
        this.set('showLabels', false);
    }
    getDistanceData(){
        let nodeIRI = this.getNodeFullIRI(this.getSelectedNode()['name'])
        this.fetch({node: nodeIRI, type: this.getCurrentDistanceType(), limit: this.getNumberOfClosestNodes()}, this.getURL() + '/distance');
    }
    isDistanceMode(){
        return this.isMode(MODE.DISTANCE)
    }
    isTypesMode(){
        return this.isMode(MODE.TYPES)
    }
    isLinksMode(){
        return this.isMode(MODE.LINKS)
    }
    isMode(mode){
        return ((this.mode & (1 << (mode- 1))) > 0);
    }
    getNumberOfClosestNodes(){
        return this.nClosest;
    }
    setNumberOfClosestNodes(n){
        this.nClosest = n;
        if(this.isDistanceMode()){
            this.setSelectedNode(this.getClosestNodes()[0].node)
            this.enableDistanceMode();
        }
    }
    getCurrentDistanceType(){
        return this.distanceType;
    }
    setEuclideanDistanceType(){
        if(this.isEuclideanDistance()) return;
        this.distanceType = DISTANCE.EUCLIDEAN;
        if(this.isDistanceMode()){
            this.setSelectedNode(this.getClosestNodes()[0].node)
            this.enableDistanceMode();
        }
    }
    setCosineDistanceType(){
        if (this.isCosineDistance()) return;
        this.distanceType = DISTANCE.COSINE;
        if(this.isDistanceMode()){
            this.setSelectedNode(this.getClosestNodes()[0].node)
            this.enableDistanceMode();
        }
    }
    isEuclideanDistance(){
        return this.isDistanceMode() && this.getCurrentDistanceType() == DISTANCE.EUCLIDEAN;
    }
    isCosineDistance(){
        return this.isDistanceMode() && this.getCurrentDistanceType() == DISTANCE.COSINE;
    }
    setColorProperties(){
        if(!this.closest) return;
        this.color.domain([0, this.closest[this.closest.length - 1]['distance']]);
    }
    floatToColor(valueOnScale, colors){
        // return this.color
        //     .range([colors[0], colors[colors.length-1]])
        //     .interpolate(d3.interpolateRgb)(valueOnScale);
        return d3.piecewise(d3.interpolateRgb.gamma(2.2), colors)(valueOnScale)
    }
    setNewCenter(){
        if(this.isDistanceMode()){
            let self = this;
            this.app.showConfirmationMessage(
                'You are currently visualizing the distances between embeddings. ' +
                'If you center the graph in one node, only this node and its close neighborhood will be shown. ' +
                'Therefore, you will exit the embeddings visualization mode. Do you want to continue?', function(){
                    // Disabling distance mode with silence because the update of graph and lateral bar will be
                    // triggered after the fetch, so no need to do it twice
                    self.disableDistanceMode(true);
                    self.fetch({center: self.selected_node['name']})
                })
        }else{
            this.fetch({center: this.selected_node['name']});
        }
    }
    expandNode(){
        this.update({center: this.selected_node['name']});
    }
    collapseNode(){
        let nodes = this.getNodesToCollapse(this.selected_node['name']);
        this.removeNodes(nodes);
    }
    hideNode(){
        if(this.isDistanceMode() && this.isNodeAmongClosest(this.selected_node['name'])){
                this.app.showErrorMessage("You can't hide a node that is close in the embedding space, but you can still collapse it.");
        }else{
            let nodes = this.getNodesToCollapse(this.selected_node['name']);
            nodes.push(this.selected_node['name']);
            this.removeNodes(nodes);
        }
    }
    setNewColorForClass(className, color){
        this.types[className] = color;
        this.trigger('change:types');
    }
    setNewColorForLink(linkType, color){
        this.linkTypes[linkType] = color;
        this.trigger('change:links');
    }
    removeTypeFilter(type){
        const i = this.typeFilters.indexOf(type);
        if(i == -1){
            return;
        }
        this.typeFilters.splice(i, 1);
        this.trigger('change:typeFilters');
    }
    addTypeFilter(type){
        if(this.typeFilters.includes(type)){
            return;
        }
        this.typeFilters.push(type);
        this.trigger('change:typeFilters');
    }
    addLinkFilter(link){
        if(this.linkFilters.includes(link)){
            return;
        }
        this.linkFilters.push(link);
        this.trigger('change:linkFilters');
    }
    removeLinkFilter(link){
        const i = this.linkFilters.indexOf(link);
        if(i == -1){
            return;
        }
        this.linkFilters.splice(i, 1);
        this.trigger('change:linkFilters');
    }
    filterNodesByType(){
        return this.nodes.filter((node) => {
            let filter = false;
            if(node.types.length === 0){
                return !this.typeFilters.includes('NoType');
            }
            if(this.isNodeLiteral(node)){
                return this.areLiteralsShown();
            }
            node.types.forEach((type) => {
                if(this.typeFilters.includes(type)){
                    filter = true;
                }
            })
            return !filter;
        });
    }
    filterLinksByType(){
        return this.links.filter((link) => {
            return !this.linkFilters.includes(link['type']);
        });
    }
    isTypeFilterActive(type){
        return this.typeFilters.includes(type);
    }
    isLinkFilterActive(link){
        return this.linkFilters.includes(link);
    }
    getClosestNodes(){
        if(!this.isDistanceMode()) return [];
        return this.closest;
    }
    isNodeAmongClosest(node){
        return !!this.getClosestNodes().find((n) => {
            return n.node == node;
        })
    }
    getNodesToCollapse(node){
        let nodes = this.getDependingNodes(node)
        if(this.isDistanceMode()){
            let keep = [];
            this.getClosestNodes().forEach((n)=>{
                keep.push(n.node);
            })
            nodes.filter((n) => {
                return !keep.includes(n);
            })
        }
        return nodes;
    }
    getSubsequentLinks(node){
        let links = [];
        let nodes_list = [node];
        let new_nodes = []
        while (nodes_list.length > 0){
            this.links.forEach((l) => {
                if (nodes_list.includes(l.start)){
                    links.push(l);
                    if (!new_nodes.includes(l.end)){
                        new_nodes.push(l.end);
                    }
                }
            })
            nodes_list = [...new_nodes];
            new_nodes = [];
        }
        return links;
    }
    getAntecedentLinks(node){
        let links = [];
        let nodes_list = [node];
        let new_nodes = []
        while (nodes_list.length > 0){
            this.links.forEach((l) => {
                if (nodes_list.includes(l.end)){
                    links.push(l);
                    if (!new_nodes.includes(l.start)){
                        new_nodes.push(l.start);
                    }
                }
            })
            nodes_list = [...new_nodes];
            new_nodes = [];
        }
        return links;
    }
    getSubsequentNodes(node){
        let links = this.getSubsequentLinks(node)
        let nodes = [];
        links.forEach((l) => {
            if(!nodes.includes(l.end))
                nodes.push(l.end)
        })
        return nodes;
    }
    getAntecedentNodes(node){
        let links = this.getAntecedentLinks(node)
        let nodes = [];
        links.forEach((l) => {
            if(!nodes.includes(l.start))
                nodes.push(l.start)
        })
        return nodes;
    }
    getDependingSubsequentNodes(node){
        let nodes = this.getSubsequentNodes(node);
        let links = this.getSubsequentLinks(node);
        let keep = [];
        this.links.forEach((l) => {
            if (!links.includes(l)){
                keep.push(l.end);
            }
        });
        return nodes.filter((n) => {
           return !keep.includes(n);
        })
    }
    getDependingAntecedentNodes(node){
        let nodes = this.getAntecedentNodes(node);
        let links = this.getAntecedentLinks(node);
        let keep = [];
        this.links.forEach((l) => {
            if (!links.includes(l)){
                keep.push(l.start);
            }
        });
        return nodes.filter((n) => {
            return !keep.includes(n);
        })
    }
    getDependingNodes(node){
        return [...this.getDependingSubsequentNodes(node), ...this.getDependingAntecedentNodes(node)]
    }
    removeNodes(nodes){
        this.nodes = this.nodes.filter((n) => {
            return !nodes.includes(n.name);
        })
        this.links = this.links.filter((l) => {
            return !nodes.includes(l.start) && !nodes.includes(l.end);
        })
        this.trigger('reset')
    }
    getNamespaceList(){
        return this.get('namespaces');
    }
    getNodeFullIRI(node){
        let ns = this.getNamespaceList();
        for(const p in ns){
            node = node.replace(p + ':', ns[p]);
        }
        return node;
    }
    getNodeShortIRI(node){
        let ns = this.getNamespaceList();
        for(const p in ns){
            node = node.replace(ns[p], p + ':');
        }
        return node;
    }
    checkNodesNames(){
        this.nodes.forEach(n => {
            n.name = this.getNodeShortIRI(n.name)
        })
        if(this.closest){
            this.closest.forEach(n => {
                n.node = this.getNodeShortIRI(n.node)
            })
        }
    }
    getLinksByType(type){
        return this.links.filter(l => l.type === type);
    }
    showPaths(end){
        let source = this.getClosestNodes()[0].node;
        this.getPathsBetweenNode(source, end);
    }
    getPathsBetweenNode(start, end){
        this.update({start: start, end: end}, this.getURL() + '/paths');
    }
    getLinksFromNode(node){
        return this.links.filter(l => l.start === node.name);
    }
    getLinksToNode(node){
        return this.links.filter(l => l.end === node.name);
    }
    getObjectTriplesForNode(node){
        let triples = this.getLinksFromNode(node)
        return triples.filter((t) => {
            let target = this.nodes.find((n) => {
                return n.name == t.end;
            });
            return !target.types.includes('Literal');
        });
    }
    getDataTypeTriplesForNode(node){
        let triples = this.getLinksFromNode(node)
        let keep = [];
        triples.forEach((t) => {
            let target = this.nodes.find((n) => {
                return n.name == t.end;
            });
            if (target.types.includes('Literal')){
                keep.push({
                    'start': t['start'],
                    'type': t['type'],
                    'end': target['label']
                })
            }
        });
        return keep;
    }

}

export {GraphModel}

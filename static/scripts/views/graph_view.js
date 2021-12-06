import {View} from "./view.js";
import {Utils} from '../utils.js';

class GraphView extends View{
    constructor($el, model) {
        super($el, model);
        this.width = window.innerWidth;
        this.height = window.innerHeight - 10;
        this.generateStructure()
        this.markerList = [];
        let self = this;
        this.model.on('reset', function(){
            self.update();
        });
        this.model.on('change:selected_node', function(new_val, old_val){
            self.updateSingleNodeView(old_val);
            let d = self.model.getSelectedNode();
            self.updateSingleNodeView(d);
        });
        this.model.on('change:mode', function(){
            self.update();
        })
        this.model.on('change:types', function(){
            self.updateNodes();
        });
        this.model.on('change:links', function(){
            self.updateLinks();
        })
        this.model.on('change:typeFilters', function(){
            self.update();
        });
        this.model.on('change:linkFilters', function(){
            self.update();
        });
        this.model.on('change:showLabels', function(){
            self.update();
        })
        this.model.on('change:showLiterals', function(){
            self.update();
        })
    }
    generateStructure() {
        this.svg = d3.select("svg").attr("width", this.width).attr("height", this.height);

        this.markers = this.svg.append('defs').selectAll('marker');
        //add encompassing group for the zoom
        this.g = this.svg.append("g")
            .attr("class", "everything");

        this.link = this.g.append("g").selectAll(".link");
        this.node = this.g.append("g").selectAll(".node");
        this.rects = this.g.append("g").selectAll(".lit");
        this.label = this.g.append("g").selectAll(".label");
    }
    update() {
        let newNode = this.updateNodes();
        this.updateLinks();
        this.updateLabels();
        let newRect = this.updateRects();
        this.addEventsListeners();
        this.addAdvancedBehaviour(newNode, newRect, this.width, this.height);
    }
    updateNodes(){
        //	UPDATE
        this.node = this.node.data(this.model.getDisplayedEntityNodes(), function (d) {
            return d.name;
        });
        this.node.each((d) => {
            this.updateSingleNodeView(d);
        })
        //	EXIT
        this.node.exit().remove();
        //	ENTER
        var newNode = this.node.enter().append("circle")
            .attr("class", "node")
            .style("stroke-dasharray",  "3,0")
            .style("stroke", "black")
            .style("stroke-width", 2)
            .attr("r", (d) => {
                return this.getNodeSize(d);
            })
            .attr("fill", (d) => {
                return this.model.getNodeColor(d);
            })
            .attr("name", function (d) {
                return d.escapedName;
            });

        newNode.append("title").text(d  => {
            return d.name;
        });

        //	ENTER + UPDATE
        this.node = this.node.merge(newNode);
        return this.node;
    }
    updateRects(){
        //	UPDATE
        this.rects = this.rects.data(this.model.getDisplayedLiteralNodes(), function (d) {
            return d.name;
        });
        this.rects.each((d) => {
             this.updateSingleRectView(d);
        })
        //	EXIT
        this.rects.exit().remove();
        //	ENTER
        var newRect = this.rects.enter().append("rect")
            .attr("class", "lit")
            .attr('width', (d) => {
                return this.getNodeSize(d);
            })
            .attr('height', 20)
            .style("stroke-dasharray",  "3,0")
            .style("stroke", "black")
            .style("stroke-width", 2)
            .attr("fill", (d) => {
                let nodeColor = this.model.getNodeColor(d);
                return Utils.contrastColor(nodeColor);
            })
            .attr("name", function (d) {
                return d.escapedName;
            });

        newRect.append("title").text(d  => {
            return d.name;
        });

        //	ENTER + UPDATE
        this.rects = this.rects.merge(newRect);
        return this.rects;
    }
    updateLinks(){
        this.updateMarkers();
        this.link = this.link.data(this.model.getDisplayedLinks(), function (d) {
            return d.name;
        });
        this.link.each((d) => {
            this.updateSingleLinkView(d);
        })
        //	EXIT
        this.link.exit().remove();
        //	ENTER
        var newLink = this.link.enter().append("line")
            .attr("stroke-width", 1)
            .style("stroke", (d) => {
                return this.model.getLinkColor(d.type);
            })
            .attr("class", "link")
            .attr("source", d => d.start)
            .attr("target", d => d.end)
            .attr('marker-end', d => "url(#end-"+d.type+")")
            .style("pointer-events", "none").
            attr("name", function (d) {
                return d.name
            });
        newLink.append("title").text(d  => {
            return d.type;
        });
        //	ENTER + UPDATE
        this.link = this.link.merge(newLink);
    }
    updateMarkers(){
        //	UPDATE
        this.setMarkers();
        this.markers = this.markers.data(this.markerList);
        this.markers.each((d) => {
            this.updateSingleMarkerView(d);
        })
        //	EXIT
        this.markers.exit().remove();
        //	ENTER
        var newMarker = this.markers.enter().append('marker')
            .attr('id', (d) => { return 'end-'+d})
            .attr('predicate', (d) => { return d})
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 15)
            .attr("refY", 0)
            .attr("markerWidth", 4)
            .attr("markerHeight", 4)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr('fill', (d) => { return this.model.getLinkColor(d)})
            .style('stroke', 'none');

        //	ENTER + UPDATE
        this.markers = this.markers.merge(newMarker);
        return this.markers;
    }
    updateLabels(){
        this.label = this.label.data(this.model.getNodesWithLabels(), function (d) {
            return d.name;
        });
        //	EXIT
        this.label.exit().remove();
        //  ENTER
        var newLabel = this.label.enter().append("text")
            .attr("dy", "0.35em")
            .attr("name", d => d.escapedName)
            .attr("fill", () => {
                return '#000000'
            }).attr("stroke-width", 0.3)
            .style("stroke", '#FFFFFF')
            .text(function (d) {
                return d.label;
            });
        newLabel.attr("dx", (d) => {
            return this.getNodeLabelPosition(d);
        })

        //	ENTER + UPDATE
        this.label = this.label.merge(newLabel);
    }
    addAdvancedBehaviour(newNode, newRect, width, height) {
        let self = this;
        newNode.call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        );
        newRect.call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        );


        //	force simulation initialization
        var simulation = d3.forceSimulation()
            .force("link", d3.forceLink().distance(100)
                .id(function (d) {
                    return d.name;
                }))
            .force("charge", d3.forceManyBody()
                .strength(function () {
                    return -20;
                }))
            .force("center", d3.forceCenter(width / 2, height / 2));

        //	update simulation nodes, links, and alpha
        simulation
            .nodes(this.model.getDisplayedNodes())
            //	tick event handler with bounded box
            .on("tick", () => {
                this.node
                    // .attr("cx", function(d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
                    // .attr("cy", function(d) { return d.y = Math.max(radius, Math.min(height - radius, d.y)); });
                    .attr("cx", function (d) {
                        return d.x;
                    })
                    .attr("cy", function (d) {
                        return d.y;
                    });

                this.link
                    .attr("x1", function (d) {
                        return d.source.x;
                    })
                    .attr("y1", function (d) {
                        return d.source.y;
                    })
                    .attr("x2", function (d) {
                        return d.target.x;
                    })
                    .attr("y2", function (d) {
                        return d.target.y;
                    });
                this.label
                    .attr("x", function (d) {
                        return d.x;
                    })
                    .attr("y", function (d) {
                        return d.y;
                    });

                this.rects
                    .attr("x", function (d) {
                        return d.x - self.getNodeSize(d)/2;
                    })
                    .attr("y", function (d) {
                        return d.y - 10;
                    });

            });

        simulation.force("link")
            .links(this.model.getDisplayedLinks());

        simulation.alpha(1).alphaTarget(0).restart();

        //add zoom capabilities
        var zoom_handler = d3.zoom()
            .on("zoom", (event) => this.g.attr("transform", event.transform));

        zoom_handler(this.svg);

        //	drag event handlers
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(1).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event,d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }
    addEventsListeners() {
        let self = this;
        d3.selectAll("circle.node").on("click",  (event, node) => {
            event.preventDefault();
            self.model.setSelectedNode(node.name);
        });
    }
    updateSingleNodeView(node){
        if(!node) return;
        d3.selectAll("circle.node[name='"+node.escapedName+"']").attr("r", (d) => {
            return this.getNodeSize(d);
        })
        .attr("fill", (d) => {
            return this.model.getNodeColor(d);
        })
    }
    updateSingleLinkView(link){
        if(!link) return;
        d3.selectAll("line.link[name='"+link.name+"']").style("stroke", () => {
            return this.model.getLinkColor(link.type);
        })
    }
    updateSingleMarkerView(marker){
        if(!marker) return;
        d3.selectAll("marker[id='end-"+marker+"'] path").attr("fill", () => {
                return this.model.getLinkColor(marker);
            })
    }
    updateSingleRectView(node){
        if(!node) return;
        d3.selectAll("rect.node[name='"+node.escapedName+"']")
            .attr("fill", (d) => {
                return this.model.getNodeColor(d);
            })
    }
    setMarkers(){
        let linkTypes = this.model.getNonEmptyLinkTypes();
        for(let attr in linkTypes){
            if(!this.markerList.includes(attr))
                this.markerList.push(attr);
        }
    }
    getNodeSize(node){
        if(this.model.isNodeLiteral(node)){
            return this.getTextSize(node.escapedName) + 20;
        }
        if(node === this.model.selected_node)
            return 20;
        return 10;
    }
    getNodeLabelPosition(node){
        return this.model.isNodeLiteral(node) ? -this.getTextSize(node.escapedName)/2 : this.getNodeSize(node)+1;
    }
    getTextSize(text){
        return d3.selectAll('text[name="'+ text + '"]').node().getComputedTextLength();
    }
}

export {GraphView}

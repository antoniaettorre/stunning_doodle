# Stunning Doodle

Stunning Doodle is a tool for the visual analysis of Knowledge Graphs and Knowledge Graph Embeddings.
A paper describing the tool, its use and purpose has been published at ESWC 2022 [[1]](#references).

## Requirements

The execution of Stunning Doodle requires Python v3.6 or greater.
To install or update Python on your machine, please follow the instructions [here](https://www.python.org/downloads/).
Since Stunning Doodle has been developed as a web application, you will also need a web browser to access it.


## Getting ready
To be able to run Stunning Doodle, you will need to clone the GitHub repository on your machine, create a new Python 
virtual environment and install all the required packages.

1. Clone the Git repository with the following command:  
  
```git clone https://github.com/antoniaettorre/stunning_doodle.git```
  
2. Move in the project directory:  
  
```cd stunning_doodle```  

3. Run the command line script to launch the Stunning Doodle web application.
* On GNU\Linux and MacOS:  
```./run.sh```  
* On Windows, double-click on the file `run.bat`.  
  
This script will check the presence of the required Python virtual environment. If the virtual environment does not 
exist it will be created, the required dependencies will be installed and finally the application will be launched. 
If the virtual environment already exists, the application will directly start.

4. Open your web browser and head to [localhost:5000](http://localhost:5000/) .

## Visualizing a Knowledge Graph
To visualize a Knowledge Graph with Stunning Doodle, it is sufficient to upload the file defining your RDF graph in
[Turtle](https://www.w3.org/TR/turtle/) or [N-Triples](https://www.w3.org/TR/n-triples/) syntax through the 
menu "Upload Graph" on the left of the page (1). 
Examples of KGs to visualize can be found in the directory `examples/KGs` located on [Zenodo](https://doi.org/10.5281/zenodo.5769191).
The corresponding graph representation will be shown in the central 
area of the page (2). The name of the uploaded file is shown in the bottom right corner (3).  
On the left, we find additional menus listing the namespace defined for the RDF graph (4), providing general 
information and customization functionalities for nodes (5) and links (6).  
On the right, we find the section "Node in focus" (7) which shows the triples associated with the 
selected node in the graph. In the same section we can find the buttons used for the navigation of the graph.

![Graph visualization](/images/graph_visua.png "Graph visualization")

### Customization options
Through the "Nodes' overview" menu, we can:
* verify the number of nodes for each class;
* show and hide nodes based on their type;
* customize colors associated to each type;
* enable or and disable the visualization of labels and literals.  

Through the "Links' overview" menu, we can:
* verify the number of links for each predicate;
* show and hide links based on the predicate they represent;
* customize colors associated to each predicate.

![Graph customization](/images/graph_custo.png "Graph customization")

### Navigation
If the uploaded graph is too big to be comfortably visualized at once, only a small portion of the graph will 
be visualized directly after the upload. More precisely, only one randomly picked node and its close neighbors will
be displayed on the screen. To change the displayed node, it is sufficient to type its URI in the corresponding field 
in section "Upload Graph" and set it as new center for the graph visualization (1).  
It is also possible to navigate and explore the graph by using the buttons in the section "Node in focus" (2):
1. "Center here", to center the visualization on the selected node;
2. "Hide node", to remove the selected node and its neighbors from the visualization;
3. "Expand node", to add the direct neighbors of the selected node to the graph;
4. "Collapse node", to remove the neighbors of the selected node from the visualization.

![Graph navigation](/images/navigation.png "Graph navigation")

## Analyzing Graph Embeddings
To analyze the graph embeddings computed from the visualized graph, it is necessary to upload a CSV file containing
the IRIs and the embeddings for each node in the graph. The file should contain a line for each node in the graph.
Each line must contain the complete IRI of a node followed by the corresponding embedding. Examples of embeddings file can 
be found in the directory `examples/GEs` located on [Zenodo](https://doi.org/10.5281/zenodo.5769191).  
The CSV containing the embeddings can be uploaded by using the file upload menu in the section "Upload Embeddings" (1).  
Once a file for the embeddings is uploaded, a new button will be shown in the section "Node in focus" (2) when a node from 
the graph is selected. When clicking on the button "Show closest nodes in the embedding space", the visualization 
in the central area of the page will change to show only the selected node and the closest nodes to it in the embedding
space with a color gradient based on the distance from the original node (3).  
On the right side of the page, we find the section "Graph Embeddings Information" (4). In this menu, we find additional
information, such as the list of the displayed nodes with their distance (5); and options to customize the metric to use
as distance, i.e. cosine or Euclidean, and the number of displayed nodes (6).
In this mode, the customization options for nodes and links presented in the menus "Nodes' overview" and "Links overview"
are still available.

![Embeddings visualization](/images/embeddings.png "Graph Embedding visualization")

## References

[1] Ettorre, A., Bobasheva, A., Michel, F., Faron, C. (2022). Stunning Doodle: A Tool for Joint Visualization and Analysis of Knowledge Graphs and Graph Embeddings. In: , et al. The Semantic Web. ESWC 2022. Lecture Notes in Computer Science, vol 13261. Springer, Cham. https://doi.org/10.1007/978-3-031-06981-9_22

from rdflib import Graph, Literal, Namespace
from rdflib.namespace import OWL, RDF, RDFS,  XSD
from rdflib.extras.external_graph_libs import rdflib_to_networkx_digraph
import networkx as nx
import json
import logging, sys, gc, os
from utils.graph_utils import format_URI

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s %(levelname)-8s %(message)s', datefmt='%a, %d %b %Y %H:%M:%S')
USE_PREFIX = True

LABELS_PROP = ['http://www.w3.org/2000/01/rdf-schema#label', 'http://www.w3.org/2004/02/skos/core#prefLabel']
ALLOWED_FORMAT = {
    '.ttl': 'turtle',
    '.nt': 'nt'
}

def get_node_types(IRI, rdf_graph, ns):
    if type(IRI) == Literal:
        return ['Literal']
    types = []
    for s, p, o in rdf_graph.triples((IRI, RDF.type, None)):
        types.append(format_URI(str(o), ns) if USE_PREFIX else str(o))
    return types


def get_link_type(link, rdf_graph):
    for s, p, o in rdf_graph.triples((link['source'], None, link['target'])):
        return str(p)


def convert_ttl2json(filename):
    RDF_GRAPH_FILE = filename
    filename, extension = os.path.splitext(RDF_GRAPH_FILE)
    JSON_FILE = RDF_GRAPH_FILE.replace(extension, '.json')

    ns = {}
    logging.info("Opening graph file...")
    rdf_graph = Graph()
    rdf_graph.parse(RDF_GRAPH_FILE, format=ALLOWED_FORMAT[extension])

    logging.info("Saving namespaces...")
    for prefix, url in rdf_graph.namespaces():
        ns[prefix] = url

    logging.info("Converting to digraph...")
    nxDiGraph = rdflib_to_networkx_digraph(rdf_graph, False, edge_attrs=lambda s, p, o: {})

    logging.info("Converting graph to JSON..")
    labels = {}
    data = nx.node_link_data(nxDiGraph)
    literal_nodes = []
    literals_ids = []
    del nxDiGraph
    for l in data['links']:
        l['type'] = get_link_type(l, rdf_graph)
        if l['type'] in LABELS_PROP and l['source'] not in labels:
            labels[l['source']] = str(l['target'])
        if USE_PREFIX:
            l['source'] = format_URI(l['source'], ns)
            l['type'] = format_URI(l['type'], ns)
        # Check if the target node is a Literal
        if 'Literal' in get_node_types(l['target'], rdf_graph, ns):
            # If so, create a new node which has as id the prop + target and as label target
            new_target = l['type'] + '_' + str(l['target'])
            if new_target not in literals_ids:
                new_node = {
                    'id': new_target,
                    'label': str(l['target']),
                    'name': new_target,
                    'types': ['Literal']
                }
                literal_nodes.append(new_node)
                literals_ids.append(new_target)
            l['target'] = new_target
        elif USE_PREFIX:
            l['target'] = format_URI(l['target'], ns)
        l['id'] = l['source'] + '_' +l['type'] + l['target']
    new_nodes = []
    for d in data['nodes']:
        d['types'] = get_node_types(d['id'], rdf_graph, ns)
        if 'Literal' in d['types']:
            # Remove the node from the list
            continue
        if d['id'] in labels:
            d['label'] = labels[d['id']]
        if USE_PREFIX:
            d['id'] = format_URI(d['id'], ns)
        d['name'] = d['id']
        new_nodes.append(d)
    # Add all literal nodes
    data['nodes'] = new_nodes + literal_nodes

    del rdf_graph
    gc.collect()
    data['namespaces'] = ns
    data['n_triples'] = len(data['links'])
    logging.info(f"Writing JSON file of the graph...")
    with open(JSON_FILE, 'w') as outfile:
        json.dump(data, outfile)
        outfile.close()
    return JSON_FILE




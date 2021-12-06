import json
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import euclidean_distances, cosine_distances
import networkx as nx
import rdflib

GEMB_DIM = 100


MAX_NODES = 500

# TODO fix selection of nodes to return
def get_neighbors(center, data, hops=1):
    links = data['links'].copy()
    nodes = [center]
    keep_links = []
    new_nodes = []
    keep_names = [center]
    for i in range(0, hops):
        for l in links:
            if l['source'] in nodes:
                keep_links.append(l)
                if l['target'] not in nodes:
                    new_nodes.append(l['target'])
            elif l['target'] in nodes:
                keep_links.append(l)
                if l['source'] not in nodes:
                    new_nodes.append(l['source'])
            if len(new_nodes) > MAX_NODES:
                i = hops
                break
        keep_names = keep_names + new_nodes
        nodes = new_nodes.copy()
        new_nodes = []
        links = [l for l in links if l not in keep_links]
    keep_nodes = [n for n in data['nodes'] if n['name'] in keep_names]
    return keep_nodes, keep_links


def get_links_between_nodes(nodes, links):
    return [l for l in links if (l['source'] in nodes and l['target'] in nodes)]


def get_list_neighbors(nodes, data, hops=0):
    keep_nodes = []
    keep_links = []
    if hops == 0:
        nodes_names = [n['node'] for n in nodes]
        keep_nodes = [node for node in data['nodes'] if node['name'] in nodes_names]
        keep_links = get_links_between_nodes(nodes_names, data['links'])
        return keep_nodes, keep_links
    for node in nodes:
        n, l = get_neighbors(node['node'], data, hops)
        keep_nodes = merge_no_duplicates(keep_nodes, n)
        keep_links = merge_no_duplicates(keep_links, l)
    return keep_nodes, keep_links


def merge_no_duplicates(list1, list2):
    first_list = [json.dumps(item) for item in list1]
    second_list = [json.dumps(item) for item in list2]
    in_first = set(first_list)
    in_second = set(second_list)
    in_second_but_not_in_first = in_second - in_first
    merged = first_list + list(in_second_but_not_in_first)
    result = [json.loads(item) for item in merged]
    return result


def sort_arrays(ids, r, limit):
    zipped = zip(ids, r)
    sorted_zip = sorted(zipped, key=lambda a: a[1])[0:limit]
    closest = [{'node': i[0], 'distance': i[1]} for i in sorted_zip]
    return closest


def get_distances_match(node, graph_id, limit=100):
    EMBS_FILE = f'./uploads/embs/{graph_id}.emb'
    MAP_FILE = f'./uploads/embs/{graph_id}.gpickle'
    identifiers = [int(n) for n in np.loadtxt(EMBS_FILE, delimiter=' ', skiprows=1, usecols=0).tolist()]

    print("Reading gpickle...")
    nxDiGraphInt = nx.read_gpickle(MAP_FILE)
    nodes = list(nxDiGraphInt.nodes(data=True))
    print("Mapping identifiers...", flush=True)
    id_to_label = {k: str(v['old_label']) for k, v in nodes}
    ids = [id_to_label[int(item)] for item in identifiers]

    print("Loading graph embeddings...", flush=True)
    X = np.loadtxt(EMBS_FILE, delimiter=' ', skiprows=1, usecols=range(1, GEMB_DIM + 1))

    ind = ids.index(node)
    res = euclidean_distances(X[ind, :].reshape(1, -1), X)
    clos = sort_arrays(ids, res[0], limit)
    return clos


def get_distances(node, graph_id, type, limit=100):
    EMBS_FILE = f'./uploads/embs/{graph_id}.csv'
    df = pd.read_csv(EMBS_FILE)
    ids = df.iloc[:, 0].tolist()
    X = df.iloc[:, 1:].to_numpy()
    ind = ids.index(node)
    if type == 'EUCLIDEAN':
        res = euclidean_distances(X[ind, :].reshape(1, -1), X)
    elif type == 'COSINE':
        res = cosine_distances(X[ind, :].reshape(1, -1), X)
    clos = sort_arrays(ids, res[0], limit)
    return clos


def format_URI(uri, ns):
    for prefix in ns.keys():
        uri = uri.replace(ns[prefix], prefix+':')
    return uri


def find_all_paths(links, start, end, path=[], depth=10):
    if depth == 0:
        return []
    path = path + [start]
    if start == end:
        return [path]
    nodes = []
    for l in links:
        if start == l['source']:
            nodes.append(l['target'])
    paths = []
    for node in nodes:
        if node not in path:
            newpaths = find_all_paths(links, node, end, path, depth-1)
            for newpath in newpaths:
                paths.append(newpath)
    return paths


def find_shortest_path(links, start, goal):
    graph = get_graph_dict_from_links(links, False)
    explored = []

    # Queue for traversing the
    # graph in the BFS
    queue = [[start]]

    # If the desired node is
    # reached
    if start == goal:
        return [start]

    # Loop to traverse the graph
    # with the help of the queue
    while queue:
        path = queue.pop(0)
        node = path[-1]

        # Condition to check if the
        # current node is not visited
        if node not in explored:
            # Get the list of neighbors for node
            neighbours = graph[node]

            # Loop to iterate over the
            # neighbours of the node
            for neighbour in neighbours:
                new_path = list(path)
                new_path.append(neighbour)
                queue.append(new_path)

                # Condition to check if the
                # neighbour node is the goal
                if neighbour == goal:
                    return new_path
            explored.append(node)

    # Condition when the nodes are not connected
    return []


def get_nodes_links_from_path(path, data):
    keep_nodes = [node for node in data['nodes'] if node['name'] in path]
    keep_links = []
    for l in data['links']:
        if l['source'] in path and l['target'] in path:
            keep_links.append(l)
    return keep_nodes, keep_links


def get_graph_dict_from_links(links, directed=True):
    graph = {}
    for l in links:
        if l['source'] not in graph:
            graph[l['source']] = []
        graph[l['source']].append(l['target'])
        if not directed:
            if l['target'] not in graph:
                graph[l['target']] = []
            graph[l['target']].append(l['source'])
    return graph


def get_distribution(data, prop):
    df = pd.DataFrame(data)
    distribution = df[prop].value_counts()
    return distribution


def query_graph(file, query):
    g = rdflib.Graph()
    g.parse(file, format="turtle")
    qres = g.query(query)
    res = []
    for row in qres:
        obj = {}
        for l in row.labels:
            obj[l] = str(row[l])
        res.append(obj)
    return res


def get_value_for_property(links, nodes, predicate):
    s = []
    values = []
    for link in links:
        if link['source'] in nodes and link['type'] == predicate:
            s.append(link['source'])
            values.append(link['target'])
    return {'s': s, predicate: values}


def count_out_for_property(links, nodes, predicate):
    counts = {}
    for node in nodes:
        counts[node] = 0
    for link in links:
        if link['source'] in nodes:
            if not predicate or (predicate and link['type'] == predicate):
                counts[link['source']] = counts[link['source']] + 1
    return [{'s': node, 'value': counts[node]} for node in counts]


def count_in_for_property(links, nodes, predicate):
    counts = {}
    for node in nodes:
        counts[node] = 0
    for link in links:
        if link['target'] in nodes:
            if not predicate or (predicate and link['type'] == predicate):
                counts[link['target']] = counts[link['target']] + 1
    return [{'s': node, 'value': counts[node]} for node in counts]
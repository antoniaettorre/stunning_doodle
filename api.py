import os
from flask import Flask, flash, request, redirect, url_for, render_template, send_from_directory
from utils import ttl2json
from utils import graph_utils
import json
import string, random, logging

UPLOAD_FOLDER = './uploads'
GRAPH_ALLOWED_EXTENSIONS = ['.ttl', '.nt']
MAX_NODES = 500

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.secret_key = 'super secret key'


def generate_id(l = 20):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(l))


@app.route('/upload/graph', methods=['POST'])
def upload_graph():
    # check if the post request has the file part
    if 'file' not in request.files:
        flash('No file part')
        return redirect(request.url)
    file = request.files['file']
    # if user does not select file, browser also
    # submit an empty part without filename
    if file.filename == '':
        flash('No selected file')
        return redirect(request.url)
    if file:
        filename = file.filename
        filename, extension = os.path.splitext(filename)
        id = generate_id()
        if extension in GRAPH_ALLOWED_EXTENSIONS:
            path = os.path.join(app.config['UPLOAD_FOLDER'] + '/graphs', id + extension)
            file.save(path)
            jsonfile = ttl2json.convert_ttl2json(path)
        elif extension == '.json':
            path = os.path.join(app.config['UPLOAD_FOLDER'] + '/graphs', id + '.json')
            file.save(path)
        return redirect('/graph/'+id)
    return ''


@app.route('/upload/emb_maps', methods=['POST'])
def upload_embs_with_map():
    # check if the post request has the file part
    if 'file_emb' not in request.files or 'file_map' not in request.files:
        flash('No file part')
        return redirect(request.url)
    file_emb = request.files['file_emb']
    file_map = request.files['file_map']
    id = request.form['graph_id']
    # if user does not select file, browser also
    # submit an empty part without filename
    if file_emb.filename == '' or file_map.filename == '':
        flash('No selected file')
        return redirect(request.url)
    if file_emb and file_map:
        file_emb.save(os.path.join(app.config['UPLOAD_FOLDER'] + '/embs', id + '.emb'))
        file_map.save(os.path.join(app.config['UPLOAD_FOLDER'] + '/embs', id + '.gpickle'))
        response = app.response_class(
                            response='OK',
                            mimetype='application/json'
                        )
        return response
    return ''


@app.route('/upload/embs', methods=['POST'])
def upload_embs():
    # check if the post request has the file part
    if 'file_emb' not in request.files:
        flash('No file part')
        return redirect(request.url)
    file_emb = request.files['file_emb']
    id = request.form['graph_id']
    # if user does not select file, browser also
    # submit an empty part without filename
    if file_emb.filename == '':
        flash('No selected file')
        return redirect(request.url)
    if file_emb:
        file_emb.save(os.path.join(app.config['UPLOAD_FOLDER'] + '/embs', id + '.csv'))
        response = app.response_class(
                            response='OK',
                            mimetype='application/json'
                        )
        return response
    return ''


@app.route('/graph/<graph_id>', methods=['GET'])
def get_graph(graph_id):
        args = request.args
        center = args['center'] if 'center' in args else False
        jsonfile = os.path.join(app.config['UPLOAD_FOLDER'] + '/graphs', graph_id + '.json')
        with open(jsonfile) as f:
            data = json.load(f)
            f.close()
            data['id'] = graph_id
            if center or len(data['nodes']) > MAX_NODES:
                hops = 1
                center = center or data['nodes'][0]['name']
                data['nodes'], data['links'] = graph_utils.get_neighbors(center, data, hops)
            data['center'] = center
            response = app.response_class(
                response=json.dumps(data),
                mimetype='application/json'
            )
            return response


@app.route('/graph/<graph_id>/distance', methods=['GET'])
def get_graph_with_distances(graph_id):
    args = request.args
    limit = int(args['limit']) if 'limit' in args else 100
    node = args['node'] if 'node' in args else False
    type = args['type'] if 'type' in args else 'EUCLIDEAN'
    jsonfile = os.path.join(app.config['UPLOAD_FOLDER'] + '/graphs', graph_id + '.json')
    with open(jsonfile) as f:
        data = json.load(f)
        f.close()
        data['id'] = graph_id
        data['node'] = node
        data['limit'] = limit
        data['type'] = type
        closest = graph_utils.get_distances(node, graph_id, type, limit)
        for c in closest:
            c['node'] = graph_utils.format_URI(c['node'], data['namespaces'])
        data['closest'] = closest
        if len(data['nodes']) > MAX_NODES:
            logging.info('Getting neighs of close nodes')
            data['nodes'], data['links'] = graph_utils.get_list_neighbors(closest, data)
        response = app.response_class(
            response=json.dumps(data),
            mimetype='application/json'
        )
        return response


@app.route('/graph/<graph_id>/paths', methods=['GET'])
def get_paths_between_nodes(graph_id):
    args = request.args
    start = args['start'] if 'start' in args else False
    end = args['end'] if 'end' in args else False
    jsonfile = os.path.join(app.config['UPLOAD_FOLDER'] + '/graphs', graph_id + '.json')
    with open(jsonfile) as f:
        data = json.load(f)
        f.close()
        data['id'] = graph_id
        data['start'] = start
        data['end'] = end
        logging.info('Searching shortest path between the two nodes')
        path = graph_utils.find_shortest_path(data['links'], start, end)
        logging.info('Getting nodes and links to show based on path')
        data['nodes'], data['links'] = graph_utils.get_nodes_links_from_path(path, data)
        response = app.response_class(
            response=json.dumps(data),
            mimetype='application/json'
        )
        return response


@app.route('/graph/<graph_id>/value', methods=['POST'])
def get_distrib_value(graph_id):
    data = request.get_json()
    nodes = data['nodes']
    predicate = data['predicate'] if 'predicate' in data else 'rdf:type'
    jsonfile = os.path.join(app.config['UPLOAD_FOLDER'] + '/graphs', graph_id + '.json')
    with open(jsonfile) as f:
        data = json.load(f)
        f.close()
        results = graph_utils.get_value_for_property(data['links'], nodes, predicate)
        non_defined = [node for node in nodes if node not in results['s']]
        distrib = graph_utils.get_distribution(results, predicate)
        distrib['non_defined'] = len(non_defined)
        ref = [{'s': s, predicate: value} for value, s in zip(results[predicate], results['s']) if s == nodes[0]]
    response = app.response_class(
        response=json.dumps({'d': distrib.to_json(orient='split'), 'ref': ref}),
        mimetype='application/json'
    )
    return response


@app.route('/graph/<graph_id>/count_in', methods=['POST'])
def get_count_in_distrib(graph_id):
    data = request.get_json()
    nodes = data['nodes']
    predicate = data['predicate'] if 'predicate' in data else None
    jsonfile = os.path.join(app.config['UPLOAD_FOLDER'] + '/graphs', graph_id + '.json')
    with open(jsonfile) as f:
        data = json.load(f)
        f.close()
        results = graph_utils.count_in_for_property(data['links'], nodes, predicate)
        distrib = graph_utils.get_distribution(results, 'value')
        ref = [r for r in results if r['s'] == nodes[0]]
    response = app.response_class(
        response=json.dumps({'d': distrib.to_json(orient='split'), 'ref': ref}),
        mimetype='application/json'
    )
    return response


@app.route('/graph/<graph_id>/count_out', methods=['POST'])
def get_count_out_distrib(graph_id):
    data = request.get_json()
    nodes = data['nodes']
    predicate = data['predicate'] if 'predicate' in data else None
    jsonfile = os.path.join(app.config['UPLOAD_FOLDER'] + '/graphs', graph_id + '.json')
    with open(jsonfile) as f:
        data = json.load(f)
        f.close()
        results = graph_utils.count_out_for_property(data['links'], nodes, predicate)
        distrib = graph_utils.get_distribution(results, 'value')
        ref = [r for r in results if r['s'] == nodes[0]]
    response = app.response_class(
        response=json.dumps({'d': distrib.to_json(orient='split'), 'ref': ref}),
        mimetype='application/json'
    )
    return response

@app.route('/')
def hello_world():
    return render_template('home.html')


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")

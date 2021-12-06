import csv
import pandas as pd
import networkx as nx
import sys, getopt
import logging


def get_command_line_options(options_list):
    options_string = ":"
    options_string = options_string.join(options_list) + ':'
    try:
        opts, args = getopt.getopt(sys.argv[1:], options_string)
    except getopt.GetoptError:
        sys.exit(2)
    options_values = dict()
    for opt, arg in opts:
        key = opt[1:]
        options_values[key] = arg
    return options_values


options = get_command_line_options(['e', 'g', 'o'])


EMB_FILE = options['e']
NX_FILE = options['g']

EXPORT_FILE = options['o']

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s %(levelname)-8s %(message)s', datefmt='%a, %d %b %Y %H:%M:%S')


logging.info("Reading gpickle...")
nxDiGraphInt = nx.read_gpickle(NX_FILE)

nodes = list(nxDiGraphInt.nodes(data=True))
id_to_label = {k: str(v['old_label']) for k,v in nodes}

logging.info("Reading embeddings...")
with open(EMB_FILE, "r") as embeddings:
    next(embeddings)
    reader = csv.reader(embeddings, delimiter=" ")

    embs = []
    i = 1
    init = 0
    for row in reader:
        if i <= init:
            i = i + 1
            continue
        node_id = row[0]
        embs.append({
            "node_id": int(node_id),
            "embedding": [float(item) for item in row[1:]]
        })
        i = i + 1

logging.info(f"Generating file")
df = pd.DataFrame(embs)
df['iri'] = df['node_id'].map(id_to_label)
df = df.drop('node_id', axis=1)

# expand df_1.embedding into its own dataframe
df_embs = df['embedding'].apply(pd.Series)

# rename each variable
# df_embs = df_embs.rename(columns = lambda x : '_'+LABEL + '_gemb' + str(x))

df_expanded = pd.concat([df[:], df_embs[:]], axis=1)
df_expanded = df_expanded.drop('embedding', axis=1)
logging.info(f"Exporting file")
df_expanded.to_csv(EXPORT_FILE, index = False)



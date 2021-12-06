import pandas as pd
import numpy as np
import sys, getopt
import logging

# Ex: python3 DGLKGE2CSV.py -i ../experiments/experiment5/gembs/ComplEx/
# -o ../experiments/experiment5/datasets/gembs/ComplEx/
# -d graph_infections_ComplEx_0

# i - input path where to find _entity.npy file with computed embedding
# o - output path where to store the selected embeddings
# d - name of the dataset as used for the embeddings computation


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


options = get_command_line_options(['i', 'o', 'd'])

INPUT_PATH = options['i']
OUTPUT_PATH = options['o']
DATASET = options['d']

ID_FILE = INPUT_PATH + 'entities.tsv'

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s %(levelname)-8s %(message)s', datefmt='%a, %d %b %Y %H:%M:%S')

logging.info("Reading IDs file...")
ids = pd.read_csv(ID_FILE, names=['id', 'iri'], index_col=0, sep=',')
logging.info("Loading embeddings...")
data = np.load(INPUT_PATH + DATASET + '_entity.npy')
df = pd.DataFrame(data, index=ids.index)
logging.info("Merging...")
df = pd.merge(ids, df, left_index=True, right_index=True)

df.to_csv(OUTPUT_PATH + DATASET + '.csv', index=False)


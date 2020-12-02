import json
import os

import matplotlib.pyplot as plt
import transformers
import pandas as pd
import numpy as np
import tensorflow as tf
from flask import Flask, jsonify, request
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


df = pd.read_csv('WikiEssentials_L4.txt', sep='\t')
tokenizer = transformers.AutoTokenizer.from_pretrained('distilbert-base-cased')
model = transformers.TFAutoModel.from_pretrained('distilbert-base-cased')

if os.path.exists('lines_arr.npy'):
  lines_arr = np.load('lines_arr.npy', allow_pickle=True)
else:
  tokenized_lines = [tokenizer.encode(text) for text in df['paragraph_text']]
  lines_arr = np.array(tokenized_lines)
  np.save('lines_arr.npy', lines_arr)


line_lens = np.array([len(line) for line in lines_arr])
sorted_idxs = np.argsort(line_lens)
line_lens = line_lens[sorted_idxs]
lines_arr = lines_arr[sorted_idxs]
df = df.iloc[sorted_idxs]
df['doc_idx_int'] = df['document_id'].apply(lambda x: x[3:]).astype(int)


if os.path.exists('embeds.npy'):
  all_embeds = np.load('embeds.npy')
else:
  def token_gen():
    for tokens in lines_arr:
      yield tokens
  bs = 64
  embeds = []
  maxlen = 0
  i = 0
  tg = token_gen()
  while maxlen < 128:
    token_batch = []
    for tokens in tg:
      token_batch.append(tokens)
      if len(token_batch) == bs:
        break
    maxlen = min([max([len(tokens) for tokens in token_batch]), 512])
    padded_batch = []
    for tokens in token_batch:
      pad_amt = maxlen - len(tokens)
      tokens = tf.pad(tokens, [[0, pad_amt]])
      padded_batch.append(tokens)
    padded_batch = tf.convert_to_tensor(padded_batch)
    res = model(padded_batch)[0]
    s_embed = tf.reduce_mean(res, axis=1)
    embeds.append(s_embed)
    i += 1
    print(maxlen, i)
  all_embeds = tf.concat(embeds, axis=0)
  np.save('embeds.npy', all_embeds.numpy())


doc_idx_names = json.load(open('doc_idx_names.json', 'r'))
doc_idx_names = {int(k): v for k, v in doc_idx_names.items()}
norm_embeds = tf.math.l2_normalize(all_embeds, axis=1)


@app.route('/inference')
def search():
  text = request.args.get('text')
  tokens = tokenizer.encode(text)
  res = model(tf.convert_to_tensor([tokens]))[0]
  query = tf.reduce_mean(res, axis=[1])
  query = tf.math.l2_normalize(query)
  align = tf.matmul(norm_embeds, query, transpose_b=True)
  top_results = tf.math.top_k(align[:, 0], k=10)
  top_idxs = top_results.indices
  top_rows = df.iloc[top_idxs]
  categories = [title.replace('_', ' ').replace('+', ' / ') for title in top_rows['outcome_label'].tolist()]
  titles = [doc_idx_names[idx - 1] for idx in top_rows['doc_idx_int']]
  paragraphs = top_rows['paragraph_text'].tolist()
  return jsonify({
    'categories': categories,
    'titles': titles,
    'paragraphs': paragraphs,
    'similarity': top_results.values.numpy().tolist()
  })

app.run('0.0.0.0', port=8080)

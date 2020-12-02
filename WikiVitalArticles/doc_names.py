from path import Path
import json

io = Path("data")

all_articles = io.glob("./*/*/*")
doc_idx_names = {int(i): name.split('/')[-1].split('.html')[0] for i, name in enumerate(all_articles)}

with open('doc_idx_names.json', 'w+') as f:
  f.write(json.dumps(doc_idx_names))

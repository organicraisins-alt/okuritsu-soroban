"""Generate the requested route/meta/structured-data inventory from built HTML."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
from collections import Counter
import json,struct
root=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self):super().__init__();self.title='';self.description='';self.robots='';self.canonical='';self.og='';self.tags=[];self.links=[];self.script=None;self.title_on=False;self.head=False;self.schema=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);self.tags.append((tag,a))
  if tag=='head':self.head=True
  if tag=='title' and self.head:self.title_on=True
  if tag=='meta':
   if a.get('name')=='description':self.description=a.get('content','')
   if a.get('name')=='robots':self.robots=a.get('content','')
   if a.get('property')=='og:image':self.og=a.get('content','')
  if tag=='link' and a.get('rel')=='canonical':self.canonical=a.get('href','')
  if tag=='a':self.links.append(a.get('href',''))
  if tag=='script' and a.get('type')=='application/ld+json':self.script=''
 def handle_data(self,data):
  if self.title_on:self.title+=data
  if self.script is not None:self.script+=data
 def handle_endtag(self,tag):
  if tag=='head':self.head=False
  if tag=='title':self.title_on=False
  if tag=='script' and self.script is not None:
   self.schema.append(json.loads(self.script));self.script=None

def types(value):
 if isinstance(value,list):return set().union(*(types(x) for x in value)) if value else set()
 if isinstance(value,dict):return ({value['@type']} if isinstance(value.get('@type'),str) else set())|set().union(*(types(v) for v in value.values()))
 return set()
rows=[];broken=[]
for f in sorted((root/'dist').rglob('*.html')):
 rel=f.relative_to(root/'dist').as_posix();route='/'+rel.removesuffix('index.html')
 if rel=='404.html':route='/404.html'
 p=Page();p.feed(f.read_text());data={'path':route,'public':'noindex' not in p.robots,'title':p.title,'titleLength':len(p.title),'description':p.description,'descriptionLength':len(p.description),'canonical':p.canonical,'ogImage':p.og,'schemaTypes':sorted(set().union(*(types(x) for x in p.schema)))};rows.append(data)
 for link in p.links:
  parsed=urlsplit(link)
  if parsed.scheme or parsed.netloc or not parsed.path.startswith('/'):continue
  path=unquote(parsed.path).lstrip('/');target=root/'dist'/path
  if not target.exists():broken.append([route,link])
 for image in [p.og]:
  target=root/'dist'/urlsplit(image).path.lstrip('/')
  if image and not target.exists():broken.append([route,image])
public=[r for r in rows if r['public']]
report={'htmlCount':len(rows),'publicCount':len(public),'pages':rows,'longTitles':[r['path'] for r in public if r['titleLength']>32],'longDescriptions':[r['path'] for r in public if r['descriptionLength']>120],'metaLengths':[{'path':r['path'],'title':r['titleLength'],'description':r['descriptionLength']} for r in rows],'duplicateTitles':[k for k,v in Counter(r['title'] for r in public).items() if v>1],'duplicateDescriptions':[k for k,v in Counter(r['description'] for r in public).items() if v>1],'brokenLinks':broken}
(root/'docs/rebrand-pages.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
(root/'docs/rebrand-routes.json').write_text(json.dumps([r['path'] for r in rows],ensure_ascii=False)+'\n')
print(json.dumps({k:v for k,v in report.items() if k not in ['pages','metaLengths']},ensure_ascii=False,indent=2))
assert not broken and not report['duplicateTitles'] and not report['duplicateDescriptions']

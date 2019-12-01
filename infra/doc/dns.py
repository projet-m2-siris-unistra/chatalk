from graphviz import Digraph
g = Digraph('G', filename='dns.gv')

# utils
g.edge('utils', 'chatalk-dumas.u-strasbg.fr')
g.edge('s3', 'utils')
g.edge('registry', 'utils')

# load-balancer
g.edge('lb', 'cluster1')

# cluster1
g.edge('cluster1', 'chatalk.u-strasbg.fr')
g.edge('chatalk.u-strasbg.fr', 'chatalk-balzac.u-strasbg.fr')
g.edge('chatalk.u-strasbg.fr', 'chatalk-camus.u-strasbg.fr')
g.edge('chatalk.u-strasbg.fr', 'chatalk-zola.u-strasbg.fr')

# services
g.edge('chatalk.fr', 'lb')
g.edge('www', 'lb')
g.edge('ws', 'lb')
g.edge('fake-ui', 'lb')

g.view()

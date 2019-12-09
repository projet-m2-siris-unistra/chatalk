from graphviz import Digraph
g = Digraph('G', filename='dns.gv')

# utils
g.edge('utils', 'chatalk-dumas.u-strasbg.fr')
g.edge('utils', 'chatalk4.u-strasbg.fr')
g.edge('s3', 'utils')
g.edge('registry', 'utils')

# load-balancer
g.edge('lb', 'cluster1')
g.edge('lb', 'cluster2')

# cluster1
g.edge('cluster1', 'chatalk.u-strasbg.fr')
g.edge('chatalk.u-strasbg.fr', 'chatalk-balzac.u-strasbg.fr')
g.edge('chatalk.u-strasbg.fr', 'chatalk-camus.u-strasbg.fr')
g.edge('chatalk.u-strasbg.fr', 'chatalk-zola.u-strasbg.fr')

# cluster2
g.edge('cluster2', 'chatalk-vip.u-strasbg.fr')
g.edge('chatalk-vip.u-strasbg.fr', 'chatalk1.u-strasbg.fr')
g.edge('chatalk-vip.u-strasbg.fr', 'chatalk2.u-strasbg.fr')
g.edge('chatalk-vip.u-strasbg.fr', 'chatalk3.u-strasbg.fr')

# services
g.edge('dbmaster', 'cluster2')
g.edge('chatalk.fr', 'lb')
g.edge('www', 'lb')
g.edge('ws', 'lb')
g.edge('fake-ui', 'lb')

g.view()

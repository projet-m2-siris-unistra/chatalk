Monitoring stack
================

Uses: https://github.com/coreos/kube-prometheus

## Dependencies

Install on your machine some dependencies using:

```sh
go get github.com/brancz/gojsontoyaml
go get github.com/jsonnet-bundler/jsonnet-bundler/cmd/jb
go get github.com/google/go-jsonnet/cmd/jsonnet
```

Then simply run `jb install` to include the `vendor` directory.

To update the generated manifests, use `./build.sh`.

## Install the stack

Install the whole stack in the `monitoring` namespace using:

```sh
kubectl apply -f manifests/setup
sleep 10 # wait that ressources are successfuly created
kubectl apply -f manifests/
```

That's it!

## Access to services

### Grafana

Used to display metrics form Prometheus in dashboards containing nice graphs, …

```sh
kubectl --namespace monitoring port-forward svc/grafana 3000
```

Go to http://localhost:3000

### Prometheus

Used to scrape metrics and show alerts from Alert Manager.

```sh
kubectl --namespace monitoring port-forward svc/prometheus-k8s 9090
```

Go to http://localhost:9090

### Alert Manager

Used to configure alerting.

```sh
kubectl --namespace monitoring port-forward svc/alertmanager-main 9093
```

Go to http://localhost:9093

### Allow to scrape other namespaces

To allow `chatalk` namespace scraping:

```sh
kubectl create rolebinding -n chatalk --serviceaccount monitoring:prometheus-k8s --clusterrole view prometheus-k8s
```

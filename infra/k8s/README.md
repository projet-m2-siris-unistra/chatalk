`k8s`
=====

## Cluster creation

First deploy Kubernetes with help of the Ansible playbooks.

## Deploy base services

### Metallb

To have a IP failover, we will deploy `metallb`.

Just run the following command:

```sh
kubectl apply -k k8s/metallb/overlays/clusterX
```

### Ingress controller

We will use nginx as an ingress controller.

Use the following command to deploy it:

```sh
kubectl apply -k nginx-ingress-controller/overlays/default
```

## Create the namespace for our application

We will deploy our application in a specific namespace.

To create it, use the following command:

```sh
kubectl create namespace chatalk
```

## Deploy the bus

For the data bus, we will use `nats-streaming-operator`.

Run the following command to deploy it:

```sh
kubectl apply -k nats-streaming-operator/overlays/unistra
```

## Deploy the database

For the database, we will use `stolon`.

Run the following command to deploy it:

```sh
kubectl apply -k stolon
```

Create the `chatalk` role and database by connecting to postgres:

```sh
# in one shell, we forward the postgres port
kubectl port-forward --namespace stolon service/stolon-proxy 5432:5432

# in another shell, we will connect to the forwarded postgres
# password in stolon/kustomization.yaml: aix7eePeH9ooqui6ShaiT7eiphaeTee2isahg2ahwibiwoh8Ailequ2jeiceeSho
psql -h localhost -U stolon postgres <<EOF
create role chatalk login password 'ieceetiothux6aechieBohvoozaezo1zaetequahShuw6faePeng4shaem3raece';
create database chatalk owner chatalk;
EOF
```

## Configure the namespace to pull images from our private registry

First we will need to create a new secret with the credentials:

```sh
kubectl -n chatalk create secret docker-registry chatalk-registry-creds \
  --docker-server=registry.chatalk.fr \
  --docker-username=registry \
  --docker-password=wPf3kzeUcNfwnwCs
```

Then patch the default service account of the `chatalk` namespace that we created for our application:

```sh
kubectl -n chatalk patch serviceaccount default -p '{"imagePullSecrets": [{"name": "chatalk-registry-creds"}]}'
```

## Deploy HTTPS certificates

### Create a new ServiceAccount

We will need a new ServiceAccount to deploy our HTTPS certificates.

To create a new ServiceAccount, use the following command:

```sh
kubectl -n default create sa certs
```

Then create a new role binding in our namespace like this:

```sh
kubectl -n chatalk create rolebinding --serviceaccount default:certs --clusterrole edit certs-edit
```

Get the token using following commands:

```sh
kubectl -n default get $(k -n default get secrets -o name | grep secret/certs-token) -o jsonpath={.data.token} | base64 -d
```

### Deploy certificates on the cluster

Go to the `dumas` VM using SSH.

You have normally created a wildcard certificate.

Use the following command by replacing:
- `TOKEN_FROM_PREVIOUS_STEP` with the token you got before
- `SERVER_URL` with:
  - `https://chatalk-balzac.u-strasbg.fr:6443` for `cluster1`
  - `https://chatalk1.u-strasbg.fr:6443` for `cluster2`
to create the cert secret on the cluster:

```sh
sudo docker run --rm \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  ludovicm67/k8s-tools \
  kubectl \
    --insecure-skip-tls-verify=true \
    --server=SERVER_URL \
    --token=TOKEN_FROM_PREVIOUS_STEP \
    -n chatalk \
    create secret tls \
      --cert=/etc/letsencrypt/live/chatalk.fr/fullchain.pem \
      --key=/etc/letsencrypt/live/chatalk.fr/privkey.pem chatalk-cert
```

## Deploy our application

Use the following command:

```sh
kubectl apply -k chatalk
```

## Setup CD

Create a new service account in the default namespace, then bind the clusterrole edit to it for the chatalk namespace using the following commands:

```sh
kubectl create sa -n default ci
kubectl create rolebinding -n chatalk --serviceaccount default:ci --clusterrole edit ci
```

To get the token, use:

```sh
kubectl -n default get $(k -n default get secrets -o name | grep ci-token) -o jsonpath='{.data.token}' | base64 -d
```

To get the certificate, use:

```sh
kubectl -n default get $(k -n default get secrets -o name | grep ci-token) -o jsonpath='{.data.ca\.crt}' | base64 -d
```

## Configure nodes to enable nats federation

Verify that port 32328 is open on all nodes.

In one shell, run the following command:

```sh
kubectl proxy
```

Then run the following command in another shell:

```sh
for n in $(kubectl get nodes -o name); do
  NODE=$(echo $n | sed 's/.*\///')
  echo "Working on node $NODE…"

  InternalIP=$(kubectl get node "$NODE" -o jsonpath='{.status.addresses[?(@.type=="InternalIP")].address}')
  echo "Node IP is: $InternalIP"

  # set external IP for node
  echo -n "$InternalIP" \
  | jq --raw-input \
    '[{"op": "add", "path": "/status/addresses/-", "value": {"type": "ExternalIP", "address": .}}]' \
  | curl -X PATCH -H "Content-Type: application/json-patch+json" \
    -d @- http://localhost:8001/api/v1/nodes/$NODE/status

  # annotate node to set external IP for nats
  kubectl annotate node "$NODE" "nats.io/node-external-ip=$InternalIP"
done
```

`k8s`
=====

## Cluster creation

First deploy Kubernetes with help of the Ansible playbooks.

## Deploy base services

### Metallb

To have a IP failover, we will deploy `metallb`.

Just run the following command:

```sh
kubectl apply -k k8s/metallb/overlays/unistra
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

You have normally created a widcard certificate.

Use the following command by replacing `TOKEN_FROM_PREVIOUS_STEP` with the token you got before to create the cert secret on the cluster:

```sh
docker run --rm \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  ludovicm67/k8s-tools \
  kubectl \
    --insecure-skip-tls-verify=true \
    --server=https://chatalk-balzac.u-strasbg.fr:6443 \
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

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

## Deploy our application

Use the following command:

```sh
kubectl apply -k chatalk
```

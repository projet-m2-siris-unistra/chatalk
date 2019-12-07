# Nginx Ingress Controller

Documentation: https://kubernetes.github.io/ingress-nginx/

## Requirements

You need to have:
  - `kubectl` (https://kubernetes.io/fr/docs/tasks/tools/install-kubectl/)
  - `kustomize` (https://kustomize.io/)
  - a Kubernetes cluster correctly configured

## Deployment

Use the following command:

```sh
kubectl apply -k overlay/default
```

## Update

The `base` contains only manifests from the documentation.
It's easier for upgrading the base without breaking things.

  - `mandatory.yaml`: https://raw.githubusercontent.com/kubernetes/ingress-nginx/master/deploy/static/mandatory.yaml
  - `cloud-generic.yaml`: https://raw.githubusercontent.com/kubernetes/ingress-nginx/master/deploy/static/provider/cloud-generic.yaml

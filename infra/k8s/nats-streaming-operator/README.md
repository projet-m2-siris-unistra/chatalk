`nats-streaming-operator`
=========================

## Deploy

Make sure you created the `chatalk` namespace.

Then, simply run the following command (replace `X` with the cluster number):

```sh
kubectl apply -k overlays/clusterX
```

## Upgrade

To upgrade the base of `nats-streaming-operator`, you can update following files in the `base` directory:
- `00-prereqs.yaml`: https://github.com/nats-io/nats-operator/releases/latest/download/00-prereqs.yaml
- `10-deployment.yaml`: https://github.com/nats-io/nats-operator/releases/latest/download/10-deployment.yaml
- `default-rbac.yaml`: https://raw.githubusercontent.com/nats-io/nats-streaming-operator/master/deploy/default-rbac.yaml
- `deployment.yaml`: https://raw.githubusercontent.com/nats-io/nats-streaming-operator/master/deploy/deployment.yaml

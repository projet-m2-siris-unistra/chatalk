`postgres-operator`
===================

Documentation: https://github.com/zalando/postgres-operator

## Deploy

Simply run the following command:

```sh
kubectl apply -k overlays/unistra
```

## Upgrade

To upgrade the base of `postgres-operator`, you can update following files in the `base` directory:
- `configmap.yaml`: https://raw.githubusercontent.com/zalando/postgres-operator/master/manifests/configmap.yaml
- `operator-service-account-rbac.yaml`: https://raw.githubusercontent.com/zalando/postgres-operator/master/manifests/operator-service-account-rbac.yaml
- `postgres-operator.yaml`: https://raw.githubusercontent.com/zalando/postgres-operator/master/manifests/postgres-operator.yaml

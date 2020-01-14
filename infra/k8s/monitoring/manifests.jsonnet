local k = import 'ksonnet/ksonnet.beta.4/k.libsonnet';
local secret = k.core.v1.secret;
local service = k.core.v1.service;
local servicePort = k.core.v1.service.mixin.spec.portsType;

local kp =
  (import 'kube-prometheus/kube-prometheus.libsonnet') +
  // Uncomment the following imports to enable its patches
  (import 'kube-prometheus/kube-prometheus-anti-affinity.libsonnet') +
  (import 'kube-prometheus/kube-prometheus-kubespray.libsonnet') +
  (import 'dashboards.jsonnet') +
  // (import 'kube-prometheus/kube-prometheus-managed-cluster.libsonnet') +
  // (import 'kube-prometheus/kube-prometheus-node-ports.libsonnet') +
  // (import 'kube-prometheus/kube-prometheus-static-etcd.libsonnet') +
  // (import 'kube-prometheus/kube-prometheus-thanos-sidecar.libsonnet') +
  {
    prometheus+: {
      loadBalancer: service.new(
          'prometheus-lb-svc',
          { app: 'prometheus', prometheus: 'k8s' },
          servicePort.newNamed('web', 9090, 'web')
        ) +
        service.mixin.spec.withSessionAffinity('ClientIP') +
        service.mixin.metadata.withNamespace($._config.namespace) +
        service.mixin.metadata.withLabels({ prometheus: 'k8s' }) +
        service.mixin.metadata.withAnnotations({
          'metallb.universe.tf/allow-shared-ip': 'public'
        }) +
        service.mixin.spec.withType('LoadBalancer'),

      additionalScrapSecret: secret.new('additional-scrape-configs', {
          'prometheus-additional.yaml': std.base64(std.manifestYamlDoc([{
            job_name: 'federate',
            scrape_interval: '15s',
            honor_labels: true,
            metrics_path: '/federate',
            params: {
              'match[]': [
                '{job="stan-svc"}'
              ],
            },
            static_configs: [
              {
                targets: [
                  'cluster2.chatalk.fr:9090'
                ],
              },
            ],
          }]))
        }) +
        secret.mixin.metadata.withNamespace($._config.namespace),

      prometheus+: {
        spec+: {
          additionalScrapeConfigs: {
            name: 'additional-scrape-configs',
            key: 'prometheus-additional.yaml',
          },
        },
      },
    },
    _config+:: {
      namespace: 'monitoring',
      grafana+:: {
        config: {
          sections: {
            'auth.anonymous': {
              enabled: true
            }
          }
        },
        plugins+: [
          'grafana-piechart-panel',
        ],
      },
    },
  };

{ ['setup/0namespace-' + name]: kp.kubePrometheus[name] for name in std.objectFields(kp.kubePrometheus) } +
{
  ['setup/prometheus-operator-' + name]: kp.prometheusOperator[name]
  for name in std.filter((function(name) name != 'serviceMonitor'), std.objectFields(kp.prometheusOperator))
} +
// serviceMonitor is separated so that it can be created after the CRDs are ready
{ 'prometheus-operator-serviceMonitor': kp.prometheusOperator.serviceMonitor } +
{ ['node-exporter-' + name]: kp.nodeExporter[name] for name in std.objectFields(kp.nodeExporter) } +
{ ['kube-state-metrics-' + name]: kp.kubeStateMetrics[name] for name in std.objectFields(kp.kubeStateMetrics) } +
{ ['alertmanager-' + name]: kp.alertmanager[name] for name in std.objectFields(kp.alertmanager) } +
{ ['prometheus-' + name]: kp.prometheus[name] for name in std.objectFields(kp.prometheus) } +
{ ['prometheus-adapter-' + name]: kp.prometheusAdapter[name] for name in std.objectFields(kp.prometheusAdapter) } +
{ ['grafana-' + name]: kp.grafana[name] for name in std.objectFields(kp.grafana) }

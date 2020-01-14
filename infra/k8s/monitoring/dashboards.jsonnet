local g = import 'grafana-builder/grafana.libsonnet';

{
  grafanaDashboards+:: {
  'nats.json':
    g.dashboard('Nats / Nats-streaming')
      .addRow(
        g.row('OS Metrics')
          .addPanel(
            g.panel('Server CPU') +
            g.queryPanel(
              'gnatsd_varz_cpu',
              '{{ pod }} ({{ instance }})'
            ) +
            g.stack
          )
          .addPanel(
            g.panel('Server Memory') +
            g.queryPanel(
              'gnatsd_varz_mem',
              '{{ pod }} ({{ instance }})'
            ) +
            g.stack
          )
      )
      .addRow(
        g.row('Throughput')
          .addPanel(
            g.panel('Bytes In') +
            g.queryPanel(
              'rate(gnatsd_varz_in_bytes[1m])',
              '{{ pod }} ({{ instance }})'
            ) +
            g.stack
          )
          .addPanel(
            g.panel('NATS Msgs In') +
            g.queryPanel(
              'rate(gnatsd_varz_in_msgs[1m])',
              '{{ pod }} ({{ instance }})'
            ) +
            g.stack
          )
          .addPanel(
            g.panel('Bytes Out') +
            g.queryPanel(
              'rate(gnatsd_varz_out_bytes[1m])',
              '{{ pod }} ({{ instance }})'
            ) +
            g.stack
          )
          .addPanel(
            g.panel('NATS Msgs Out') +
            g.queryPanel(
              'rate(gnatsd_varz_out_msgs[1m])',
              '{{ pod }} ({{ instance }})'
            ) +
            g.stack
          )
      )
      .addRow(
        g.row('Client Metrics')
          .addPanel(
            g.panel('Connections') +
            g.queryPanel(
              'gnatsd_varz_connections',
              '{{ pod }} ({{ instance }})'
            ) +
            g.stack
          )
          .addPanel(
            g.panel('Subscriptions') +
            g.queryPanel(
              'gnatsd_varz_subscriptions',
              '{{ pod }} ({{ instance }})'
            ) +
            g.stack
          )
          .addPanel(
            g.panel('Slow Consumers') +
            g.queryPanel(
              'gnatsd_varz_slow_consumers',
              '{{ pod }} ({{ instance }})'
            ) +
            g.stack
          )
      )
      .addRow(
        g.row('NATS Streaming (Bytes/Sec)')
          .addPanel(
            g.panel('NATS Streaming Channels Bytes/Sec') +
            g.queryPanel(
              'sum(rate(nss_chan_bytes_total[1m])) by (channel) / 3',
              '{{ channel }}'
            ) +
            g.stack
          )
          .addPanel(
            g.panel('NATS Streaming Server Total Bytes/Sec') +
            g.queryPanel(
              'sum(rate(nss_server_bytes_total[1m])) by (instance)',
              '{{ instance }}'
            ) +
            g.stack
          )
      )
      .addRow(
        g.row('NATS Streaming (Msgs/Sec)')
          .addPanel(
            g.panel('NATS Streaming Channels Msgs/Sec') +
            g.queryPanel(
              'sum(rate(nss_chan_msgs_total[1m])) by (channel) / 3',
              '{{ channel }}'
            ) +
            g.stack
          )
          .addPanel(
            g.panel('NATS Streaming Server Total Msgs/Sec') +
            g.queryPanel(
              'round(sum(rate(nss_server_msgs_total[1m])) by (instance))',
              '{{ instance }}'
            ) +
            g.stack
          )
      )
  }
}

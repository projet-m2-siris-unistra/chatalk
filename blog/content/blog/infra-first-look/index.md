---
title: 'Infrastructure: first look'
date: '2019-10-20T19:23:03.000Z'
description: 'In this blog post we describe our current resources and deployement and what will happen later in our infrastructure.'
---

## Resources

We currently use university resources for our project.

We have three virtual machines (`balzac`, `camus` and `zola`) with following specifications:

- 4vCPU
- 4Go RAM
- 50Go disk space
- Ubuntu Server 18.04

## Current deployment

We decided to use [Ansible](https://www.ansible.com/) to configure our infrastructure through a SSH connection.

Using [Ansible](https://www.ansible.com/) allows us to have a reproducible and uniform deployment across all virtual machines.

For the moment our SSH keys are deployed, `sudo` is configured without password, some useful packages are installed and `zsh` is configured correctly.

A Kubernetes cluster is also deployed using [Kubespray](https://kubespray.io/), which is an [Ansible](https://www.ansible.com/) playbook to deploy a high-availability [Kubernetes](https://kubernetes.io) cluster quickly.

Our three virtual machines are the three nodes of the cluster.

The cluster is only available through the VPN of the university.

## What’s next?

For the moment the [Kubernetes](https://kubernetes.io) cluster is only configured to use IPv4.
We will see later how to configure it using IPv6.

We are waiting for a new IPv4 to setup [`metallb`](https://metallb.universe.tf/concepts/layer2/).

We will use [Kustomize](https://kustomize.io/) to have clean deployments for our [Kubernetes](https://kubernetes.io) cluster.
The goal is to automate the deployment of all the services in our cluster.

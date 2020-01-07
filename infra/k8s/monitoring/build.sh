#!/usr/bin/env bash

# This script uses arg $1 (name of *.jsonnet file to use) to generate the manifests/*.yaml files.

set -e
set -x
# only exit with zero if all commands of the pipeline exit successfully
set -o pipefail

# make sure to start with a clean 'manifests' dir
rm -rf manifests
mkdir -p manifests/setup

# generate yaml files, not json
jsonnet -J vendor -m manifests "${1-manifests.jsonnet}" | xargs -I{} sh -c 'cat {} | gojsontoyaml > {}.yaml; rm -f {}' -- {}

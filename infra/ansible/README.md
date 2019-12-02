# Preparation

## Kubespray

Fetch the Kubespray submodule:

```sh
git submodule update --init
```

Documentation: https://github.com/kubernetes-sigs/kubespray

## Python dependencies

Install pipenv on your local machine using for example `sudo apt install pipenv` if you are on Ubuntu.

Documentation: https://pipenv.kennethreitz.org/en/latest/.

To install all required python dependencies, you can use `pipenv install`.
It will install `ansible` and all required dependencies.
In case there were no `Pipfile`, you can generate one using: `pipenv install -r kubespray/requirements.txt`.

To activate the virtualenv, you will have to use `pipenv shell`.

## SSH configuration

You will need to connect using SSH to each of the hosts listed in `hosts.ini` to save their fingerprints on your machine.

Add your SSH public key in the `roles/common/files/public_keys` folder (create a new file).
Update the `roles/common/tasks/main.yaml` file to append the key file to the list of files to process in the first task.

## Check if it's working

Run the following command to check if all hosts are reacheable:

```sh
ansible all -m ping -i hosts.ini --ask-pass
```

It will be asked to enter the SSH password.

## First run

The first run will upload all public SSH keys that are in the repository and
setup `sudo` without password.

Use the following command to execute these actions:

```sh
ansible-playbook -i hosts.ini site.yaml --ask-pass --ask-become-pass --tags first-run
```

You will be asked for the SSH password.

After this step `--ask-pass` and `--ask-become-pass` won't be required anymore.


# Next runs

Get a `pipenv` shell using `pipvenv shell`.

Run the whole playbook using the following command:

```sh
ansible-playbook -i hosts.ini site.yaml --become
```

To run the Kubespray playbook:

```sh
ansible-playbook -i hosts.ini site.yaml --become --tags k8s
```


# Get the Kubernetes configuration file

To interact with the Kubernetes cluster, you will need a specific configuration file for `kubectl`.

To get it, there are two ways:
  - copy it from one VM using: `mkdir -p ~/.kube; ssh USER@VM_NAME -- sudo cat /etc/kubernetes/admin.conf > ~/.kube/config`
  - after lanching the playbook, you should have and `artifacts` folder with the configuration fil in it ; you just have to copy it like this: `mkdir -p ~/.kube; cp artifacts/admin.conf ~/.kube/config`.


# Reboot all VM

Only use if absolutely required.

To reboot all VM at the same time you can use the following command:

```sh
ansible all -i hosts.ini -m reboot --become
```

# Mark the `local-storage` storage class as default

Run the following command:

```sh
kubectl patch storageclass local-storage -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

# Generate certificates on `dumas`

The `dumas` Ansible role install all required stuff.

This part can only be done by the owner of the `chatalk.fr` domain.

SSH on the `dumas` VM and follow those instructions.

You will need to create a file named `cloudflare.ini` with following content:

```
# Cloudflare API credentials used by Certbot
dns_cloudflare_email = CLOUDFLARE_EMAIL
dns_cloudflare_api_key = CLOUDFLARE_API_KEY
```

and replace all `CLOUDFLARE_*` with your Cloudflare informations.

After that, you will need to run the following command to get the certificates:

```sh
certbot certonly \
  -m LE_EMAIL \
  --agree-tos \
  --dns-cloudflare \
  --dns-cloudflare-credentials cloudflare.ini \
  -d '*.chatalk.fr' \
  -d chatalk.fr
```

and replace `LE_EMAIL` with your email address for Let's Encrypt.

Keys will be stored here:
  - /etc/letsencrypt/live/chatalk.fr/fullchain.pem
  - /etc/letsencrypt/live/chatalk.fr/privkey.pem

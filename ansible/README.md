# Install Ansible

First of all, you will need to install Ansible.

```sh
sudo apt install ansible
```

or have a look at
https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html

# Config

Update your `~/.ssh/config` file so that you use the right user when trying to
connect to the hosts listed in the `hosts` file.


# Check if it's working

Run the following command to check if all hosts are reacheable:

```sh
ansible all -m ping -i hosts --ask-pass
```

It will be asked to enter the SSH password.


# First run

The first run will upload all public SSH keys that are in the repository and
setup `sudo` without password.

Use the following command to execute these actions:

```sh
ansible-playbook -i hosts site.yaml --ask-pass --ask-become-pass --tags first-run
```

You will be asked for the SSH password.

After this step `--ask-pass` and `--ask-become-pass` won't be required anymore.


# Reboot all VM

To reboot all VM at the same time you can use the following command:

```sh
ansible all -i hosts -m reboot --become
```

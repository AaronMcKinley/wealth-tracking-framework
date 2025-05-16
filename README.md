# Wealth Tracking Framework (WTF)

## macOS-Only Setup (for now)

This project is designed for macOS users only at this stage.

## Project Overview

The Wealth Tracking Framework is a full-stack, Dockerized investment tracking app built with:

* React frontend
* Node.js backend
* PostgreSQL database
* Cypress for end-to-end testing
* Jenkins for CI/CD automation
* Allure for test reporting
* Ansible for system automation and environment setup

Users can track a variety of investments: crypto, stocks, fixed savings, or even alternative assets like whiskey or property.

## Prerequisites

To run this project, you must have:

* A Mac running macOS 12 or later
* Homebrew installed
* Ansible installed (`brew install ansible`)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/wtf-wealth-tracking-framework.git
cd wtf-wealth-tracking-framework/ansible
```

### 2. Run the Setup Playbook

This will install all required packages, start Docker, and generate your `.env` file.

```bash
ansible-playbook -i inventory setup.yml --ask-vault-pass
```

### 3. Start the Full Stack

```bash
ansible-playbook start-locally.yml
```

### 4. Reset the Database (Optional)

If you need to reset and recreate the database schema:

```bash
ansible-playbook start-locally.yml -e reset_db=true
```

## Access the App

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:4000](http://localhost:4000)
- Jenkins: [http://localhost:8080](http://localhost:8080)
- Allure Report Viewer: [http://localhost:5252](http://localhost:5252)

## Ansible Vault

Ansible Vault is being used for secrets. The encrypted `secrets.yml` is used to dynamically generate the `.env` file during setup.

- No real secrets in `secrets.yml`
- Only use it for demo or development purposes
- The vault password must be known or securely stored elsewhere (not committed)

To edit the secrets:

```bash
ansible-vault edit secrets.yml
```

## Testing

- Cypress tests in the future

## Coming Soon

- OpenShift deployment support
- API authentication layer using JWT
- Investment filtering and analytics features  

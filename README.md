# Wealth Tracking Framework (WTF)

## Project Overview

The Wealth Tracking Framework is a full-stack, Dockerized investment tracking app for managing crypto, stocks, ETFs, fixed savings, and alternative assets like whiskey or property.

### Tech Stack

- **Frontend:** React + Tailwind CSS
- **Backend:** Node.js/Express
- **Database:** PostgreSQL
- **Infrastructure:** Docker Compose, Ansible
- **E2E Testing:** Cypress
- **CI/CD:** Jenkins
- **Test Reporting:** Allure

---

## Prerequisites

- macOS 12+ (for local dev)
- [Homebrew](https://brew.sh/)
- Ansible (`brew install ansible`)
- Docker Desktop (for local, not needed for server)
- SSH access for production server setup

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/AaronMcKinley/wealth-tracking-framework.git
cd wealth-tracking-framework/ansible
```

### 2. Run the Setup Playbook (Local macOS)

This installs required packages, starts Docker, and generates your `.env` file.

```bash
ansible-playbook -i inventory setup-darwin.yml --ask-vault-pass
```

### 3. Provision an Ubuntu Server (Production/Cloud)

Replace `<your-server-ip>` and `<path-to-your-ssh-key>`:

```bash
ansible-playbook -i <your-server-ip>, setup-ubuntu.yml --ask-vault-pass --ask-become-pass -u root --private-key <path-to-your-ssh-key>
```

### 4. Start the Full Stack (Local or Server)

**Local:**
```bash
ansible-playbook start-locally.yml
```
**Server:**  
(SSH into your server, then run Docker Compose or use the provided Ansible playbook.)

#### Reset the Database (Optional)

```bash
ansible-playbook start-locally.yml -e reset_db=true
```

---

## Access the App

### **Local Environment**

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **Jenkins:** http://localhost:8080
- **Allure Report Viewer:** http://localhost:5252

### **Production/Server Environment**

- **Frontend:** https://wealth-tracking-framework.com
- **Jenkins:** https://jenkins.wealth-tracking-framework.com

*Note: The API is proxied under `/api` on the production frontend URL.*

---

## Ansible Vault

Secrets are encrypted in `secrets.yml` and used to generate the `.env` file during setup.  
No real credentials are ever committed.

Edit secrets with:

```bash
ansible-vault edit secrets.yml
```

---

## Testing

- Cypress E2E tests (work in progress)
- Jenkins CI pipeline (auto-builds, E2E tests, and Allure reporting)

---

## Coming Soon

- Investment filtering and analytics features
- Custom investment types and asset classes
- Portfolio visualizations
- More robust test coverage

---

## Contributing

Open to PRs! Please file issues or reach out via [GitHub Issues](https://github.com/AaronMcKinley/wealth-tracking-framework/issues).

---


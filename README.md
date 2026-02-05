### Tridz Pos

Tridz POS is a custom Point of Sale application built on the Frappe Framework, designed for efficient retail sales management, particularly in environments like small shops or minimarts. It integrates seamlessly with ERPNext for inventory, customer tracking, and financial syncing.

### Installation

You can install this app using the [bench](https://github.com/frappe/bench) CLI:

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app $URL_OF_THIS_REPO --branch develop
bench install-app tridz_pos
```

### Contributing

This app uses `pre-commit` for code formatting and linting. Please [install pre-commit](https://pre-commit.com/#installation) and enable it for this repository:

```bash
cd apps/tridz_pos
pre-commit install
```

Pre-commit is configured to use the following tools for checking and formatting your code:

- ruff
- eslint
- prettier
- pyupgrade
### CI

This app can use GitHub Actions for CI. The following workflows are configured:

- CI: Installs this app and runs unit tests on every push to `develop` branch.
- Linters: Runs [Frappe Semgrep Rules](https://github.com/frappe/semgrep-rules) and [pip-audit](https://pypi.org/project/pip-audit/) on every pull request.


### License

mit

##  Project Overview
- **App Name:** Tridz POS  
- **Framework:** Frappe Framework v16  
- **ERP:** ERPNext v16 (POS module)  
- **Frontend Route:** `/pos`  
- **Architecture:** Backend (Frappe) + Custom React Frontend  

Tridz POS is designed for **real-world cashier usage**, optimized for **mobile devices**, touch interaction, and speed.

---

## Core Principles
- Mobile-first UI
- Uses **only ERPNext standard doctypes**
- Uses **Resource APIs (`frappe-js-sdk`) only**

## Tech Stack

### Frontend
- **React**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **shadcn/ui**
- **Zustand** (state management)
- **frappe-js-sdk** (API communication)
- **Yarn** (package manager)
### Backend
- **Frappe Framework v16**
- **ERPNext v16 POS module**

## Styling
- Single source of truth: src/index.css
- Uses CSS variables (HSL) compatible with shadcn
- Supports Light & Dark mode

## ERPNext Integration
Tridz POS uses standard ERPNext doctypes, including:

- POS Profile
- POS Opening Entry
- POS Invoice
- Sales Invoice
- Item
- Item Price
- Customer
- Mode of Payment

## Permissions & Roles
- Uses existing ERPNext roles only 

## Printing
- Uses ERPNext print formats (POS Invoice)
- Frontend triggers print using ERPNext document routes

## Key Features
- POS Invoice Creation
- Payment Processing
- Customer Management
- Item Management
- Print Invoices
- POS Opening/Closing



3. Run Frappe server:
```bash
bench start
```

4. Open the app:
```
http://localhost:3000/pos

## Build
```
cd tridz_pos/frontend
yarn install
yarn dev
```
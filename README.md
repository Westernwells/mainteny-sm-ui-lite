# SERVICE MANAGER UI - LITE

[![React.Js](https://badgen.net/badge/React.Js/latest/cyan)](https://reactjs.org/)
[![TypeScript](https://badgen.net/badge/TypeScript/latest/cyan)](https://www.typescriptlang.org/)

Service Manager UI Lite (`SMUI-Lite`) is built using the latest version of React.js and is the minified version of the Service Manager UI (`SM UI`).

---

## Description

Service Manager also known as Mainteny Manager is the unified application made for Service Managers with smart job assignments, real-time overview of units under maintenance, and out-of-the-box ERP integrations. `SMUI-Lite` is built to eventually replace the old `SM UI` which is currently using Angular.js.

## Continuous Delivery

Developer Testing: [staging.mainteny.com/sm-lite-test](https://staging.mainteny.com/sm-lite-test)

Staging: [staging.mainteny.com/sm-lite](https://staging.mainteny.com/sm-lite/)

Production: [app.mainteny.com/sm-lite](https://app.mainteny.com/sm/)

## Installation

To make it easy for you to get started with Development, here's a list of recommended next steps.

### 1. Cloning this repository

```bash
git clone git@gitlab.com:mainteny/applications/sm-ui-lite.git;
cd sm-ui-lite
```

### 2. Installing dependencies

```bash
npm install
```

### 3. Development server

```bash
npm run start
```

### Available Scripts

In the project directory, you can run:

#### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

#### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

#### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

## Roadmap

- Employees Management - Allowing service managers to have an overview of technicians, their availability, holidays, working hours etc.
- Invoice Creation workflow - Allowing service managers to verify details and create invoices out of a completed order.
- Service Orders & Scheduling - Allowing service managers to schedule incoming orders and have an overview of the automated schedule provided by Mainteny's algorithm. The service orders will also be presented in a swimlane view for better UX.
- KPI Dashboard - A home/dashboard page for service managers to be informed about their key KPIs and action items. They include order completion metrics, to-dos etc.
- Proposals and Proposal Creation workflow - Proposals are an important way for service managers to convice customers and get revenue. These proposals could ideally be for a repair work.


## Contributing

Please create a branch out of main for any contributions and send a merge request to the frontend team (Ayo & Suraj).

## Project status

This project is currently active and owned by [Mainteny AS](https://mainteny.com/)

---

©2022 Mainteny. All rights reserved.

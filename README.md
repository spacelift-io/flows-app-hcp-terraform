# HCP Terraform Flows App

A comprehensive Flows app for managing HashiCorp Cloud Platform (HCP) Terraform resources via the Terraform Cloud API.

## Features

### Workspace Management

- List, create, update, delete workspaces
- Lock/unlock workspaces
- Get current state version and outputs

### Project Management

- List, create, show, update, delete projects

### Run Management

- Create, show, apply, discard, cancel runs
- View plan and apply details
- List runs in workspace

### State Management

- List state version outputs
- Show current state outputs
- List workspace resources

### Variable Management

- Create, list, update, delete workspace variables
- Create, update, delete variable sets
- Manage variables within variable sets

### Configuration Management

- Create configuration versions
- Upload configuration files

## Configuration

The app requires:

- **Organization Name** - Your HCP Terraform organization
- **API Token** - HCP Terraform API token with appropriate permissions
- **API Endpoint** - Defaults to `https://app.terraform.io/api/v2`

## Usage

Configure the app with your HCP Terraform credentials, then use the available blocks to automate your Terraform Cloud workflows through Flows.

## Development

```bash
npm install          # Install dependencies
npm run typecheck    # Type checking
npm run format       # Code formatting
npm run bundle       # Bundle for deployment
```

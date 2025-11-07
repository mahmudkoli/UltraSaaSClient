# Tenant and Institute Features Implementation

This document outlines the complete implementation of tenant and institute management features for the UltraSaaS Client application.

## Overview

The implementation provides a comprehensive multi-tenant system with institute management capabilities, including:

-   **Tenant Management**: Create, edit, activate/deactivate tenants with permission management
-   **Institute Management**: Create, edit, activate/deactivate institutes within tenants
-   **Feature Management**: Assign and manage features per tenant
-   **Modern UI**: Material Design components with responsive layouts

## Architecture

### Core Services

#### 1. Tenant Service (`src/app/core/tenants/`)

-   **`tenants.service.ts`**: Main service for tenant operations
-   **`tenants.types.ts`**: TypeScript interfaces for tenant data

**Key Features:**

-   CRUD operations for tenants
-   Tenant activation/deactivation
-   Subscription management
-   Permission management
-   Combined tenant + institute creation

#### 2. Institute Service (`src/app/core/institutes/`)

-   **`institutes.service.ts`**: Main service for institute operations
-   **`institutes.types.ts`**: TypeScript interfaces for institute data

**Key Features:**

-   CRUD operations for institutes
-   Institute activation/deactivation
-   Setup completion tracking
-   Filtering and search capabilities

#### 3. Feature Service (`src/app/core/features/`)

-   **`features.service.ts`**: Service for feature management
-   **`features.types.ts`**: TypeScript interfaces for feature data

**Key Features:**

-   Feature assignment to tenants
-   Enable/disable features per tenant
-   Feature status tracking

### Admin Components

#### 1. Tenant Management (`src/app/modules/admin/tenant/`)

**Components:**

-   **`tenant-list.component.ts/html`**: List all tenants with management actions
-   **`tenant-form.component.ts/html`**: Create/edit tenant forms
-   **`tenant-permissions.component.ts/html`**: Manage tenant permissions
-   **`tenant.routes.ts`**: Routing configuration

**Features:**

-   View all tenants in a responsive table
-   Create new tenants with validation
-   Edit existing tenant configurations
-   Activate/deactivate tenants
-   Manage tenant-specific permissions
-   Upgrade tenant subscriptions

#### 2. Institute Management (`src/app/modules/admin/institute/`)

**Components:**

-   **`institute-list.component.ts/html`**: List all institutes with management actions
-   **`institute-form.component.ts/html`**: Create/edit institute forms
-   **`institute.routes.ts`**: Routing configuration

**Features:**

-   View all institutes in a responsive table
-   Create new institutes with comprehensive configuration
-   Edit existing institute settings
-   Activate/deactivate institutes
-   Complete institute setup process
-   Delete institutes with confirmation

## API Integration

### Base API Service

All services extend `BaseApiService` which provides:

-   Automatic authentication header management
-   Tenant ID header injection
-   Error handling
-   HTTP method wrappers (GET, POST, PUT, DELETE)

### Endpoints Implemented

#### Tenant Endpoints:

-   `GET /api/tenants` - Get all tenants
-   `POST /api/tenants` - Create tenant
-   `GET /api/tenants/{id}` - Get tenant details
-   `POST /api/tenants/{id}/activate` - Activate tenant
-   `POST /api/tenants/{id}/deactivate` - Deactivate tenant
-   `POST /api/tenants/{id}/upgrade` - Upgrade subscription
-   `GET /api/tenants/{id}/permissions` - Get tenant permissions
-   `PUT /api/tenants/{id}/permissions` - Update tenant permissions
-   `POST /api/tenants/with-institute` - Create tenant with institute

#### Institute Endpoints:

-   `GET /api/institute` - Get all institutes (with filtering)
-   `POST /api/institute` - Create institute
-   `GET /api/institute/{id}` - Get institute details
-   `PUT /api/institute/{id}` - Update institute
-   `DELETE /api/institute/{id}` - Delete institute
-   `POST /api/institute/{id}/activate` - Activate institute
-   `POST /api/institute/{id}/deactivate` - Deactivate institute
-   `POST /api/institute/{id}/complete-setup` - Complete setup

#### Feature Endpoints:

-   `POST /api/feature` - Create feature
-   `POST /api/feature/assign` - Assign feature to tenant
-   `GET /api/feature/tenant/{tenantId}` - Get tenant features
-   `POST /api/feature/tenant/{tenantId}/features/{featureId}/enable` - Enable feature
-   `POST /api/feature/tenant/{tenantId}/features/{featureId}/disable` - Disable feature

## Data Models

### Tenant Models

```typescript
interface TenantDto {
    id: string;
    name: string;
    connectionString?: string;
    adminEmail: string;
    url: string;
    isShared: boolean;
    isActive: boolean;
    validUpto: string;
    issuer?: string;
}

interface CreateTenantRequest {
    id: string;
    name: string;
    connectionString?: string;
    adminEmail: string;
    url?: string;
    isShared?: boolean;
    issuer?: string;
}

interface TenantWithPermissionsDto extends TenantDto {
    permissions?: string[];
}
```

### Institute Models

```typescript
interface InstituteDto {
    id: string;
    name: string;
    code: string;
    description?: string;
    address?: string;
    phone?: string;
    logo?: string;
    tenantId: string;
    type: string;
    isActive: boolean;
    status: string;
    setupCompletedOn?: string;
    setupCompletedBy?: string;
    maxStudents?: number;
    maxTeachers?: number;
    timeZone?: string;
    currency?: string;
    language?: string;
    createdOn: string;
    createdBy?: string;
    lastModifiedOn?: string;
    lastModifiedBy?: string;
}
```

### Feature Models

```typescript
interface TenantFeatureDto {
    tenantId: string;
    featureId: string;
    featureName: string;
    featureCode: string;
    featureDescription: string;
    isEnabled: boolean;
    enabledOn?: string;
    disabledOn?: string;
    enabledBy?: string;
    disabledBy?: string;
    createdOn: string;
    createdBy?: string;
    lastModifiedOn?: string;
    lastModifiedBy?: string;
}
```

## UI Features

### Modern Design

-   **Material Design**: Consistent with Angular Material components
-   **Responsive Layout**: Works on desktop, tablet, and mobile
-   **Dark/Light Theme**: Supports theme switching
-   **Loading States**: Progress indicators for all async operations
-   **Error Handling**: User-friendly error messages and confirmations

### User Experience

-   **Intuitive Navigation**: Clear breadcrumbs and navigation
-   **Form Validation**: Real-time validation with helpful error messages
-   **Confirmation Dialogs**: Safe deletion and critical action confirmations
-   **Bulk Actions**: Select all/deselect all for permissions
-   **Search and Filter**: Advanced filtering capabilities
-   **Empty States**: Helpful guidance when no data exists

### Key UI Components

-   **Data Tables**: Sortable, filterable tables with actions
-   **Forms**: Comprehensive forms with validation
-   **Cards**: Information display with actions
-   **Menus**: Context menus for actions
-   **Progress Indicators**: Loading and progress states
-   **Notifications**: Success/error feedback

## Security Features

### Authentication

-   Bearer token authentication
-   Automatic token injection in headers
-   Session management

### Authorization

-   Tenant-based access control
-   Permission-based feature access
-   Role-based UI visibility

### Data Protection

-   Input validation and sanitization
-   CSRF protection
-   XSS prevention

## Usage Instructions

### Accessing Tenant Management

1. Navigate to `/admin/tenant`
2. View all tenants in the list
3. Use "Create Tenant" button to add new tenants
4. Click actions menu for edit, permissions, activate/deactivate

### Accessing Institute Management

1. Navigate to `/admin/institute`
2. View all institutes in the list
3. Use "Create Institute" button to add new institutes
4. Click actions menu for edit, activate/deactivate, complete setup

### Managing Permissions

1. Navigate to a tenant's permissions page
2. Use "Select All" or "Deselect All" for bulk operations
3. Toggle individual permissions as needed
4. Save changes to update tenant permissions

## Configuration

### Environment Setup

Ensure the following environment variables are configured:

-   `apiUrl`: Backend API base URL
-   Authentication settings
-   Feature flags

### Dependencies

The implementation requires:

-   Angular Material
-   Fuse UI components
-   Transloco for internationalization
-   RxJS for reactive programming

## Future Enhancements

### Planned Features

1. **Advanced Filtering**: More sophisticated search and filter options
2. **Bulk Operations**: Multi-select and bulk actions
3. **Audit Logging**: Track all changes and actions
4. **Reporting**: Analytics and reporting features
5. **Import/Export**: Data import and export capabilities
6. **Workflow Management**: Approval workflows for tenant creation
7. **Billing Integration**: Subscription and billing management
8. **API Rate Limiting**: Tenant-specific rate limiting

### Technical Improvements

1. **Caching**: Implement caching for better performance
2. **Real-time Updates**: WebSocket integration for live updates
3. **Offline Support**: Service worker for offline capabilities
4. **Progressive Web App**: PWA features for mobile experience
5. **Micro-frontends**: Modular architecture for scalability

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Check token validity and expiration
2. **Permission Denied**: Verify user has required permissions
3. **API Errors**: Check network connectivity and API status
4. **Form Validation**: Ensure all required fields are filled

### Debug Information

-   Check browser console for error messages
-   Verify API endpoints are accessible
-   Confirm tenant ID is properly set in headers
-   Validate form data before submission

## Support

For technical support or questions about the implementation:

1. Check the API documentation
2. Review the component source code
3. Consult the Angular Material documentation
4. Contact the development team

---

This implementation provides a solid foundation for multi-tenant SaaS management with comprehensive institute support, modern UI, and robust security features.

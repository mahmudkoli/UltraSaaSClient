import { Routes } from '@angular/router';
import { PosLayoutDispatcherComponent } from './pos-layout-dispatcher.component';

// `/pos` routes through the dispatcher, which picks the actual layout
// component based on the current tenant's `posLayout` config. See
// pos-layout-registry.ts for the mapping + how to add a new layout.
export default [{ path: '', component: PosLayoutDispatcherComponent }] as Routes;

import { NgForOf, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { TenantService } from 'app/core/tenant/tenant.service';
import { TenantThemeService } from 'app/core/tenant/tenant-theme.service';
import { environment } from 'environments/environment';

interface DemoLogin {
    tenant: string;
    label: string;
    email: string;
    password: string;
}

// Demo schools seeded on first boot (DatabaseInitializer + MultitenancyConstants).
// Admin login password is MultitenancyConstants.DefaultPassword.
const DEMO_LOGINS: DemoLogin[] = [
    { tenant: 'root',       label: 'Root (platform admin)',          email: 'admin@root.com',       password: '123Pa$$word!' },
    { tenant: 'greenwood',  label: 'Greenwood Textiles Ltd (Starter)', email: 'admin@greenwood.com',  password: '123Pa$$word!' },
    { tenant: 'techvalley', label: 'TechValley Software Ltd (Pro)',   email: 'admin@techvalley.com', password: '123Pa$$word!' },
];

@Component({
    selector     : 'auth-sign-in',
    templateUrl  : './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations,
    standalone   : true,
    imports      : [RouterLink, FuseAlertComponent, NgIf, NgForOf, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressSpinnerModule, MatSelectModule],
})
export class AuthSignInComponent implements OnInit
{
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: '',
    };
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;

    // Tenant UX state
    showTenantField: boolean = true;
    resolvedTenantName: string | null = null;

    // Demo-tenant quick-fill (gated by environment.demoLogins — off for real-data deploys)
    readonly demoLoginsEnabled: boolean = environment.demoLogins === true;
    readonly demoLogins: DemoLogin[] = DEMO_LOGINS;
    selectedDemo: string = 'root';

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _tenantService: TenantService,
        private _tenantThemeService: TenantThemeService,
    )
    {
    }

    ngOnInit(): void
    {
        // Resolve tenant automatically
        const autoTenant = this._tenantService.resolve();
        this.showTenantField = this._tenantService.showTenantField;
        this.resolvedTenantName = autoTenant;

        this.signInForm = this._formBuilder.group({
            tenant    : [autoTenant || 'root', [Validators.required]],
            email     : ['admin@root.com', [Validators.required, Validators.email]],
            password  : ['123Pa$$word!', Validators.required],
            rememberMe: [''],
        });

        // Pre-fill the demo-login dropdown from the resolved subdomain so visiting
        // edu-greenwood.mkcorex.com lands on Greenwood with email + password ready.
        // Falls back to root when the subdomain doesn't map to a seeded demo.
        if (this.demoLoginsEnabled) {
            const matched = autoTenant && DEMO_LOGINS.some(d => d.tenant === autoTenant);
            this.applyDemoLogin(matched ? autoTenant : 'root');
        }

        // Load and apply tenant theme (cached first, then API)
        if (autoTenant) {
            this._tenantThemeService.loadAndApply();
        }
    }

    applyDemoLogin(tenantId: string): void
    {
        const preset = DEMO_LOGINS.find(d => d.tenant === tenantId);
        if (!preset) { return; }
        this.selectedDemo = tenantId;
        this.signInForm.patchValue({
            tenant  : preset.tenant,
            email   : preset.email,
            password: preset.password,
        });
    }

    /**
     * Show the tenant field (when user clicks "Switch organization")
     */
    switchTenant(): void
    {
        this._tenantService.clear();
        this.showTenantField = true;
        this.resolvedTenantName = null;
        this.signInForm.get('tenant').setValue('');
    }

    /**
     * Sign in
     */
    signIn(): void
    {
        if (this.signInForm.invalid)
        {
            return;
        }

        this.signInForm.disable();
        this.showAlert = false;

        // Store tenant ID
        const tenantId = this.signInForm.get('tenant').value;
        this._tenantService.save(tenantId);
        this._authService.setTenantId(tenantId);

        const rememberMe = this.signInForm.get('rememberMe').value;
        if (rememberMe) {
            localStorage.setItem('remember_me', 'true');
        } else {
            localStorage.removeItem('remember_me');
        }

        const loginRequest = {
            email: this.signInForm.get('email').value,
            password: this.signInForm.get('password').value
        };

        this._authService.login(loginRequest)
            .subscribe({
                next: () => {
                    // Apply tenant theme after successful login
                    this._tenantThemeService.loadAndApply();

                    const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';
                    this._router.navigateByUrl(redirectURL);
                },
                error: (error) => {
                    this.signInForm.enable();
                    // BUG-R6/R7 — do NOT resetForm() here. Wiping the fields on a
                    // failed login (combined with mat-select not re-emitting on a
                    // same-value re-select) left users with empty fields and caused
                    // cascading empty-payload submits that locked the account.
                    this.alert = {
                        type   : 'error',
                        message: this.friendlyAuthError(error),
                    };
                    this.showAlert = true;
                }
            });
    }

    /**
     * BUG-R5/ENH-R6 — turn the raw HttpErrorResponse into a human message.
     * Prefer a backend-supplied message (e.g. a lockout notice); otherwise map
     * by status. Never surface "Http failure response for ...".
     */
    private friendlyAuthError(error: any): string
    {
        if (error?.status === 0) {
            return 'Cannot reach the server. Please check your connection and try again.';
        }
        const body = error?.error;
        const fromBody = body?.messages?.length ? body.messages.join(' ')
            : (typeof body?.exception === 'string' ? body.exception
            : (typeof body === 'string' && body.trim() && !body.trim().startsWith('<') ? body : null));
        if (fromBody && !/^Http failure/i.test(fromBody)) {
            return fromBody;
        }
        if (error?.status === 423) {
            return 'Your account is temporarily locked due to repeated failed attempts. Please try again later or contact your administrator.';
        }
        if (error?.status === 401 || error?.status === 400) {
            return 'Invalid email or password.';
        }
        return 'Sign-in failed. Please try again.';
    }
}

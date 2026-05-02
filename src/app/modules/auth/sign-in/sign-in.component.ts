import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { TenantService } from 'app/core/tenant/tenant.service';
import { TenantThemeService } from 'app/core/tenant/tenant-theme.service';

@Component({
    selector     : 'auth-sign-in',
    templateUrl  : './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations,
    standalone   : true,
    imports      : [RouterLink, FuseAlertComponent, NgIf, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressSpinnerModule],
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

        // Load and apply tenant theme (cached first, then API)
        if (autoTenant) {
            this._tenantThemeService.loadAndApply();
        }
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

                    // Force-change-password takes priority over any deep-link
                    // redirect — the server already issued a JWT but the user
                    // is on a seed password and needs to rotate before the
                    // session is "real."
                    if (this._authService.mustChangePasswordFromToken())
                    {
                        this._router.navigate(['/profile'], { queryParams: { force_password_change: 'true' } });
                        return;
                    }

                    const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';
                    this._router.navigateByUrl(redirectURL);
                },
                error: (error) => {
                    this.signInForm.enable();
                    this.signInNgForm.resetForm();

                    this.alert = {
                        type   : 'error',
                        message: error.message || 'Wrong email or password',
                    };
                    this.showAlert = true;
                }
            });
    }
}

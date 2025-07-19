import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserService } from './core/user/user.service';

@Component({
    selector   : 'app-root',
    templateUrl: './app.component.html',
    styleUrls  : ['./app.component.scss'],
    standalone : true,
    imports    : [RouterOutlet],
})
export class AppComponent implements OnInit
{
    /**
     * Constructor
     */
    constructor(private _userService: UserService)
    {
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Initialize user data from token if available
        this._userService.initializeUserFromToken();
    }
}

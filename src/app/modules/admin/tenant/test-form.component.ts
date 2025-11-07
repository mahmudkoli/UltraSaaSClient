import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'test-form',
    template: `
        <div class="p-8">
            <h1 class="text-2xl font-bold mb-4">Test Form Component</h1>
            <p>This is a test component to verify routing is working.</p>
            <button class="bg-blue-500 text-white px-4 py-2 rounded">Test Button</button>
        </div>
    `,
    standalone: true,
    imports: [CommonModule]
})
export class TestFormComponent {
    constructor() {
        console.log('TestFormComponent loaded!');
    }
} 
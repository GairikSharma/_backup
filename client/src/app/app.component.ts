import { Component } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { RouterOutlet } from '@angular/router';

import { ApiService, Contribution } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,

  imports: [RouterOutlet, ReactiveFormsModule],

  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'client';

  contributionForm: FormGroup;

  submitted = false;
  isSubmitting = false;

  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
  ) {
    this.contributionForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],

      email: ['', [Validators.required, Validators.email]],

      contributedAmount: ['', [Validators.required, Validators.min(1)]],

      date: ['', Validators.required],
    });
  }

  get f() {
    return this.contributionForm.controls;
  }

  isInvalid(field: string): boolean {
    const control = this.contributionForm.get(field);

    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  submitForm(): void {
    this.submitted = true;

    // Stop if form is invalid
    if (this.contributionForm.invalid) {
      this.contributionForm.markAllAsTouched();

      return;
    }

    this.isSubmitting = true;

    this.successMessage = '';
    this.errorMessage = '';

    // Prepare request payload
    const contribution: Contribution = {
      name: this.contributionForm.value.name,

      email: this.contributionForm.value.email,

      contributedAmount: Number(this.contributionForm.value.contributedAmount),

      date: this.contributionForm.value.date,
    };

    // Send data to Render backend
    this.apiService.createContribution(contribution).subscribe({
      next: (response) => {
        console.log('Contribution created successfully:', response);

        this.isSubmitting = false;

        this.successMessage = 'Contribution recorded successfully.';

        this.errorMessage = '';

        // Reset form
        this.contributionForm.reset();

        this.submitted = false;
      },

      error: (error) => {
        console.error('Error creating contribution:', error);

        this.isSubmitting = false;

        this.errorMessage = 'Unable to record contribution. Please try again.';

        this.successMessage = '';
      },
    });
  }
}

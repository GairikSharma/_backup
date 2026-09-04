import { Component } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { RouterOutlet } from '@angular/router';

import {
  ApiService,
  ContributionRequest,
  PaymentVerificationResponse
} from './services/api.service';
import { environment } from '../environments/environment';

declare var Razorpay: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ReactiveFormsModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  title = 'client';

  contributionForm: FormGroup;

  submitted = false;

  isSubmitting = false;

  isPaying = false;

  paymentCompleted = false;

  saveCompleted = false;

  paymentDetails: {
    name: string;
    email: string;
    amount: number;
    date: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
  } | null = null;

  successMessage = '';

  errorMessage = '';

  adminModalOpen = false;

  adminCode = '';

  adminErrorMessage = '';

  isAdmin = false;

  isCheckingAdmin = false;

  saveWithoutPayment = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {

    const currentDate = new Date();
    const formattedDate = [
      currentDate.getFullYear(),
      String(currentDate.getMonth() + 1).padStart(2, '0'),
      String(currentDate.getDate()).padStart(2, '0')
    ].join('-');

    this.contributionForm =
      this.fb.group({

        name: [
          '',
          [
            Validators.required,
            Validators.minLength(2)
          ]
        ],

        email: [
          '',
          [
            Validators.required,
            Validators.email
          ]
        ],

        contributedAmount: [
          '',
          [
            Validators.required,
            Validators.min(1)
          ]
        ],

        date: [
          formattedDate,
          Validators.required
        ]

      });
  }

  get f() {
    return this.contributionForm.controls;
  }

  isInvalid(field: string): boolean {

    const control =
      this.contributionForm.get(field);

    return !!(
      control &&
      control.invalid &&
      (
        control.dirty ||
        control.touched
      )
    );
  }

  openAdminModal(): void {
    this.adminCode = '';
    this.errorMessage = '';
    this.adminErrorMessage = '';
    this.adminModalOpen = true;
  }

  closeAdminModal(): void {
    if (!this.isCheckingAdmin) {
      this.adminModalOpen = false;
    }
  }

  toggleSaveWithoutPayment(enabled: boolean): void {
    this.saveWithoutPayment = enabled;

    if (!enabled) {
      this.saveCompleted = false;
      this.successMessage = '';
      this.errorMessage = '';
    }
  }

  checkAdminAccess(): void {
    if (!this.adminCode.trim()) {
      this.adminErrorMessage = 'Please enter the admin code.';
      return;
    }

    this.isCheckingAdmin = true;
    this.adminErrorMessage = '';

    this.apiService.checkIsAdmin(this.adminCode.trim()).subscribe({
      next: (isAdmin) => {
        this.isCheckingAdmin = false;

        if (isAdmin) {
          this.isAdmin = true;
          this.adminModalOpen = false;
          return;
        }

        this.adminErrorMessage = 'Invalid admin code.';
      },
      error: () => {
        this.isCheckingAdmin = false;
        this.adminErrorMessage =
          'Unable to verify admin access. Please try again.';
      }
    });
  }

  saveWithoutPaymentNow(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.paymentCompleted = false;
    this.saveCompleted = false;
    this.paymentDetails = null;

    if (!this.isAdmin || !this.saveWithoutPayment) {
      this.errorMessage = 'Admin access is required to save without payment.';
      return;
    }

    if (this.contributionForm.invalid) {
      this.contributionForm.markAllAsTouched();
      return;
    }

    const contribution: ContributionRequest = {
      name: this.contributionForm.value.name,
      email: this.contributionForm.value.email,
      amount: Number(this.contributionForm.value.contributedAmount),
      date: this.contributionForm.value.date
    };

    this.isSubmitting = true;

    this.apiService.saveContribution(contribution).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.saveCompleted = true;
        this.successMessage =
          'Your record was saved successfully without payment.';
        this.contributionForm.reset();
        this.submitted = false;
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Unable to save the contribution. Please try again.';
      }
    });
  }

  /**
   * Start Razorpay payment
   */
  payNow(): void {

    this.submitted = true;

    this.successMessage = '';
    this.errorMessage = '';
    this.paymentCompleted = false;
    this.saveCompleted = false;
    this.paymentDetails = null;

    /*
     * Validate form
     */
    if (this.contributionForm.invalid) {

      this.contributionForm.markAllAsTouched();

      return;
    }

    const amount =
      Number(
        this.contributionForm.value
          .contributedAmount
      );

    /*
     * Validate amount
     */
    if (
      !amount ||
      amount <= 0 ||
      !Number.isFinite(amount)
    ) {

      this.errorMessage =
        'Please enter a valid contribution amount.';

      return;
    }

    this.isPaying = true;

    /*
     * Create Razorpay order
     */
    this.apiService
      .createRazorpayOrder(amount)
      .subscribe({

        next: (order) => {

          console.log(
            'Razorpay order created:',
            order
          );

          const options = {

            /*
             * IMPORTANT:
             * Use your Razorpay TEST key ID here.
             *
             * It must belong to the same Razorpay
             * test account used by your backend secret.
             */
            key: environment.razorpayKeyId,

            amount: order.amount,

            currency: order.currency,

            name: 'Proyash',

            description:
              'Proyash Contribution',

            order_id: order.orderId,

            prefill: {

              name:
                this.contributionForm.value.name,

              email:
                this.contributionForm.value.email

            },

            theme: {
              color: '#3399cc'
            },

            handler: (response: any) => {

              console.log(
                'Razorpay payment successful:',
                response
              );

              this.verifyPayment(response);
            },

            modal: {

              ondismiss: () => {

                console.log(
                  'Razorpay checkout closed'
                );

                this.isPaying = false;
              }

            }
          };

          /*
           * Open Razorpay Checkout
           */
          const razorpay =
            new Razorpay(options);

          razorpay.open();
        },

        error: (error) => {

          console.error(
            'Error creating Razorpay order:',
            error
          );

          this.isPaying = false;

          this.errorMessage =
            'Unable to start payment. Please try again.';
        }

      });
  }

  /**
   * Verify Razorpay payment
   *
   * Backend will:
   *
   * 1. Verify Razorpay signature
   * 2. Save contribution to DB
   * 3. Return success
   */
  verifyPayment(response: any): void {

    this.isPaying = true;

    this.isSubmitting = true;

    this.successMessage = '';

    this.errorMessage = '';

    const name =
      this.contributionForm.value.name;

    const email =
      this.contributionForm.value.email;

    const amount =
      Number(
        this.contributionForm.value
          .contributedAmount
      );

    const date =
      this.contributionForm.value.date;

    const verificationData = {

      razorpay_order_id:
        response.razorpay_order_id,

      razorpay_payment_id:
        response.razorpay_payment_id,

      razorpay_signature:
        response.razorpay_signature,

      name: name,

      email: email,

      amount: amount,

      date: date
    };

    console.log(
      'Sending payment verification to backend'
    );

    this.apiService
      .verifyPayment(verificationData)
      .subscribe({

        next: (result) => {

          this.paymentDetails = {
            name: name,
            email: email,
            amount: amount,
            date: date,
            razorpayOrderId: result.razorpayOrderId,
            razorpayPaymentId: result.razorpayPaymentId
          };

          console.log(
            'Payment verified and contribution saved:',
            result
          );

          this.isPaying = false;

          this.isSubmitting = false;

          this.paymentCompleted = true;

          this.successMessage =
            'Your contribution has been recorded successfully!';

          this.errorMessage = '';

          /*
           * Reset form after successful DB save
           */
          this.contributionForm.reset();

          this.submitted = false;

          /*
           * Hide success message after 5 seconds
           */
          setTimeout(() => {

            this.successMessage = '';

            this.paymentCompleted = false;

          }, 5000);
        },

        error: (error) => {

          console.error(
            'Payment verification failed:',
            error
          );

          this.isPaying = false;

          this.isSubmitting = false;

          this.paymentCompleted = false;

          this.successMessage = '';

          this.errorMessage =
            'Payment verification failed. Please contact us if money was deducted.';
        }

      });
  }
}

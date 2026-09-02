import { Component } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { RouterOutlet } from '@angular/router';

import {
  ApiService
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

  successMessage = '';

  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {

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
          '',
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

  /**
   * Start Razorpay payment
   */
  payNow(): void {

    this.submitted = true;

    this.successMessage = '';
    this.errorMessage = '';
    this.paymentCompleted = false;

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

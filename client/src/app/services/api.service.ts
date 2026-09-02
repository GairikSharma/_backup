import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RazorpayOrder {
  amount: number;
  orderId: string;
  currency: string;
}

export interface PaymentVerificationRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;

  name: string;
  email: string;
  amount: number;
  date: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly baseUrl =
    'https://proyash-backup-data1.onrender.com/api';

  constructor(
    private http: HttpClient
  ) {}

  /**
   * Create Razorpay order
   */
  createRazorpayOrder(
    amount: number
  ): Observable<RazorpayOrder> {

    return this.http.post<RazorpayOrder>(
      `${this.baseUrl}/payment/create-order`,
      {
        amount: amount
      }
    );
  }

  /**
   * Verify payment and save contribution
   */
  verifyPayment(
    payment: PaymentVerificationRequest
  ): Observable<PaymentVerificationResponse> {

    return this.http.post<PaymentVerificationResponse>(
      `${this.baseUrl}/payment/verify`,
      payment
    );
  }
}

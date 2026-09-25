import { env } from "src/lib/env";
import { InitiatePayment, InitiatePaymentResponse, CardPaymentResponse, CheckPaymentStatusResponse, PaymentGateway } from "./dtos";
import { BadRequestException } from "@nestjs/common";

export class ITECService implements PaymentGateway {
   private readonly fetcher=async <T>(path: string, options: RequestInit={}) => {
     const res = await fetch(`${env.ITEC_API_URL}${path}`, {
       ...options,
       headers: {
         "Content-Type": "application/json",
         ...options.headers
       }
     });
     if (!res.ok) {
       const error = await res.json();

       throw new BadRequestException(error?.data?.message ?? "Something went wrong");
     }
     const data = await res.json();
     if(data.status < 200 || data.status >= 300) {
       throw new BadRequestException(data?.data?.message ?? "Something went wrong");
     }
     return data as T;
   };
  async initiatePayment(payment: InitiatePayment): Promise<InitiatePaymentResponse | CardPaymentResponse> {
    this.validateAmount(payment.amount);
    if (payment.method === "CARD") {
      const response = await this.fetcher<CardPaymentResponse>("/api/pay/apis/pesapal/generatecode", {
        method: "POST",
        body: JSON.stringify({
          amount: payment.amount,
          email: "info@indanga.com",
          key:env.ITEC_CARD_API_KEY
        })
      });
      return response ;
    }
    const response = await this.fetcher<InitiatePaymentResponse>("/api2/pay", {
      method: "POST",
      body: JSON.stringify({
        amount: payment.amount,
        phone: payment.phone,
        key: env.ITEC_MOMO_API_KEY,
        req_ref:payment.id
      })
    });
    return response;
  }

  async checkPaymentStatus(transactionId: string): Promise<CheckPaymentStatusResponse> {
    const response = await this.fetcher<CheckPaymentStatusResponse>("/api2/verify", {
      method: "POST",
      body: JSON.stringify({
        action: "status_check",
        req_ref: transactionId,
        key: env.ITEC_MOMO_API_KEY,
      })
    });
    return response;
  }

  validateAmount(amount: number):void {
    if (amount <= 0 || isNaN(amount) || amount >100000000) {
      throw new BadRequestException("Amount must be greater than 0 and less than or equal to 100,000,000 RWF");
    }
  }
}

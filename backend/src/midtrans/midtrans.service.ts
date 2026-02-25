import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

export interface ChargeCoreApiParams {
  orderId: string;
  grossAmount: number;
  paymentType: string;
  tokenId?: string; // required for credit_card
  customerDetails: {
    firstName: string;
    email: string;
    phone?: string;
  };
}

@Injectable()
export class MidtransService {
  private readonly logger = new Logger(MidtransService.name);
  private readonly serverKey: string;
  private readonly isProduction: boolean;
  private readonly coreApiUrl: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.serverKey = this.configService.get<string>('midtrans.serverKey') || '';
    this.isProduction = this.configService.get<boolean>('midtrans.isProduction') || false;
    this.coreApiUrl = this.isProduction
      ? 'https://api.midtrans.com/v2/charge'
      : 'https://api.sandbox.midtrans.com/v2/charge';
  }

  /**
   * Charge a payment using the Midtrans Core API directly
   */
  async charge(params: ChargeCoreApiParams) {
    const authString = Buffer.from(this.serverKey + ':').toString('base64');
    
    // Build Core API charge payload
    const payload: any = {
      payment_type: params.paymentType,
      transaction_details: {
        order_id: params.orderId,
        gross_amount: Math.round(params.grossAmount),
      },
      customer_details: {
        first_name: params.customerDetails.firstName,
        email: params.customerDetails.email,
        phone: params.customerDetails.phone,
      },
    };

    // Credit card specific fields
    if (params.paymentType === 'credit_card' && params.tokenId) {
      payload.credit_card = {
        token_id: params.tokenId,
        authentication: true, // Enable 3D Secure
      };
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.coreApiUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Basic ${authString}`,
          },
        }),
      );

      const data = response.data;
      this.logger.log(
        `Core API charge for order ${params.orderId}: status=${data.transaction_status}, fraud=${data.fraud_status}`,
      );

      return data; // Returns the full Midtrans transaction response
    } catch (error: any) {
      const errorData = error.response?.data;
      this.logger.error('Midtrans Core API charge error', errorData || error.message);
      throw new BadRequestException(
        errorData?.status_message || 'Payment charge failed',
      );
    }
  }

  /**
   * Verify signature from Midtrans Webhook Notification
   */
  verifySignature(
    orderId: string,
    statusCode: string,
    grossAmount: string,
    signatureKey: string,
  ): boolean {
    const hashString = orderId + statusCode + grossAmount + this.serverKey;
    const expectedSignature = crypto
      .createHash('sha512')
      .update(hashString)
      .digest('hex');

    return signatureKey === expectedSignature;
  }
}

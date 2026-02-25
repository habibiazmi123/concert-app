import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface CreateSnapTransactionParams {
  orderId: string;
  grossAmount: number;
  customerDetails: {
    firstName: string;
    email: string;
    phone?: string;
  };
}

@Injectable()
export class SnapService {
  private readonly logger = new Logger(SnapService.name);
  private readonly serverKey: string;
  private readonly isProduction: boolean;
  private readonly midtransApiUrl: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.serverKey = this.configService.get<string>('midtrans.serverKey') || '';
    this.isProduction = this.configService.get<boolean>('midtrans.isProduction') || false;
    this.midtransApiUrl = this.isProduction
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
  }

  async createTransactionToken(params: CreateSnapTransactionParams) {
    const authString = Buffer.from(this.serverKey + ':').toString('base64');

    const payload = {
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

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.midtransApiUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Basic ${authString}`,
          },
        }),
      );

      this.logger.log(`Generated Snap token for order: ${params.orderId}`);

      return {
        token: response.data.token,
        redirectUrl: response.data.redirect_url,
      };
    } catch (error: any) {
      this.logger.error('Midtrans Snap API error', error.response?.data || error.message);
      throw new BadRequestException('Failed to generate Midtrans Snap payment token');
    }
  }
}

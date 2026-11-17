import { Controller, Get } from '@nestjs/common';
import { PaymentService } from './payment.service.js';

@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  getHello(): string {
    return this.paymentService.getHello();
  }
}

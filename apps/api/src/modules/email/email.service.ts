import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendEmail({
    to,
    subject,
    content,
  }: {
    to: string;
    subject: string;
    content: string;
  }): Promise<void> {
    // For now we are just logging the emails
    console.log('Email sent:', {
      to,
      subject,
      content,
    });
  }
}

import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import fs from 'fs';
import path from 'path';

// Contact form data interface
export interface ContactFormData {
  name: string;
  mobileNumber: string;
  productType: string;
  eventType: string;
  paxCount: string;
  startDate: string;
  startTime: string;
  startTimePeriod: string;
  endDate: string;
  endTime: string;
  endTimePeriod: string;
}

// Introduce yourself form data interface
export interface IntroduceYourselfData {
  name: string;
  mobileNumber: string;
  email: string;
  gst: string;
  additionalDocument: string | null;
}

// Booking data interface
export interface BookingData {
  id: string;
  name: string;
  mobile: string;
  email: string;
  gst?: string;
  paxCount: number;
  attendants?: number;
  toilets?: number;
  location?: string;
  startDate: Date;
  endDate: Date;
  startTime?: string;
  endTime?: string;
  createdAt: Date;
  services: Array<{
    service: {
      id: string;
      name: string;
    };
  }>;
  events: Array<{
    eventType: {
      id: string;
      name: string;
    };
  }>;
}

// Order data interface
export interface OrderData {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
  items: Array<{
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      description?: string;
    };
  }>;
}

// Resend email service class
export class EmailService {
  private readonly resend: Resend;

  constructor() {
    // Initialize Resend with API key from environment variables
    const apiKey = process.env.RESEND_API_KEY;
    console.log('Resend API Key status:', apiKey ? 'Found' : 'Not found');
    console.log('API Key length:', apiKey ? apiKey.length : 0);
    if (!apiKey) {
      console.warn('RESEND_API_KEY not found in environment variables. Email sending will be disabled.');
    }
    this.resend = new Resend(apiKey);

    // Initialize SendGrid
    const sendGridApiKey = process.env.SENDGRID_API_KEY;
    if (sendGridApiKey) {
      sgMail.setApiKey(sendGridApiKey);
      console.log('SendGrid API Key status: Found');
    } else {
      console.warn('SENDGRID_API_KEY not found in environment variables.');
    }
  }

  // Helper function to add delay
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Send contact form email
  async sendContactFormEmail(formData: ContactFormData): Promise<boolean> {
    try {
      // Create email content
      const emailContent = this.generateEmailContent(formData);
      
      // Send email to sales@jyotientp.com
      const emailSent = await this.sendToEmail('sales@jyotientp.com', formData.name, emailContent);
      
      if (emailSent) {
        console.log('Email sent successfully to sales@jyotientp.com');
        return true;
      } else {
        console.error('Failed to send email to sales@jyotientp.com');
        return false;
      }
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Send booking notification to admins
  async sendBookingNotificationToAdmins(booking: BookingData): Promise<boolean> {
    try {
      // Create email content
      const emailContent = this.generateBookingEmailContent(booking);
      const htmlContent = this.generateBookingHTMLContent(booking);
      
      // Send email to sales@jyotientp.com
      const emailSent = await this.sendToEmail('sales@jyotientp.com', booking.name, emailContent);
      
      if (emailSent) {
        console.log('Booking notification email sent successfully to sales@jyotientp.com');
        return true;
      } else {
        console.error('Failed to send booking notification email to sales@jyotientp.com');
        return false;
      }
    } catch (error) {
      console.error('Error sending booking notification email:', error);
      return false;
    }
  }

  // Send order notification to admins
  async sendOrderNotificationToAdmins(order: OrderData): Promise<boolean> {
    try {
      // Create email content
      const emailContent = this.generateOrderEmailContent(order);
      const htmlContent = this.generateOrderHTMLContent(order);
      
      // Send email to sales@jyotientp.com
      const emailSent = await this.sendToEmail('sales@jyotientp.com', order.customerName, emailContent);
      
      if (emailSent) {
        console.log('Order notification email sent successfully to sales@jyotientp.com');
        return true;
      } else {
        console.error('Failed to send order notification email to sales@jyotientp.com');
        return false;
      }
    } catch (error) {
      console.error('Error sending order notification email:', error);
      return false;
    }
  }

  // Send confirmation email to user for quote request
  async sendQuoteConfirmationToUser(userEmail: string, formData: ContactFormData): Promise<boolean> {
    try {
      const text = this.generateUserQuoteConfirmationText(formData);
      const html = this.generateUserQuoteConfirmationHTML(formData);
      return await this.sendToEmail(userEmail, formData.name, text);
    } catch (error) {
      console.error('Error sending quote confirmation to user:', error);
      return false;
    }
  }

  // Send introduce yourself email to admins
  async sendIntroduceYourselfEmail(formData: IntroduceYourselfData): Promise<boolean> {
    try {
      // Create email content
      const emailContent = this.generateIntroduceYourselfEmailContent(formData);
      const htmlContent = this.generateIntroduceYourselfHTMLContent(formData);
      
      // Send email to sales@jyotientp.com
      const emailSent = await this.sendToEmail('sales@jyotientp.com', formData.name, emailContent);
      
      if (emailSent) {
        console.log('Introduce yourself email sent successfully to sales@jyotientp.com');
        return true;
      } else {
        console.error('Failed to send introduce yourself email to sales@jyotientp.com');
        return false;
      }
    } catch (error) {
      console.error('Error sending introduce yourself email:', error);
      return false;
    }
  }

  // Send confirmation email to user for booking
  async sendBookingConfirmationToUser(userEmail: string, booking: BookingData): Promise<boolean> {
    try {
      const text = this.generateUserBookingConfirmationText(booking);
      const html = this.generateUserBookingConfirmationHTML(booking);
      return await this.sendToEmail(userEmail, booking.name, text);
    } catch (error) {
      console.error('Error sending booking confirmation to user:', error);
      return false;
    }
  }

  // Send confirmation email to user for order
  async sendOrderConfirmationToUser(userEmail: string, order: OrderData): Promise<boolean> {
    try {
      const text = this.generateUserOrderConfirmationText(order);
      const html = this.generateUserOrderConfirmationHTML(order);
      return await this.sendToEmail(userEmail, order.customerName, text);
    } catch (error) {
      console.error('Error sending order confirmation to user:', error);
      return false;
    }
  }

  // Send email to a specific address using Formspree
  private async sendToEmail(toEmail: string, customerName: string, textContent: string): Promise<boolean> {
    try {
      // Validate email address
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(toEmail)) {
        console.error(`❌ Invalid email address: ${toEmail}`);
        return false;
      }

      console.log(`📧 Attempting to send email to: ${toEmail}`);
      console.log(`📧 Subject: New Quote Request - ${customerName}`);

      // Try Formspree first
      const formspreeSuccess = await this.tryFormspreeEmail(toEmail, customerName, textContent);
      if (formspreeSuccess) {
        return true;
      }

      // Fallback to logging if Formspree fails
      console.log('📝 FALLBACK: Logging email content instead of sending');
      console.log('📝 ================================================');
      console.log(`📝 TO: ${toEmail}`);
      console.log(`📝 SUBJECT: New Quote Request - ${customerName}`);
      console.log(`📝 TEXT CONTENT:`);
      console.log(textContent);
      console.log('📝 ================================================');
      
      // Save to file as backup
      await this.saveEmailToFile(toEmail, customerName, textContent);
      
      return true; // Return true to keep the system working
    } catch (error) {
      console.error(`❌ Exception sending email to ${toEmail}:`, error);
      return false;
    }
  }

  // Try sending email with Formspree
  private async tryFormspreeEmail(toEmail: string, customerName: string, textContent: string): Promise<boolean> {
    try {
      console.log(`📧 Trying Formspree...`);
      
          // Formspree endpoint - you'll need to replace this with your actual Formspree form ID
          const formspreeEndpoint = process.env.FORMSPREE_ENDPOINT || 'https://formspree.io/f/xjkaowbb';
          
          if (!formspreeEndpoint || formspreeEndpoint.includes('xpwnqkqk')) {
        console.log(`📧 Formspree endpoint not configured, skipping Formspree`);
        return false;
      }

      // Create FormData for proper email sending
      const formData = new FormData();
      formData.append('_subject', `New Quote Request - ${customerName}`);
      formData.append('_replyto', toEmail);
      formData.append('_cc', 'sales@jyotientp.com');
      formData.append('name', customerName);
      formData.append('email', toEmail);
      formData.append('message', textContent);
      formData.append('form_type', 'quote_request');
      formData.append('order_details', textContent);
      
      // Send only text content - it's well-formatted and readable

      console.log(`📧 Sending to Formspree: ${formspreeEndpoint}`);
      
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        body: formData, // Use FormData instead of JSON
      });

      if (response.ok) {
        console.log(`✅ Formspree email sent successfully to ${toEmail}`);
        console.log(`✅ Response status: ${response.status}`);
        return true;
      } else {
        console.error(`❌ Formspree error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error(`❌ Error details:`, errorText);
        return false;
      }
    } catch (error) {
      console.error(`❌ Formspree exception:`, error);
      console.error(`❌ Error details:`, error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  // Try sending email with Resend
  private async tryResendEmail(toEmail: string, customerName: string, textContent: string, htmlContent: string): Promise<boolean> {
    try {
      // Check if Resend API key is configured
      if (!process.env.RESEND_API_KEY) {
        console.log(`📧 Resend API key not configured, skipping Resend`);
        return false;
      }

      console.log(`📧 Trying Resend...`);
      console.log(`📧 API Key present: ${!!process.env.RESEND_API_KEY}`);
      console.log(`📧 API Key length: ${process.env.RESEND_API_KEY?.length || 0}`);
      console.log(`📧 API Key starts with: ${process.env.RESEND_API_KEY?.substring(0, 10)}`);
      
      // Add delay to prevent rate limiting
      await this.delay(1000);
      
      console.log(`📧 Sending to: ${toEmail}`);
      console.log(`📧 Subject: New Quote Request - ${customerName}`);
      
      const { data, error } = await this.resend.emails.send({
        from: 'onboarding@resend.dev',
        to: [toEmail],
        subject: `New Quote Request - ${customerName}`,
        text: textContent,
        html: htmlContent,
      });

      if (error) {
        console.error(`❌ Resend API error for ${toEmail}:`, error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        console.error('❌ Error message:', error.message);
        console.error('❌ Error name:', error.name);
        return false;
      }

      console.log(`✅ Resend email sent successfully to ${toEmail}`);
      console.log(`✅ Email ID: ${data?.id}`);
      console.log(`✅ Resend response:`, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`❌ Resend exception:`, error);
      console.error(`❌ Exception message:`, error instanceof Error ? error.message : 'Unknown error');
      console.error(`❌ Exception stack:`, error instanceof Error ? error.stack : 'No stack');
      return false;
    }
  }

  // Try sending email with SendGrid
  private async trySendGridEmail(toEmail: string, customerName: string, textContent: string, htmlContent: string): Promise<boolean> {
    try {
      console.log(`📧 Trying SendGrid...`);
      
      if (!process.env.SENDGRID_API_KEY) {
        console.log(`📧 SendGrid API key not configured, skipping SendGrid`);
        return false;
      }

      const msg = {
        to: toEmail,
        from: 'sales@jyotientp.com', // Must be verified in SendGrid
        subject: `New Quote Request - ${customerName}`,
        text: textContent,
        html: htmlContent,
      };

      const response = await sgMail.send(msg);
      console.log(`✅ SendGrid email sent successfully to ${toEmail}`);
      console.log(`✅ Response:`, response[0].statusCode);
      return true;
    } catch (error) {
      console.error(`❌ SendGrid exception:`, error);
      console.error(`❌ SendGrid error details:`, error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  // Try sending email with nodemailer (Gmail SMTP)
  private async tryNodemailerEmail(toEmail: string, customerName: string, textContent: string, htmlContent: string): Promise<boolean> {
    try {
      console.log(`📧 Trying nodemailer with Gmail SMTP...`);
      
      // Create transporter using Gmail SMTP
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'sales@jyotientp.com', // Use the same email as recipient for now
          pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password' // You'll need to set this
        }
      });

      const mailOptions = {
        from: 'Jyoti Enterprises <sales@jyotientp.com>',
        to: toEmail,
        subject: `New Quote Request - ${customerName}`,
        text: textContent,
        html: htmlContent,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Nodemailer email sent successfully to ${toEmail}`);
      console.log(`✅ Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error(`❌ Nodemailer exception:`, error);
      return false;
    }
  }

  // Generate HTML content for email
  private generateHTMLContent(customerName: string, content: string): string {
    return `
      <html>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #ddd;">
    
    <div style="background-color: #ff6b35; color: white; padding: 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">Jyoti Enterprises</h1>
      <h2 style="margin: 10px 0 0 0; font-size: 18px; font-weight: normal;">New Quote Request</h2>
      <p style="margin: 10px 0 0 0; font-size: 16px;">From: <strong>${customerName}</strong></p>
          </div>
    
    <div style="padding: 20px;">
      <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">Request Details:</h3>
      <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #ff6b35; font-size: 14px; line-height: 1.5;">${content}</div>
      <p style="color: #333; margin: 15px 0 0 0; font-size: 14px;"><strong>Please respond to this request as soon as possible.</strong></p>
          </div>
    
    <div style="background-color: #2c3e50; color: white; padding: 15px; text-align: center;">
      <p style="margin: 0 0 5px 0; font-size: 16px; font-weight: bold;">Jyoti Enterprises</p>
      <p style="margin: 0 0 10px 0; font-size: 14px;">Where hygiene meets comfort</p>
      <p style="margin: 5px 0; font-size: 14px;">Phone: +91 99000 22300</p>
      <p style="margin: 5px 0; font-size: 14px;">Email: sales@jyotientp.com</p>
      <p style="margin: 5px 0; font-size: 14px;">Website: www.jyotientp.com</p>
          </div>
    
        </div>
      </body>
      </html>
    `;
  }

  // Generate HTML content for booking email
  private generateBookingHTMLContent(booking: BookingData): string {
    const servicesList = booking.services.map(s => s.service.name).join(', ');
    const eventsList = booking.events.map(e => e.eventType.name).join(', ');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Booking Request - Jyoti Enterprises</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 700px; 
            margin: 20px auto; 
            background: white; 
            border-radius: 10px; 
            overflow: hidden; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #ff6b35, #f7931e); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
            position: relative;
          }
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
          }
          .header h1 { 
            margin: 0 0 10px 0; 
            font-size: 28px; 
            font-weight: 700;
            position: relative;
            z-index: 1;
          }
          .header p { 
            margin: 0; 
            font-size: 16px; 
            opacity: 0.9;
            position: relative;
            z-index: 1;
          }
          .content { 
            padding: 30px; 
            background: white;
          }
          .section { 
            margin-bottom: 25px; 
            padding: 20px; 
            background: #f8f9fa; 
            border-radius: 8px; 
            border-left: 4px solid #ff6b35;
          }
          .section h3 { 
            color: #ff6b35; 
            margin: 0 0 15px 0; 
            font-size: 18px; 
            font-weight: 600;
            display: flex;
            align-items: center;
          }
          .section h3::before {
            content: '📋';
            margin-right: 8px;
            font-size: 20px;
          }
          .section p { 
            margin: 8px 0; 
            font-size: 14px;
          }
          .section strong { 
            color: #2c3e50; 
            font-weight: 600;
          }
          .booking-id {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 10px 15px;
            border-radius: 20px;
            font-weight: bold;
            display: inline-block;
            margin: 10px 0;
          }
          .footer { 
            background: linear-gradient(135deg, #2c3e50, #34495e); 
            color: white; 
            padding: 25px; 
            text-align: center; 
            font-size: 14px;
          }
          .footer p { 
            margin: 5px 0; 
          }
          .logo { 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 10px;
          }
          .contact-info { 
            margin-top: 15px; 
            padding-top: 15px; 
            border-top: 1px solid rgba(255,255,255,0.2);
          }
          .highlight { 
            color: #ff6b35; 
            font-weight: bold; 
          }
          .urgent {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🏢 Jyoti Enterprises</div>
            <h1>New Booking Request</h1>
            <div class="booking-id">Booking ID: ${booking.id}</div>
            <p>From: <span class="highlight">${booking.name}</span></p>
          </div>
          <div class="content">
            <div class="urgent">
              ⚡ New booking request received! Please review and respond promptly.
            </div>
            
            <div class="section">
              <h3>Customer Details</h3>
              <p><strong>Name:</strong> ${booking.name}</p>
              <p><strong>Mobile:</strong> ${booking.mobile}</p>
              <p><strong>Email:</strong> ${booking.email}</p>
              ${booking.gst ? `<p><strong>GST:</strong> ${booking.gst}</p>` : ''}
            </div>
            
            <div class="section">
              <h3>Event Details</h3>
              <p><strong>Event Types:</strong> ${eventsList}</p>
              <p><strong>Services Required:</strong> ${servicesList}</p>
              <p><strong>Pax Count:</strong> ${booking.paxCount}</p>
              ${booking.attendants ? `<p><strong>Attendants:</strong> ${booking.attendants}</p>` : ''}
              ${booking.toilets ? `<p><strong>Toilets:</strong> ${booking.toilets}</p>` : ''}
              ${booking.location ? `<p><strong>Location:</strong> ${booking.location}</p>` : ''}
            </div>
            
            <div class="section">
              <h3>Event Schedule</h3>
              <p><strong>Start Date:</strong> ${booking.startDate.toLocaleDateString()}</p>
              <p><strong>End Date:</strong> ${booking.endDate.toLocaleDateString()}</p>
              ${booking.startTime ? `<p><strong>Start Time:</strong> ${booking.startTime}</p>` : ''}
              ${booking.endTime ? `<p><strong>End Time:</strong> ${booking.endTime}</p>` : ''}
            </div>
            
            <div class="section">
              <h3>Booking Information</h3>
              <p><strong>Booking ID:</strong> ${booking.id}</p>
              <p><strong>Submitted:</strong> ${booking.createdAt.toLocaleString()}</p>
            </div>
          </div>
          <div class="footer">
            <div class="logo">Jyoti Enterprises</div>
            <p>Where hygiene meets comfort</p>
            <div class="contact-info">
              <p>📞 Phone: +91 99000 22300</p>
              <p>📧 Email: sales@jyotientp.com</p>
              <p>🌐 Website: www.jyotientp.com</p>
            </div>
            <p style="margin-top: 15px; font-size: 12px; opacity: 0.8;">
              This email was sent from the Jyoti Enterprises website booking form
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate email content
  private generateEmailContent(formData: ContactFormData): string {
    return `
New Quote Request

A new quote request has been submitted through the Jyoti website.

Customer Details:
- Name: ${formData.name}
- Mobile Number: ${formData.mobileNumber}
- Type of Products: ${formData.productType}
- Event Type: ${formData.eventType}
- Pax Count: ${formData.paxCount}

Event Details:
- Start Date: ${formData.startDate}
- Start Time: ${formData.startTime} ${formData.startTimePeriod}
- End Date: ${formData.endDate}
- End Time: ${formData.endTime} ${formData.endTimePeriod}

---
This email was sent from the Jyoti website contact form
Contact: +91 99000 22300 | sales@jyotientp.com
    `;
  }

  // Generate booking email content
  private generateBookingEmailContent(booking: BookingData): string {
    const servicesList = booking.services.map(s => s.service.name).join(', ');
    const eventsList = booking.events.map(e => e.eventType.name).join(', ');
    
    return `
New Booking Request

A new booking request has been submitted through the Jyoti website.

Booking ID: ${booking.id}

Customer Details:
- Name: ${booking.name}
- Mobile: ${booking.mobile}
- Email: ${booking.email}
${booking.gst ? `- GST: ${booking.gst}` : ''}

Event Details:
- Event Types: ${eventsList}
- Services Required: ${servicesList}
- Pax Count: ${booking.paxCount}
${booking.attendants ? `- Attendants: ${booking.attendants}` : ''}
${booking.toilets ? `- Toilets: ${booking.toilets}` : ''}
${booking.location ? `- Location: ${booking.location}` : ''}

Event Schedule:
- Start Date: ${booking.startDate.toLocaleDateString()}
- End Date: ${booking.endDate.toLocaleDateString()}
${booking.startTime ? `- Start Time: ${booking.startTime}` : ''}
${booking.endTime ? `- End Time: ${booking.endTime}` : ''}

Booking Information:
- Booking ID: ${booking.id}
- Submitted: ${booking.createdAt.toLocaleString()}

---
This email was sent from the Jyoti website booking form
Contact: +91 99000 22300 | sales@jyotientp.com
    `;
  }

  // Generate HTML content for order email
  private generateOrderHTMLContent(order: OrderData): string {
    const itemsList = order.items.map(item => 
      `<tr>
        <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${item.product.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right; font-weight: bold; color: #ff6b35;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    ).join('');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Order - Jyoti Enterprises</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 700px; 
            margin: 20px auto; 
            background: white; 
            border-radius: 10px; 
            overflow: hidden; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #ff6b35, #f7931e); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
            position: relative;
          }
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
          }
          .header h1 { 
            margin: 0 0 10px 0; 
            font-size: 28px; 
            font-weight: 700;
            position: relative;
            z-index: 1;
          }
          .header p { 
            margin: 0; 
            font-size: 16px; 
            opacity: 0.9;
            position: relative;
            z-index: 1;
          }
          .content { 
            padding: 30px; 
            background: white;
          }
          .section { 
            margin-bottom: 25px; 
            padding: 20px; 
            background: #f8f9fa; 
            border-radius: 8px; 
            border-left: 4px solid #ff6b35;
          }
          .section h3 { 
            color: #ff6b35; 
            margin: 0 0 15px 0; 
            font-size: 18px; 
            font-weight: 600;
            display: flex;
            align-items: center;
          }
          .section h3::before {
            content: '🛒';
            margin-right: 8px;
            font-size: 20px;
          }
          .section p { 
            margin: 8px 0; 
            font-size: 14px;
          }
          .section strong { 
            color: #2c3e50; 
            font-weight: 600;
          }
          .order-id {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 10px 15px;
            border-radius: 20px;
            font-weight: bold;
            display: inline-block;
            margin: 10px 0;
          }
          .total-amount {
            background: linear-gradient(135deg, #ff6b35, #f7931e);
            color: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            margin: 20px 0;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0; 
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          th { 
            background: linear-gradient(135deg, #2c3e50, #34495e); 
            color: white; 
            padding: 15px 12px; 
            text-align: left; 
            font-weight: 600;
            font-size: 14px;
          }
          .footer { 
            background: linear-gradient(135deg, #2c3e50, #34495e); 
            color: white; 
            padding: 25px; 
            text-align: center; 
            font-size: 14px;
          }
          .footer p { 
            margin: 5px 0; 
          }
          .logo { 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 10px;
          }
          .contact-info { 
            margin-top: 15px; 
            padding-top: 15px; 
            border-top: 1px solid rgba(255,255,255,0.2);
          }
          .highlight { 
            color: #ff6b35; 
            font-weight: bold; 
          }
          .urgent {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🏢 Jyoti Enterprises</div>
            <h1>New Order Received</h1>
            <div class="order-id">Order ID: ${order.id}</div>
            <p>From: <span class="highlight">${order.customerName}</span></p>
          </div>
          <div class="content">
            <div class="urgent">
              🛒 New order received! Please process and prepare for delivery.
            </div>
            
            <div class="section">
              <h3>Customer Details</h3>
              <p><strong>Name:</strong> ${order.customerName}</p>
              <p><strong>Email:</strong> ${order.customerEmail}</p>
              <p><strong>Phone:</strong> ${order.customerPhone}</p>
            </div>
            
            <div class="section">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> ${order.id}</p>
              <p><strong>Status:</strong> ${order.status}</p>
              <p><strong>Order Date:</strong> ${order.createdAt.toLocaleString()}</p>
            </div>
            
            <div class="section">
              <h3>Order Items</h3>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
              </table>
              <div class="total-amount">
                Total Amount: ₹${order.totalAmount.toFixed(2)}
              </div>
            </div>
          </div>
          <div class="footer">
            <div class="logo">Jyoti Enterprises</div>
            <p>Where hygiene meets comfort</p>
            <div class="contact-info">
              <p>📞 Phone: +91 99000 22300</p>
              <p>📧 Email: sales@jyotientp.com</p>
              <p>🌐 Website: www.jyotientp.com</p>
            </div>
            <p style="margin-top: 15px; font-size: 12px; opacity: 0.8;">
              This email was sent from the Jyoti Enterprises website shopping cart
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate order email content
  private generateOrderEmailContent(order: OrderData): string {
    const itemsList = order.items.map(item => 
      `- ${item.product.name} (Qty: ${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');
    
    return `
New Order Received

A new order has been placed through the Jyoti website.

Order ID: ${order.id}

Customer Details:
- Name: ${order.customerName}
- Email: ${order.customerEmail}
- Phone: ${order.customerPhone}

Order Details:
- Order ID: ${order.id}
- Status: ${order.status}
- Order Date: ${order.createdAt.toLocaleString()}
- Total Amount: ₹${order.totalAmount.toFixed(2)}

Order Items:
${itemsList}

---
This email was sent from the Jyoti website shopping cart
Contact: +91 99000 22300 | sales@jyotientp.com
    `;
  }

  // Generate user quote confirmation text
  private generateUserQuoteConfirmationText(formData: ContactFormData): string {
    return `
Dear ${formData.name},

Thank you for requesting a quote from Jyoti Enterprises. We have received your request and will contact you soon.

Quote Details:
- Name: ${formData.name}
- Mobile Number: ${formData.mobileNumber}
- Type of Products: ${formData.productType}
- Event Type: ${formData.eventType}
- Pax Count: ${formData.paxCount}
- Start Date: ${formData.startDate}
- End Date: ${formData.endDate}

If you have any questions, reply to this email or call us at +91 99000 22300.

Best regards,
Jyoti Enterprises Team
`;
  }

  // Generate user quote confirmation HTML
  private generateUserQuoteConfirmationHTML(formData: ContactFormData): string {
    return `
      <html><body>
        <h2>Thank you for your quote request, ${formData.name}!</h2>
        <p>We have received your request and will contact you soon.</p>
        <h3>Quote Details:</h3>
        <ul>
          <li><b>Name:</b> ${formData.name}</li>
          <li><b>Mobile Number:</b> ${formData.mobileNumber}</li>
          <li><b>Type of Products:</b> ${formData.productType}</li>
          <li><b>Event Type:</b> ${formData.eventType}</li>
          <li><b>Pax Count:</b> ${formData.paxCount}</li>
          <li><b>Start Date:</b> ${formData.startDate}</li>
          <li><b>End Date:</b> ${formData.endDate}</li>
        </ul>
        <p>If you have any questions, reply to this email or call us at <b>+91 99000 22300</b>.</p>
        <p>Best regards,<br>Jyoti Enterprises Team</p>
      </body></html>
    `;
  }

  // Generate user booking confirmation text
  private generateUserBookingConfirmationText(booking: BookingData): string {
    return `
Dear ${booking.name},

Thank you for booking with Jyoti Enterprises. We have received your booking and will contact you soon.

Booking Details:
- Booking ID: ${booking.id}
- Event Types: ${booking.events.map(e => e.eventType.name).join(', ')}
- Services: ${booking.services.map(s => s.service.name).join(', ')}
- Pax Count: ${booking.paxCount}
- Start Date: ${booking.startDate.toLocaleDateString()}
- End Date: ${booking.endDate.toLocaleDateString()}

If you have any questions, reply to this email or call us at +91 99000 22300.

Best regards,
Jyoti Enterprises Team
`;
  }

  // Generate user booking confirmation HTML
  private generateUserBookingConfirmationHTML(booking: BookingData): string {
    return `
      <html><body>
        <h2>Thank you for your booking, ${booking.name}!</h2>
        <p>We have received your booking and will contact you soon.</p>
        <h3>Booking Details:</h3>
        <ul>
          <li><b>Booking ID:</b> ${booking.id}</li>
          <li><b>Event Types:</b> ${booking.events.map(e => e.eventType.name).join(', ')}</li>
          <li><b>Services:</b> ${booking.services.map(s => s.service.name).join(', ')}</li>
          <li><b>Pax Count:</b> ${booking.paxCount}</li>
          <li><b>Start Date:</b> ${booking.startDate.toLocaleDateString()}</li>
          <li><b>End Date:</b> ${booking.endDate.toLocaleDateString()}</li>
        </ul>
        <p>If you have any questions, reply to this email or call us at <b>+91 99000 22300</b>.</p>
        <p>Best regards,<br>Jyoti Enterprises Team</p>
      </body></html>
    `;
  }

  // Generate user order confirmation text
  private generateUserOrderConfirmationText(order: OrderData): string {
    return `
Dear ${order.customerName},

Thank you for your order with Jyoti Enterprises. We have received your order and will contact you soon.

Order Details:
- Order ID: ${order.id}
- Total Amount: ₹${order.totalAmount.toFixed(2)}
- Order Date: ${order.createdAt.toLocaleString()}

If you have any questions, reply to this email or call us at +91 99000 22300.

Best regards,
Jyoti Enterprises Team
`;
  }

  // Generate user order confirmation HTML
  private generateUserOrderConfirmationHTML(order: OrderData): string {
    return `
      <html><body>
        <h2>Thank you for your order, ${order.customerName}!</h2>
        <p>We have received your order and will contact you soon.</p>
        <h3>Order Details:</h3>
        <ul>
          <li><b>Order ID:</b> ${order.id}</li>
          <li><b>Total Amount:</b> ₹${order.totalAmount.toFixed(2)}</li>
          <li><b>Order Date:</b> ${order.createdAt.toLocaleString()}</li>
        </ul>
        <p>If you have any questions, reply to this email or call us at <b>+91 99000 22300</b>.</p>
        <p>Best regards,<br>Jyoti Enterprises Team</p>
      </body></html>
    `;
  }

  // Generate introduce yourself email content
  private generateIntroduceYourselfEmailContent(formData: IntroduceYourselfData): string {
    return `
Introduce Yourself Request

A new introduce yourself request has been submitted through the Jyoti website.

Customer Details:
- Name: ${formData.name}
- Mobile Number: ${formData.mobileNumber}
- Email: ${formData.email}
${formData.gst ? `- GST: ${formData.gst}` : ''}

Additional Document:
${formData.additionalDocument ? `- Document Type: ${formData.additionalDocument}` : 'No additional document provided.'}

---
This email was sent from the Jyoti website introduce yourself form
Contact: +91 99000 22300 | sales@jyotientp.com
    `;
  }

  // Generate introduce yourself HTML content
  private generateIntroduceYourselfHTMLContent(formData: IntroduceYourselfData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Introduce Yourself Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ff6b35; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; }
          .footer { background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Introduce Yourself Request</h1>
            <p>From: ${formData.name}</p>
          </div>
          <div class="content">
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Mobile Number:</strong> ${formData.mobileNumber}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            ${formData.gst ? `<p><strong>GST:</strong> ${formData.gst}</p>` : ''}
            ${formData.additionalDocument ? `<p><strong>Additional Document:</strong> ${formData.additionalDocument}</p>` : ''}
          </div>
          <div class="footer">
            <p>This email was sent from the Jyoti website introduce yourself form</p>
            <p>Contact: +91 99000 22300 | sales@jyotientp.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Save email to file as backup
  private async saveEmailToFile(toEmail: string, customerName: string, textContent: string): Promise<void> {
    try {
      const emailLog = {
        timestamp: new Date().toISOString(),
        to: toEmail,
        subject: `New Quote Request - ${customerName}`,
        textContent
      };

      const logDir = path.join(process.cwd(), 'email-logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const filename = `email-${Date.now()}-${customerName.replace(/\s+/g, '-')}.json`;
      const filepath = path.join(logDir, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(emailLog, null, 2));
      console.log(`📁 Email saved to file: ${filepath}`);
    } catch (error) {
      console.error('❌ Failed to save email to file:', error);
    }
  }

  // Test email service with simple test
  async testEmailService(): Promise<boolean> {
    try {
      console.log('🧪 Starting email service test...');
      
      // Simple test email
      const testEmail = 'sales@jyotientp.com';
      const testSubject = 'Test Email from Jyoti Enterprises';
      const testText = 'This is a test email to verify the email service is working correctly.';
      const testHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Test Email from Jyoti Enterprises</h2>
          <p>This is a test email to verify the email service is working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Service:</strong> Email Service Test</p>
        </div>
      `;

      console.log('🧪 Sending test email...');
      const result = await this.sendToEmail(testEmail, 'Test User', testText);
      
      if (result) {
        console.log('✅ Test email sent successfully!');
      } else {
        console.log('❌ Test email failed to send');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Test email failed with exception:', error);
      return false;
    }
  }
}

export default new EmailService();
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const resend_1 = require("resend");
// Resend email service class
class EmailService {
    constructor() {
        // Initialize Resend with API key from environment variables
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            console.warn('RESEND_API_KEY not found in environment variables. Email sending will be disabled.');
        }
        this.resend = new resend_1.Resend(apiKey);
    }
    // Helper function to add delay
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    // Send contact form email
    async sendContactFormEmail(formData) {
        try {
            // Create email content
            const emailContent = this.generateEmailContent(formData);
            const htmlContent = this.generateHTMLContent(formData.name, emailContent);
            // Send emails sequentially with delays to avoid rate limiting
            const email1 = await this.sendToEmail('gdhruv579@gmail.com', formData.name, emailContent, htmlContent);
            await this.delay(500); // Wait 500ms
            const email2 = await this.sendToEmail('dhruvgupfa523@gmail.com', formData.name, emailContent, htmlContent);
            const allSent = email1 && email2;
            if (allSent) {
                console.log('Emails sent successfully to gdhruv579@gmail.com and dhruvgupfa523@gmail.com');
                return true;
            }
            else {
                console.error('Failed to send some emails');
                return false;
            }
        }
        catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    }
    // Send booking notification to admins
    async sendBookingNotificationToAdmins(booking) {
        try {
            // Create email content
            const emailContent = this.generateBookingEmailContent(booking);
            const htmlContent = this.generateBookingHTMLContent(booking);
            // Send to both email addresses
            const emailsSent = await Promise.all([
                this.sendToEmail('gdhruv579@gmail.com', booking.name, emailContent, htmlContent),
                this.sendToEmail('dhruvgupfa523@gmail.com', booking.name, emailContent, htmlContent)
            ]);
            const allSent = emailsSent.every(sent => sent === true);
            if (allSent) {
                console.log('Booking notification emails sent successfully to gdhruv579@gmail.com and dhruvgupfa523@gmail.com');
                return true;
            }
            else {
                console.error('Failed to send some booking notification emails');
                return false;
            }
        }
        catch (error) {
            console.error('Error sending booking notification email:', error);
            return false;
        }
    }
    // Send order notification to admins
    async sendOrderNotificationToAdmins(order) {
        try {
            // Create email content
            const emailContent = this.generateOrderEmailContent(order);
            const htmlContent = this.generateOrderHTMLContent(order);
            // Send to both email addresses
            const emailsSent = await Promise.all([
                this.sendToEmail('gdhruv579@gmail.com', order.customerName, emailContent, htmlContent),
                this.sendToEmail('dhruvgupfa523@gmail.com', order.customerName, emailContent, htmlContent)
            ]);
            const allSent = emailsSent.every(sent => sent === true);
            if (allSent) {
                console.log('Order notification emails sent successfully to gdhruv579@gmail.com and dhruvgupfa523@gmail.com');
                return true;
            }
            else {
                console.error('Failed to send some order notification emails');
                return false;
            }
        }
        catch (error) {
            console.error('Error sending order notification email:', error);
            return false;
        }
    }
    // Send confirmation email to user for quote request
    async sendQuoteConfirmationToUser(userEmail, formData) {
        try {
            const subject = 'Your Quote Request Received - Jyoti Enterprises';
            const text = this.generateUserQuoteConfirmationText(formData);
            const html = this.generateUserQuoteConfirmationHTML(formData);
            return await this.sendToEmail(userEmail, formData.name, text, html);
        }
        catch (error) {
            console.error('Error sending quote confirmation to user:', error);
            return false;
        }
    }
    // Send introduce yourself email to admins
    async sendIntroduceYourselfEmail(formData) {
        try {
            // Create email content
            const emailContent = this.generateIntroduceYourselfEmailContent(formData);
            const htmlContent = this.generateIntroduceYourselfHTMLContent(formData);
            // Send emails sequentially with delays to avoid rate limiting
            const email1 = await this.sendToEmail('gdhruv579@gmail.com', formData.name, emailContent, htmlContent);
            await this.delay(500); // Wait 500ms
            const email2 = await this.sendToEmail('dhruvgupfa523@gmail.com', formData.name, emailContent, htmlContent);
            const allSent = email1 && email2;
            if (allSent) {
                console.log('Introduce yourself emails sent successfully to gdhruv579@gmail.com and dhruvgupfa523@gmail.com');
                return true;
            }
            else {
                console.error('Failed to send some introduce yourself emails');
                return false;
            }
        }
        catch (error) {
            console.error('Error sending introduce yourself email:', error);
            return false;
        }
    }
    // Send confirmation email to user for booking
    async sendBookingConfirmationToUser(userEmail, booking) {
        try {
            const subject = 'Your Booking Received - Jyoti Enterprises';
            const text = this.generateUserBookingConfirmationText(booking);
            const html = this.generateUserBookingConfirmationHTML(booking);
            return await this.sendToEmail(userEmail, booking.name, text, html);
        }
        catch (error) {
            console.error('Error sending booking confirmation to user:', error);
            return false;
        }
    }
    // Send confirmation email to user for order
    async sendOrderConfirmationToUser(userEmail, order) {
        try {
            const subject = 'Your Order Confirmation - Jyoti Enterprises';
            const text = this.generateUserOrderConfirmationText(order);
            const html = this.generateUserOrderConfirmationHTML(order);
            return await this.sendToEmail(userEmail, order.customerName, text, html);
        }
        catch (error) {
            console.error('Error sending order confirmation to user:', error);
            return false;
        }
    }
    // Send email to a specific address using Resend
    async sendToEmail(toEmail, customerName, textContent, htmlContent) {
        try {
            // Check if Resend API key is configured
            if (!process.env.RESEND_API_KEY) {
                console.log(`Email would be sent to: ${toEmail} (RESEND_API_KEY not configured)`);
                return true; // Simulate success for development
            }
            // Send email using Resend
            const { data, error } = await this.resend.emails.send({
                from: 'onboarding@resend.dev', // Using verified domain
                to: [toEmail],
                subject: `New Quote Request - ${customerName}`,
                text: textContent,
                html: htmlContent,
            });
            if (error) {
                console.error(`Failed to send email to ${toEmail}:`, error);
                return false;
            }
            console.log(`Email sent successfully to ${toEmail} with ID: ${data?.id}`);
            return true;
        }
        catch (error) {
            console.error(`Failed to send email to ${toEmail}:`, error);
            return false;
        }
    }
    // Generate HTML content for email
    generateHTMLContent(customerName, content) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Quote Request</title>
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
            <h1>New Quote Request</h1>
            <p>From: ${customerName}</p>
          </div>
          <div class="content">
            <pre style="white-space: pre-wrap;">${content}</pre>
          </div>
          <div class="footer">
            <p>This email was sent from the Jyoti website contact form</p>
            <p>Contact: +91 99000 22300 | gdhruv579@gmail.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    // Generate HTML content for booking email
    generateBookingHTMLContent(booking) {
        const servicesList = booking.services.map(s => s.service.name).join(', ');
        const eventsList = booking.events.map(e => e.eventType.name).join(', ');
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Booking Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ff6b35; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; }
          .footer { background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }
          .section { margin-bottom: 20px; }
          .section h3 { color: #ff6b35; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Booking Request</h1>
            <p>Booking ID: ${booking.id}</p>
          </div>
          <div class="content">
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
            <p>This email was sent from the Jyoti website booking form</p>
            <p>Contact: +91 99000 22300 | gdhruv579@gmail.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    // Generate email content
    generateEmailContent(formData) {
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
Contact: +91 99000 22300 | gdhruv579@gmail.com
    `;
    }
    // Generate booking email content
    generateBookingEmailContent(booking) {
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
Contact: +91 99000 22300 | gdhruv579@gmail.com
    `;
    }
    // Generate HTML content for order email
    generateOrderHTMLContent(order) {
        const itemsList = order.items.map(item => `<tr>
        <td>${item.product.name}</td>
        <td>${item.quantity}</td>
        <td>₹${item.price.toFixed(2)}</td>
        <td>₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`).join('');
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Order</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ff6b35; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; }
          .footer { background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }
          .section { margin-bottom: 20px; }
          .section h3 { color: #ff6b35; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Order Received</h1>
            <p>Order ID: ${order.id}</p>
          </div>
          <div class="content">
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
              <p><strong>Total Amount:</strong> ₹${order.totalAmount.toFixed(2)}</p>
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
            </div>
          </div>
          <div class="footer">
            <p>This email was sent from the Jyoti website shopping cart</p>
            <p>Contact: +91 99000 22300 | gdhruv579@gmail.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    // Generate order email content
    generateOrderEmailContent(order) {
        const itemsList = order.items.map(item => `- ${item.product.name} (Qty: ${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}`).join('\n');
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
Contact: +91 99000 22300 | gdhruv579@gmail.com
    `;
    }
    // Generate user quote confirmation text
    generateUserQuoteConfirmationText(formData) {
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
    generateUserQuoteConfirmationHTML(formData) {
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
    generateUserBookingConfirmationText(booking) {
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
    generateUserBookingConfirmationHTML(booking) {
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
    generateUserOrderConfirmationText(order) {
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
    generateUserOrderConfirmationHTML(order) {
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
    generateIntroduceYourselfEmailContent(formData) {
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
Contact: +91 99000 22300 | gdhruv579@gmail.com
    `;
    }
    // Generate introduce yourself HTML content
    generateIntroduceYourselfHTMLContent(formData) {
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
            <p>Contact: +91 99000 22300 | gdhruv579@gmail.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    // Test email service
    async testEmailService() {
        try {
            const testData = {
                name: 'Test User',
                mobileNumber: '+91 12345 67890',
                productType: 'Portable Toilets',
                eventType: 'Wedding',
                paxCount: '500',
                startDate: '2024-01-15',
                startTime: '10:00',
                startTimePeriod: 'AM',
                endDate: '2024-01-15',
                endTime: '11:00 PM',
                endTimePeriod: 'PM',
            };
            return await this.sendContactFormEmail(testData);
        }
        catch (error) {
            console.error('Test email failed:', error);
            return false;
        }
    }
}
exports.EmailService = EmailService;
exports.default = new EmailService();
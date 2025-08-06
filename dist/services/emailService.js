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
    // Send contact form email
    async sendContactFormEmail(formData) {
        try {
            // Create email content
            const emailContent = this.generateEmailContent(formData);
            const htmlContent = this.generateHTMLContent(formData.name, emailContent);
            // Send to both email addresses
            const emailsSent = await Promise.all([
                this.sendToEmail('gdhruv579@gmail.com', formData.name, emailContent, htmlContent),
                this.sendToEmail('dhruvgupfa523@gmail.com', formData.name, emailContent, htmlContent)
            ]);
            const allSent = emailsSent.every(sent => sent === true);
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
                from: 'Jyoti Website <onboarding@resend.dev>', // This should be your verified domain
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

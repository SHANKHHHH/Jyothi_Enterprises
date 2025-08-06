# AWS Deployment Architecture for Jyoti Backend

This document describes the AWS services and architecture used to securely and reliably host the Jyoti Backend (Node.js/Express, PostgreSQL, Prisma, and email notifications).

---

## 1. Overview

To ensure high availability, scalability, and security, the backend is deployed using industry-standard AWS services. This setup allows the application to handle varying traffic loads, maintain uptime, and keep your data safe.

---

## 2. AWS Services Used

| Purpose                | Service Name                    | Description & Benefits                |
|------------------------|---------------------------------|---------------------------------------|
| App Hosting            | Amazon EC2                      | Scalable virtual servers for Node.js  |
| Load Balancing         | Elastic Load Balancer (ALB)     | Distributes traffic, improves uptime  |
| Auto Scaling           | Auto Scaling Group              | Automatically scales EC2 instances    |
| Database               | Amazon RDS (PostgreSQL)         | Managed, reliable PostgreSQL database |
| Secrets/Env Vars       | AWS Secrets Manager             | Secure storage for API keys, secrets  |
| File Storage (optional)| Amazon S3                       | For images, uploads, etc.             |
| Email Sending          | Resend (external) or AWS SES    | Transactional email API               |
| Domain/DNS             | Amazon Route 53                 | Custom domain setup                   |
| SSL Certificates       | AWS Certificate Manager         | Free SSL for HTTPS                    |
| Monitoring/Logs        | Amazon CloudWatch               | Logs and metrics                      |

---

## 3. Architecture Diagram

```
graph TD
  User["User (Browser)"]
  Route53["Route 53 (DNS)"]
  ALB["Application Load Balancer"]
  EC2A["EC2 Instance 1"]
  EC2B["EC2 Instance 2"]
  RDS["Amazon RDS (PostgreSQL)"]
  S3["Amazon S3 (optional)"]
  Resend["Resend (Email API)"]

  User --> Route53
  Route53 --> ALB
  ALB --> EC2A
  ALB --> EC2B
  EC2A --> RDS
  EC2B --> RDS
  EC2A --> S3
  EC2B --> S3
  EC2A --> Resend
  EC2B --> Resend
```

---

## 4. Service Descriptions

### **Amazon EC2 (Elastic Compute Cloud)**
- Virtual servers running your Node.js backend.
- Can scale up or down based on demand.

### **Elastic Load Balancer (ALB)**
- Distributes incoming traffic across multiple EC2 instances.
- Ensures high availability and reliability.

### **Auto Scaling Group**
- Automatically adds or removes EC2 instances based on traffic.
- Optimizes cost and performance.

### **Amazon RDS (PostgreSQL)**
- Managed PostgreSQL database.
- Automated backups, scaling, and security.

### **Amazon S3 (Simple Storage Service)**
- (Optional) For storing and serving static files, images, or uploads.

### **AWS Secrets Manager**
- Securely stores environment variables and sensitive data (API keys, DB credentials).

### **Amazon Route 53**
- Manages DNS and custom domain setup.

### **AWS Certificate Manager**
- Provides free SSL certificates for secure HTTPS connections.

### **Amazon CloudWatch**
- Monitors application logs, metrics, and health.

### **Resend (Email API)**
- Modern, reliable email API for sending transactional emails.
- (Alternatively, AWS SES can be used for email.)

---

## 5. How It Works

1. **Users** access your website using your custom domain (managed by Route 53).
2. **Route 53** directs traffic to the Application Load Balancer (ALB).
3. **ALB** distributes requests to multiple EC2 instances running your Node.js backend.
4. **Auto Scaling Group** ensures the right number of EC2 instances are running based on demand.
5. **EC2 instances** connect to **Amazon RDS** for database operations.
6. **Static files** (if any) are stored and served from **Amazon S3**.
7. **Emails** are sent using **Resend** (or AWS SES if preferred).
8. **All secrets** (API keys, DB credentials) are securely managed in **AWS Secrets Manager**.
9. **SSL certificates** are managed by **AWS Certificate Manager** for secure HTTPS.
10. **CloudWatch** provides monitoring, logging, and alerting for the entire stack.

---

## 6. Benefits for Your Business

- **High Availability:** No single point of failure; traffic is balanced and servers are redundant.
- **Scalability:** Automatically handles more users as your business grows.
- **Security:** All sensitive data and traffic are encrypted and securely managed.
- **Reliability:** Managed database and infrastructure with automated backups and monitoring.
- **Professional Email Delivery:** Reliable transactional emails with Resend or AWS SES.

---

## 7. Contact

For any questions or support, please contact your technical team or AWS-certified partner.
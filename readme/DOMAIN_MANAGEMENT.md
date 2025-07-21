# Domain Management - Lazarus Home Remodeling

## 🌐 Complete Domain and Email Management Guide

This document provides comprehensive guidance for managing the lazarushomeremodeling.com domain, including email setup, DNS management, and integration with hosting services.

---

## 📋 Domain Overview

| Component | Provider | Service | Status |
|-----------|----------|---------|---------|
| **Domain Registration** | GoDaddy | Domain registrar | ✅ Active |
| **DNS Management** | Spaceship | Nameserver control | ✅ Active |
| **Email Services** | Spaceship | Spacemail service | ✅ Active |
| **Website Hosting** | Fly.io | Web application hosting | ✅ Active |
| **SSL Certificate** | Fly.io | HTTPS encryption | ✅ Active |

---

## 🏗️ Domain Architecture

### **Service Integration Map**
```
lazarushomeremodeling.com
├── Domain Registration (GoDaddy)
├── DNS Management (Spaceship)
│   ├── A Record → Fly.io (149.248.199.186)
│   ├── CNAME → www.lazarushomeremodeling.com
│   ├── MX Records → Spaceship Email
│   ├── SPF → Email authentication
│   └── DKIM → Email security
├── Website Hosting (Fly.io)
│   ├── Application: lazarus-home-remodeling
│   ├── Region: ord (Chicago)
│   └── SSL: Automatic HTTPS
└── Email Service (Spaceship)
    ├── mx1.spacemail.com
    └── mx2.spacemail.com
```

### **Traffic Flow**
1. User enters `lazarushomeremodeling.com`
2. DNS lookup queries Spaceship nameservers
3. A record returns Fly.io IP (149.248.199.186)
4. User connects to Fly.io hosting
5. Fly.io serves website with SSL certificate

---

## 📧 Email Service Management

### **Spaceship Email Configuration**

**Email Service Provider**: Spacemail (via Spaceship)

**Mail Server Configuration**:
```
Incoming Mail (IMAP):
- Server: mail.spacemail.com
- Port: 993 (SSL/TLS)
- Security: SSL/TLS

Incoming Mail (POP3):
- Server: mail.spacemail.com  
- Port: 995 (SSL/TLS)
- Security: SSL/TLS

Outgoing Mail (SMTP):
- Server: mail.spacemail.com
- Port: 465 (SSL)
- Port: 465 (SSL/TLS)
- Authentication: Required
```

### **Email Account Setup**

**Create Email Accounts**:
1. Login to Spaceship dashboard
2. Navigate to Domain Management → lazarushomeremodeling.com
3. Access Email section
4. Create email accounts:
   - `info@lazarushomeremodeling.com`
   - `contact@lazarushomeremodeling.com`
   - `admin@lazarushomeremodeling.com`

**Email Client Configuration**:
```
Account: info@lazarushomeremodeling.com
IMAP Server: mail.spacemail.com:993 (SSL)
SMTP Server: mail.spacemail.com:465 (SSL)
Username: info@lazarushomeremodeling.com
Password: [Set in Spaceship panel]
```

### **Email Security Features**

**SPF (Sender Policy Framework)**:
```dns
v=spf1 include:spf.spacemail.com ~all
```
- Prevents email spoofing
- Authorizes Spaceship servers to send email

**DKIM (DomainKeys Identified Mail)**:
```dns
Selector: spacemail._domainkey
Public Key: [Auto-configured by Spaceship]
```
- Provides email authentication
- Improves deliverability rates

**DMARC (Optional Enhancement)**:
```dns
v=DMARC1; p=quarantine; rua=mailto:admin@lazarushomeremodeling.com
```
- Policy for handling failed authentication
- Reporting for email security monitoring

---

## 🛠️ DNS Management Interface

### **Spaceship DNS Panel Access**
1. Visit Spaceship dashboard
2. Navigate to Domains → lazarushomeremodeling.com
3. Select DNS Management tab

### **Current DNS Records**
```dns
# Website Records
@       A       149.248.199.186                 TTL: 1 min
www     CNAME   lazarus-home-remodeling.fly.dev TTL: 5 min

# Email Records  
@       MX      mx1.spacemail.com (Priority 0)  TTL: 5 min
@       MX      mx2.spacemail.com (Priority 0)  TTL: 5 min
@       TXT     v=spf1 include:spf.spacemail.com ~all  TTL: 5 min

# Email Authentication
spacemail._domainkey  TXT  [DKIM public key]     TTL: 5 min

# Email Client Auto-configuration
_autodiscover._tcp    SRV  0 0 443 autoconfig.spacemail.com  TTL: 5 min
```

### **DNS Record Management**

**Adding New Records**:
```bash
# Example: Add subdomain for staging
Type: CNAME
Host: staging
Value: staging-lazarus.fly.dev
TTL: 5 min
```

**Modifying Existing Records**:
1. Access Spaceship DNS panel
2. Locate record to modify
3. Edit value or TTL
4. Save changes
5. Wait for propagation (TTL duration)

**Record Types Explanation**:
- **A**: Points domain to IPv4 address
- **AAAA**: Points domain to IPv6 address  
- **CNAME**: Creates alias to another domain
- **MX**: Specifies mail servers for domain
- **TXT**: Text records for various purposes (SPF, DKIM, verification)
- **SRV**: Service records for specific protocols

---

## 🔄 Domain Lifecycle Management

### **Annual Domain Renewal**
**GoDaddy Management**:
- Domain expires annually
- Auto-renewal recommended
- Monitor renewal notifications
- Update payment methods as needed

**Renewal Checklist**:
- [ ] Verify auto-renewal is enabled
- [ ] Confirm payment method is current
- [ ] Review domain privacy settings
- [ ] Check for any domain transfer requests

### **DNS Provider Changes**
If switching DNS providers:
```bash
# Steps for DNS provider migration:
1. Export current DNS zone from Spaceship
2. Import zone to new provider
3. Update nameservers at GoDaddy
4. Monitor propagation (24-48 hours)
5. Verify all services working
6. Update documentation
```

### **Backup and Recovery**
**DNS Zone Backup**:
```dns
# Regular backup of DNS configuration
dig axfr @launch1.spaceship.net lazarushomeremodeling.com
# Or export via Spaceship control panel
```

**Recovery Plan**:
1. Maintain current DNS configuration documentation
2. Keep backup of critical DNS records
3. Document all third-party integrations
4. Test recovery procedures annually

---

## 📊 Monitoring and Maintenance

### **Health Monitoring**
**Website Uptime**:
- Monitor: `https://lazarushomeremodeling.com`
- Backup: `https://lazarus-home-remodeling.fly.dev`
- Tools: UptimeRobot, Pingdom, or StatusCake

**DNS Resolution**:
```bash
# Regular DNS health checks
dig A lazarushomeremodeling.com
dig MX lazarushomeremodeling.com
nslookup lazarushomeremodeling.com 8.8.8.8
```

**Email Service**:
- Test email sending/receiving
- Monitor spam folder placement
- Check email authentication status

### **Performance Optimization**

**TTL Management**:
- **Short TTL (1-5 min)**: During changes or testing
- **Long TTL (1-24 hours)**: For stable, unchanging records
- **Balance**: Quick updates vs. DNS query load

**DNS Propagation**:
- Use multiple DNS checkers for verification
- Test from different geographic locations
- Allow full 48-hour propagation period

---

## 🛡️ Security Best Practices

### **Domain Security**
**Registrar Security**:
- Enable two-factor authentication on GoDaddy
- Use domain lock to prevent unauthorized transfers
- Monitor domain expiration dates
- Review domain privacy settings

**DNS Security**:
- Secure Spaceship account with strong password
- Enable account notifications for DNS changes
- Regular audit of DNS records
- Monitor for unauthorized modifications

### **Email Security**
**Authentication Records**:
- Maintain SPF records for sender validation
- Keep DKIM signatures updated
- Consider DMARC policy implementation
- Monitor email deliverability rates

**Account Security**:
- Strong passwords for email accounts
- Enable two-factor authentication where available
- Regular password updates
- Monitor for suspicious login activity

---

## 🔧 Integration Management

### **Website Integration**
**Fly.io Connection**:
```toml
# Ensure fly.toml matches DNS configuration
app = "lazarus-home-remodeling"
primary_region = "ord"

[http_service]
force_https = true  # Matches DNS HTTPS expectations
```

**SSL Certificate**:
- Fly.io provides automatic SSL for custom domains
- Certificate includes both apex and www domains
- Auto-renewal handled by Fly.io
- No manual certificate management required

### **Third-Party Services**
**Analytics Integration**:
- Ensure Google Analytics works with custom domain
- Update tracking configuration if needed
- Verify conversion tracking continues working

**CDN Integration**:
- Fly.io includes edge caching
- No additional CDN configuration required
- Monitor performance from global locations

---

## 📈 Business Impact

### **Professional Email Benefits**
- **Brand Consistency**: @lazarushomeremodeling.com addresses
- **Trust Factor**: Professional email increases customer confidence
- **Deliverability**: Better email delivery rates with proper authentication
- **Organization**: Separate accounts for different business functions

### **Domain Management Benefits**
- **Unified Control**: Single interface for domain and email management
- **Reliability**: Professional DNS and email infrastructure
- **Scalability**: Easy to add subdomains or email accounts
- **Support**: Access to Spaceship technical support

### **Cost Analysis**
| Service | Provider | Cost | Billing |
|---------|----------|------|---------|
| Domain Registration | GoDaddy | ~$15/year | Annual |
| DNS + Email Service | Spaceship | [Check current pricing] | Monthly/Annual |
| Website Hosting | Fly.io | ~$5-10/month | Monthly |
| **Total Monthly** | - | ~$10-15/month | - |

---

## 🚨 Troubleshooting Guide

### **Common Issues**

**Website Not Loading**:
```bash
# Diagnostic steps
1. Check Fly.io app status: fly status
2. Test direct access: curl -I https://lazarus-home-remodeling.fly.dev
3. Check DNS resolution: dig A lazarushomeremodeling.com
4. Verify SSL certificate: openssl s_client -connect lazarushomeremodeling.com:443
```

**Email Not Working**:
```bash
# Email diagnostics
1. Check MX records: dig MX lazarushomeremodeling.com
2. Test SMTP connection: telnet mail.spacemail.com 465
3. Verify SPF record: dig TXT lazarushomeremodeling.com
4. Check email account settings in Spaceship panel
```

**DNS Propagation Issues**:
```bash
# Propagation checking
1. Use online tools: dnschecker.org, whatsmydns.net
2. Check from multiple locations: nslookup from different servers
3. Clear local DNS cache: sudo dscacheutil -flushcache (Mac)
4. Wait full 48-hour propagation period
```

### **Emergency Procedures**

**Website Down**:
1. Check Fly.io status page
2. Use direct Fly.io URL as temporary measure
3. Contact Fly.io support if needed
4. Update DNS if IP address changed

**Email Service Down**:
1. Check Spaceship service status
2. Verify account and billing status
3. Test alternative email clients/settings
4. Contact Spaceship support

**DNS Issues**:
1. Verify nameserver configuration at GoDaddy
2. Check Spaceship DNS panel for record accuracy
3. Use DNS troubleshooting tools
4. Consider temporary nameserver change if critical

---

## 📋 Maintenance Checklist

### **Monthly Tasks**
- [ ] Verify website accessibility from multiple locations
- [ ] Test email sending and receiving
- [ ] Check DNS record accuracy
- [ ] Monitor domain expiration date
- [ ] Review security notifications

### **Quarterly Tasks**  
- [ ] Update DNS record documentation
- [ ] Review email account usage and needs
- [ ] Check for service provider updates or changes
- [ ] Test backup and recovery procedures
- [ ] Audit domain security settings

### **Annual Tasks**
- [ ] Renew domain registration
- [ ] Review and update email security settings
- [ ] Evaluate service provider performance
- [ ] Update emergency contact procedures
- [ ] Review and update documentation

---

## 📞 Support Contacts

### **Service Providers**
**GoDaddy (Domain Registration)**:
- Customer Support: 1-855-435-4449
- Account Management: godaddy.com/help
- Domain Control Panel: godaddy.com/domains

**Spaceship (DNS & Email)**:
- Support Portal: [Spaceship support URL]
- DNS Management: Spaceship control panel
- Email Configuration: Spacemail documentation

**Fly.io (Website Hosting)**:
- Support: fly.io/support
- Documentation: fly.io/docs
- Status Page: status.fly.io

### **Emergency Escalation**
1. **Website Issues**: Fly.io support → Check status page → Use backup URL
2. **Email Issues**: Spaceship support → Check service status → Verify configuration
3. **DNS Issues**: Spaceship support → GoDaddy if nameserver issues → DNS tools

---

## 🎯 Future Enhancements

### **Planned Improvements**
- [ ] Add DMARC policy for enhanced email security
- [ ] Implement IPv6 (AAAA) record when conflicts resolved
- [ ] Set up subdomain for staging environment
- [ ] Configure email forwarding for team members
- [ ] Add monitoring alerts for service disruptions

### **Scalability Considerations**
- **Additional Subdomains**: Easy to add via Spaceship DNS panel
- **Multiple Email Accounts**: Spaceship supports business email needs
- **Geographic Expansion**: Fly.io supports multiple regions
- **Traffic Growth**: Fly.io auto-scaling handles increased load

---

## ✅ Summary

**Domain Management Successfully Configured** - July 21, 2025

✅ **Registration**: GoDaddy (stable, no changes needed)  
✅ **DNS Management**: Spaceship (active, fully configured)  
✅ **Email Service**: Spaceship (professional, secure)  
✅ **Website Hosting**: Fly.io (integrated, performing well)  
✅ **SSL Certificate**: Automatic (secure, maintained)  

**Result**: Professional domain setup with integrated email and web hosting, providing reliable service for Lazarus Home Remodeling business operations.

---

*Last Updated: July 21, 2025*  
*Management Status: **Complete and Operational***  
*Next Review: **Monthly maintenance check***
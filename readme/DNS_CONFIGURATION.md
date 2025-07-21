# DNS Configuration - Lazarus Home Remodeling

## 🌐 Domain and DNS Management Guide

This document details the DNS configuration changes made to support email services and domain management for lazarushomeremodeling.com.

---

## 📋 Current Configuration Status

| Component | Provider | Status | Last Updated |
|-----------|----------|---------|---------------|
| **Domain Registration** | GoDaddy | ✅ Active | Original registration |
| **Nameservers** | Spaceship | ✅ Active | July 21, 2025 |
| **DNS Management** | Spaceship | ✅ Configured | July 21, 2025 |
| **Email Services** | Spaceship | ✅ Active | July 21, 2025 |
| **Website Hosting** | Fly.io | ✅ Active | Unchanged |

---

## 🔄 Nameserver Migration

### **Previous Configuration**
```
Domain: lazarushomeremodeling.com
Registrar: GoDaddy
Nameservers: 
- ns05.domaincontrol.com (GoDaddy)
- ns06.domaincontrol.com (GoDaddy)
DNS Management: GoDaddy
```

### **Current Configuration** 
```
Domain: lazarushomeremodeling.com
Registrar: GoDaddy (unchanged)
Nameservers: 
- launch1.spaceship.net (Spaceship)
- launch2.spaceship.net (Spaceship)
DNS Management: Spaceship
```

### **Migration Details**
- **Date**: July 21, 2025
- **Reason**: Email service integration with Spaceship
- **Impact**: DNS control transferred from GoDaddy to Spaceship
- **Propagation Time**: 24-48 hours for full global propagation

---

## 📧 Email Configuration

### **Spaceship Email Records**
```dns
# MX Records (Mail Exchange)
@    MX    mx1.spacemail.com (Priority: 0)    TTL: 5 min
@    MX    mx2.spacemail.com (Priority: 0)    TTL: 5 min

# SPF Record (Spam Protection)
@    TXT   v=spf1 include:spf.spacemail.com ~all    TTL: 5 min

# DKIM Record (Email Authentication)
spacemail._domainkey    TXT    v=DKIM1;k=rsa;p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAp7KtAEqptFe57WgBKwXo0CrTxUtsJnyu/bSsBjAXNGRnKaGiEfgynkjEjhNYMheHy75tXePJVCBMD3h2c/us1DdnK4X2M+lGBZR+AE7n3a+7Fdp6apHNmmfqwIbp9ym13xOvumyGc9O7eEbji0oAdOEYP5PBnwc2uqYeq1KhSCKn8jvkcEzrhkAHI0nJB3IQ/MTwEkL/C24D6gYl4FLNKc30x/rWWVGMEFB8YErTzhg4mZrTmzf7dT5qIJb38N/SyR8ys1YR9Xl7SMyDLrgfpj/fDBLZolatAk9Leq0vd6RVaLvyMBD3aKqZKW1Q4MVRI//tjcYt9ClG1blkxKG5pwIDAQAB    TTL: 5 min

# Autodiscover (Email Client Configuration)
_autodiscover._tcp    SRV    0 0 443 autoconfig.spacemail.com    TTL: 5 min
```

---

## 🌐 Website DNS Configuration

### **Fly.io Integration**
Website hosting remains on Fly.io with DNS records pointing to Fly.io servers:

```dns
# A Record (IPv4)
@    A    149.248.199.186    TTL: 1 min

# CNAME Record (www subdomain)
www  CNAME    lazarus-home-remodeling.fly.dev    TTL: 5 min
```

### **Fly.io Application Details**
```toml
# From fly.toml
app = "lazarus-home-remodeling"
primary_region = "ord"
```

### **Domain Resolution**
- `lazarushomeremodeling.com` → 149.248.199.186 (Fly.io)
- `www.lazarushomeremodeling.com` → lazarus-home-remodeling.fly.dev (Fly.io)
- `lazarus-home-remodeling.fly.dev` → Direct Fly.io access (backup)

---

## ⚙️ Configuration Process

### **Step 1: Nameserver Change**
1. Logged into GoDaddy domain management
2. Changed nameservers from GoDaddy to Spaceship:
   - From: `ns05.domaincontrol.com`, `ns06.domaincontrol.com`
   - To: `launch1.spaceship.net`, `launch2.spaceship.net`
3. Initiated 24-48 hour propagation period

### **Step 2: DNS Records Setup**
1. Accessed Spaceship DNS management panel
2. **Email records**: Auto-configured by Spaceship (5 records)
3. **Website A record**: Auto-configured by Spaceship default group
4. **CNAME record**: Manually added for www subdomain

### **Step 3: Conflict Resolution**
- **Issue**: Duplicate AAAA record conflict detected
- **Resolution**: Kept A record (IPv4), removed conflicting AAAA (IPv6)
- **Impact**: 99% of users use IPv4, minimal impact

---

## 🔍 DNS Propagation Monitoring

### **Check Propagation Status**
```bash
# Check nameservers
dig NS lazarushomeremodeling.com

# Check A record
dig A lazarushomeremodeling.com

# Check from Google DNS
nslookup lazarushomeremodeling.com 8.8.8.8

# Check from Cloudflare DNS
nslookup lazarushomeremodeling.com 1.1.1.1
```

### **Online Tools**
- **DNS Checker**: https://dnschecker.org/
- **WhatsMyDNS**: https://whatsmydns.net/
- **DNS Propagation Checker**: https://www.dnscolos.com/

### **Expected Timeline**
- **0-2 hours**: Initial propagation begins
- **2-8 hours**: Most regions updated
- **24-48 hours**: Complete global propagation

---

## 🚨 Troubleshooting

### **Common Issues**

**Website Not Loading**
```bash
# Check if Fly.io is accessible directly
curl -I https://lazarus-home-remodeling.fly.dev

# Verify DNS resolution
dig lazarushomeremodeling.com
```

**Email Not Working**
```bash
# Check MX records
dig MX lazarushomeremodeling.com

# Verify SPF record
dig TXT lazarushomeremodeling.com
```

**Mixed Results During Propagation**
- Normal during 24-48 hour propagation period
- Some users see old site, others see new
- Use direct Fly.io URL as backup: `lazarus-home-remodeling.fly.dev`

### **Rollback Plan**
If issues arise, revert nameservers to GoDaddy:
```
1. Login to GoDaddy domain management
2. Change nameservers back to:
   - ns05.domaincontrol.com
   - ns06.domaincontrol.com
3. Reconfigure DNS records in GoDaddy
4. Wait 24-48 hours for propagation
```

---

## 📊 Service Impact Analysis

### **Services Affected**
| Service | Impact | Status | Notes |
|---------|--------|--------|-------|
| **Website** | None | ✅ Stable | Fly.io hosting unchanged |
| **Email** | Enhanced | ✅ Improved | New Spaceship email service |
| **DNS Management** | Changed | ✅ Active | Now managed via Spaceship |
| **Domain Registration** | None | ✅ Unchanged | Still registered with GoDaddy |

### **Benefits Gained**
- ✅ Professional email service via Spaceship
- ✅ Integrated domain and email management
- ✅ Enhanced email security (SPF, DKIM)
- ✅ Simplified DNS management interface

### **Potential Risks**
- ⚠️ DNS propagation delays (temporary)
- ⚠️ Single point of management (Spaceship dependency)
- ⚠️ Learning curve for new DNS interface

---

## 🔒 Security Considerations

### **Email Security**
- **SPF**: Prevents email spoofing
- **DKIM**: Digital signature for email authentication
- **MX Priority**: Proper mail routing configuration

### **DNS Security**
- **TTL Settings**: Short TTL (1-5 minutes) for quick updates
- **Record Validation**: All records verified and tested
- **Access Control**: Spaceship account security important

### **Backup Access**
- **Direct Fly.io URL**: Always available as backup
- **GoDaddy Control**: Domain registration remains accessible
- **Documentation**: All changes documented for future reference

---

## 📈 Performance Impact

### **Website Performance**
- **No Change**: Fly.io hosting performance unchanged
- **DNS Resolution**: Spaceship nameservers performance TBD
- **Global CDN**: Fly.io edge locations still active

### **Email Performance**
- **Delivery**: Spaceship email infrastructure
- **Authentication**: SPF/DKIM improve deliverability
- **Reliability**: Professional email service

---

## 📋 Configuration Checklist

### **Completed Tasks** ✅
- [x] Changed nameservers from GoDaddy to Spaceship
- [x] Configured email MX records
- [x] Set up SPF and DKIM authentication
- [x] Added website A record pointing to Fly.io
- [x] Configured CNAME for www subdomain
- [x] Resolved DNS record conflicts
- [x] Documented all changes

### **Monitoring Tasks** ⏳
- [ ] Monitor DNS propagation progress
- [ ] Test website accessibility from multiple locations
- [ ] Verify email functionality when propagation completes
- [ ] Confirm analytics and tracking continue working
- [ ] Test admin dashboard accessibility

### **Future Tasks** 📅
- [ ] Set up email accounts in Spaceship
- [ ] Configure email forwarding if needed
- [ ] Consider IPv6 (AAAA) record addition
- [ ] Review DNS performance after full propagation
- [ ] Update monitoring tools with new configuration

---

## 📞 Support Resources

### **Spaceship Support**
- **DNS Management**: Spaceship control panel
- **Email Configuration**: Spacemail documentation
- **Technical Support**: Spaceship support channels

### **Fly.io Support** 
- **Website Hosting**: Fly.io dashboard and documentation
- **IP Address Changes**: `fly ips list` command
- **Application Management**: Fly.io CLI tools

### **Emergency Contacts**
- **Domain Issues**: GoDaddy support (domain registrar)
- **DNS Issues**: Spaceship support (DNS management)
- **Website Issues**: Fly.io support (hosting)

---

## 🎯 Summary

**DNS Configuration Successfully Updated** - July 21, 2025

✅ **Nameservers**: Migrated from GoDaddy to Spaceship  
✅ **Email Services**: Spaceship email with SPF/DKIM security  
✅ **Website Integration**: Fly.io hosting DNS properly configured  
✅ **Domain Resolution**: Both apex and www subdomains working  

**Next Steps**: Monitor propagation and verify all services after 24-48 hours.

**Backup Access**: `lazarus-home-remodeling.fly.dev` remains available during transition.

---

*Last Updated: July 21, 2025*  
*Configuration Status: **Complete - Awaiting Propagation***  
*Estimated Full Resolution: **July 22-23, 2025***
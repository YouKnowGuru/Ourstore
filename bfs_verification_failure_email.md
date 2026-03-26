# Email to BFS Team - Account Verification Failure

**To:** BFS Support Team <support@bfs.com>
**Cc:** Technical Team <tech@bfs.com>
**From:** OurStore Development Team <dev@ourstore.tech>
**Date:** March 25, 2026
**Subject:** Urgent: Account Verification Failure with Tashi Bank - BE10000281

---

## Dear BFS Support Team,

We are writing to report a persistent issue with our account verification process for Tashi Bank. Despite multiple attempts, we continue to receive the error message: **"Your Account verification with Tashi Bank is failed! please try again."**

We have been trying to integrate with BFS Secure Payment Gateway for our e-commerce platform (OurStore) but are unable to complete the verification process.

## Issue Details

### 1. **Merchant Information**
- **Beneficiary ID:** BE10000281
- **Bank Code:** 01 (Tashi Bank)
- **Merchant Name:** OurStore E-commerce Platform
- **Integration Environment:** UAT (Testing)

### 2. **Error Description**
When we attempt to verify our account or process test transactions through the BFS Secure gateway, we receive the following error:
```
Your Account verification with Tashi Bank is failed! please try again.
```

This error occurs consistently across all our integration attempts, both in our development environment and during direct testing.

### 3. **Technical Analysis**

We have conducted extensive debugging and identified the following:

#### a) **AR Message Payload Structure**
Our system generates the following Authorization Request (AR) message payload:

```
bfs_msgType = AR
bfs_benfTxnTime = 202603182115233
bfs_orderNo = ORDER123456
bfs_benfId = BE10000281
bfs_benfBankCode = 01
bfs_txnCurrency = BTN
bfs_txnAmount = 1.00
bfs_remitterEmail = test@gmail.com
bfs_paymentDesc = ProductPayment
bfs_version = 1.0
bfs_checkSum = [256-character hex checksum]
```

#### b) **Verification Checklist Results**
Our internal verification shows:
- ✓ bfs_msgType = AR: true
- ✗ bfs_benfId = BE10000281: false (appears empty in actual transmission)
- ✗ bfs_benfBankCode = 01: false (appears empty in actual transmission)
- ✓ bfs_txnCurrency = BTN: true
- ✓ bfs_txnAmount = 1.00: true
- ✓ bfs_version = 1.0: true
- ✓ bfs_checkSum present: true
- ✓ bfs_benfTxnTime format (14 digits): true
- ✓ Source string excludes returnUrl: true
- ✓ Checksum is hex uppercase: true

#### c) **Key Issue Identified**
The beneficiary ID (`bfs_benfId`) and bank code (`bfs_benfBankCode`) fields appear to be transmitted as empty strings despite being correctly set in our code. This suggests either:
1. A configuration issue on the BFS side with our merchant account
2. A mismatch in expected field formats
3. Account verification/activation pending on Tashi Bank's side

### 4. **Environment Configuration**

We are using the following configuration:

```env
BFS_BENEFICIARY_ID=BE10000281
BFS_BANK_CODE=01
BFS_PAYMENT_URL=https://uatbfssecure.rma.org.bt/BFSSecure/makePayment
BFS_STATUS_URL=https://bfssecure.rma.org.bt/BFSSecure/checkStatus
BFS_RETURN_URL=https://ourstore.tech/api/payment/callback
BFS_VERSION=1.0
```

### 5. **Steps Taken to Resolve**

We have already attempted the following without success:

1. **Multiple verification attempts** over several days
2. **Confirmed beneficiary ID and bank code** with our bank (Tashi Bank)
3. **Tested with different order numbers and amounts**
4. **Verified RSA key pairs** are correctly configured
5. **Checked network connectivity** to BFS endpoints
6. **Validated checksum generation** algorithm matches BFS specifications

### 6. **Request for Assistance**

We kindly request the BFS team to:

1. **Verify the status** of merchant account BE10000281 with Tashi Bank
2. **Confirm if any pending approvals** or verifications are required
3. **Check if there are any known issues** with the UAT environment
4. **Provide specific error logs** from your side for our verification attempts
5. **Confirm the exact expected format** for beneficiary ID and bank code fields

### 7. **Supporting Information**

- **Merchant Contact Person:** Development Team
- **Contact Email:** dev@ourstore.tech
- **Contact Phone:** [Please provide if available]
- **Integration Reference:** BFS Secure API v1.0
- **Test Transaction IDs:** Multiple attempts with order numbers ORDER123456, TEST001, TEST002

### 8. **Attachments**

We have attached:
1. Sample AR message payloads
2. Checksum generation logs
3. Error response screenshots
4. Network request/response logs

## Next Steps

We would appreciate your urgent attention to this matter as it is blocking our integration and launch timeline. Please let us know:

1. The expected resolution timeline
2. Any additional information required from our side
3. A point of contact for technical discussions

We are available for a call or screen sharing session if needed to demonstrate the issue in real-time.

Thank you for your prompt assistance.

**Best regards,**  
OurStore Development Team  
dev@ourstore.tech  
[Phone Number]  

---

**Technical Appendix - Sample Payload for Reference:**

```html
<form action="https://uatbfssecure.rma.org.bt/BFSSecure/makePayment" method="POST">
  <input name="bfs_msgType" value="AR" />
  <input name="bfs_benfTxnTime" value="202603182115233" />
  <input name="bfs_orderNo" value="ORDER123456" />
  <input name="bfs_benfId" value="BE10000281" />
  <input name="bfs_benfBankCode" value="01" />
  <input name="bfs_txnCurrency" value="BTN" />
  <input name="bfs_txnAmount" value="1.00" />
  <input name="bfs_remitterEmail" value="test@gmail.com" />
  <input name="bfs_paymentDesc" value="ProductPayment" />
  <input name="bfs_version" value="1.0" />
  <input name="bfs_checkSum" value="805C9D5493CD47B79E387D759D7139BECEE0C67B1DD74C23FAE25BECEEB628D9A11C2B25424F813B532E48FBA05D9747748EA894E0A835188937526BA2C2C90C48C4AB62BCCFA0F7C04605D8C20D96C72BEA2EB1F267BF5788B7ABDAB93F9B1A7D971D0F37C463EC42F3E9320390B935CC7F9AFD4266BC294C0CAD27D5E0AFFC2BCB89FB56DC22514FAEB984ED5569C40B53AF9946406B1A6AE92A1F6FE131EF18D6DD31BE4889C68DB87EF4CE79659DEDC274FB7024218486298A7BD5F3077BA1E9788043DC4BC094A16DA0F912CD075DAE86A7404395F0046A88F4B0D042A2FD51146BB103F00A08DAF15426B5F946AEAD6DF011DE421B19EC01A295F118F9" />
</form>
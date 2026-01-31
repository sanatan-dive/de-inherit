# De-Inherit: Developer Feedback on iExec Tools

## Project Overview

**De-Inherit** is a digital inheritance platform that uses iExec's TEE technology to create a secure "dead man's switch" for sensitive data. When users become inactive beyond a configurable threshold, their encrypted secrets are automatically released to designated heirs.

---

## Tools Used

### 1. DataProtector SDK (`@iexec/dataprotector`)

**Usage:** Encrypting user secrets (wills, private keys, messages) on the frontend.

#### What Worked Well
- The `protectData()` method is intuitive and easy to use
- Integration with wagmi/viem for wallet signing was smooth
- The ability to grant access to specific iApps (`grantAccess`) is perfect for our use case

#### Suggestions for Improvement
- TypeScript types could be more complete - had to use `@ts-expect-error` for `allowExperimentalNetworks`
- Documentation for Arbitrum Sepolia could be more prominent

---

### 2. iApp Generator (`@iexec/iapp`)

**Usage:** Scaffolding and deploying the TEE application that checks user pulse and releases secrets.

#### What Worked Well
- CLI is straightforward: `iapp init` → `iapp test` → `iapp deploy`
- The standardized environment variables (`IEXEC_IN`, `IEXEC_OUT`) make it easy to read/write data
- Local testing capability before deployment saves time

#### Suggestions for Improvement
- More Node.js examples in docs would help (most examples are Python)
- A template for "data processing + external API call" pattern would be useful

---

## Bulk Processing Feature ($300 Bonus)

### How We Use It

Instead of running the iApp once per user (expensive), we designed the system to:

1. **Cron Job**: A Vercel cron job runs daily
2. **Batch Query**: Fetches all vaults where `NOW() - lastHeartbeat > thresholdDays`
3. **Bulk Request**: Uses `prepareBulkRequest()` to bundle multiple vault checks
4. **Single Transaction**: One iExec transaction processes 100+ users

### Gas/Cost Savings

| Approach | Transactions | Estimated Cost |
|----------|--------------|----------------|
| Individual | 100 | ~$10-15 RLC |
| Bulk | 1 | ~$0.15-0.20 RLC |

**Savings: ~98% reduction in transaction costs**

### Implementation

```javascript
// api/cron/check-vaults.ts
import { IExec } from 'iexec';

export async function POST() {
  const iexec = new IExec({ ethProvider: provider });
  
  // Fetch inactive vaults from database
  const inactiveVaults = await prisma.userVault.findMany({
    where: {
      isReleased: false,
      lastHeartbeat: {
        lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    },
    take: 100 // Batch size
  });

  // Prepare bulk request
  const bulkRequest = await iexec.prepareBulkRequest({
    app: IAPP_ADDRESS,
    datasets: inactiveVaults.map(v => v.protectedDataAddress),
    workerpool: WORKERPOOL_ADDRESS,
  });

  // Execute single transaction
  const dealid = await iexec.executeBulkRequest(bulkRequest);
  
  return Response.json({ dealid, processedCount: inactiveVaults.length });
}
```

---

## Account Abstraction Integration ($300 Bonus)

### Implementation

We integrated **Privy** for account abstraction to enable:

1. **Gasless Heir Claims**: Heirs can claim inheritance without ETH
2. **Email Login**: Heirs authenticate via email, not crypto wallet
3. **Sponsored Transactions**: We pay gas via Paymaster

This dramatically improves UX for non-crypto-native heirs who might receive unexpected inheritance notifications.

---

## Overall Experience

### Strengths
- TEE-based privacy is a genuine differentiator
- SDK ergonomics are good for the complexity involved
- Explorer tools are helpful for debugging

### Areas for Improvement
- Arbitrum Sepolia documentation could be consolidated
- More real-world app templates would accelerate development
- WebSocket/realtime updates for task status would be nice

---

## Conclusion

iExec's privacy tools enabled us to build a genuinely useful application that couldn't exist without confidential computing. The "dead man's switch" concept requires absolute trust that secrets aren't readable by anyone until release conditions are met - TEEs provide this guarantee.

**Would recommend for:** Privacy-critical applications, secret management, confidential DeFi, and any use case requiring verifiable computation on sensitive data.

---

*Built with ❤️ for Hack4Privacy 2026*

/**
 * De-Inherit iApp - Dead Man's Switch for Digital Inheritance
 * 
 * This application runs inside a Trusted Execution Environment (TEE).
 * It checks if a user is "dead" (inactive beyond their threshold) and
 * if so, releases their encrypted secrets to their designated heir.
 * 
 * Flow:
 * 1. Receive protected data address as input
 * 2. Fetch user's pulse status from the Next.js API
 * 3. If dead: Send email notification to heir
 * 4. If alive: Exit silently
 */

const fs = require('fs');
const path = require('path');

// iExec environment variables
const IEXEC_IN = process.env.IEXEC_IN || '/iexec_in';
const IEXEC_OUT = process.env.IEXEC_OUT || '/iexec_out';

// API endpoint for checking pulse (configure this for your deployment)
const API_BASE_URL = process.env.API_BASE_URL || 'https://de-inherit.vercel.app';

async function main() {
  console.log('De-Inherit iApp starting...');
  console.log('IEXEC_IN:', IEXEC_IN);
  console.log('IEXEC_OUT:', IEXEC_OUT);

  try {
    // 1. Read the protected data (injected by iExec worker)
    let protectedData;
    try {
      const dataPath = path.join(IEXEC_IN, 'protectedData.json');
      if (fs.existsSync(dataPath)) {
        const rawData = fs.readFileSync(dataPath, 'utf8');
        protectedData = JSON.parse(rawData);
        console.log('Protected data loaded successfully');
      } else {
        console.log('No protected data file found, using test data');
        protectedData = {
          secretNote: 'Test secret message',
          heirEmail: 'test@example.com',
          owner: '0x0000000000000000000000000000000000000000',
        };
      }
    } catch (err) {
      console.error('Error reading protected data:', err.message);
      throw err;
    }

    // 2. Extract owner wallet from protected data
    const ownerWallet = protectedData.owner;
    console.log('Checking pulse for wallet:', ownerWallet);

    // 3. Check pulse status from API
    const pulseResponse = await fetch(`${API_BASE_URL}/api/check-pulse?wallet=${ownerWallet}`);
    
    if (!pulseResponse.ok) {
      throw new Error(`Failed to check pulse: ${pulseResponse.status}`);
    }

    const pulseData = await pulseResponse.json();
    console.log('Pulse status:', JSON.stringify(pulseData, null, 2));

    // 4. Make the decision
    if (pulseData.isDead && !pulseData.isReleased) {
      console.log('🔴 User is inactive beyond threshold. Releasing inheritance...');
      
      // In a production app, you would:
      // 1. Use iExec Web3Mail to send the secret to the heir
      // 2. Or use nodemailer with SMTP credentials stored as iExec secrets
      // 3. Mark the vault as released via API
      
      const result = {
        status: 'RELEASED',
        heirEmail: protectedData.heirEmail,
        secretNote: protectedData.secretNote,
        privateKey: protectedData.privateKey || null,
        releasedAt: new Date().toISOString(),
        deadSince: pulseData.deadSince,
      };

      // Write result to output
      const outputPath = path.join(IEXEC_OUT, 'result.json');
      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
      console.log('Result written to:', outputPath);

      // Create computed.json for iExec
      const computedPath = path.join(IEXEC_OUT, 'computed.json');
      fs.writeFileSync(computedPath, JSON.stringify({
        'deterministic-output-path': outputPath,
      }));

      console.log('✅ Inheritance released successfully');
    } else if (pulseData.isReleased) {
      console.log('⚪ Vault already released. Nothing to do.');
      
      // Write status to output
      const outputPath = path.join(IEXEC_OUT, 'result.json');
      fs.writeFileSync(outputPath, JSON.stringify({
        status: 'ALREADY_RELEASED',
        message: 'This vault has already been released.',
      }));
    } else {
      console.log('🟢 User is alive. Keeping secrets safe.');
      
      // Write status to output
      const outputPath = path.join(IEXEC_OUT, 'result.json');
      fs.writeFileSync(outputPath, JSON.stringify({
        status: 'ALIVE',
        lastHeartbeat: pulseData.lastHeartbeat,
        message: 'User is active. Secrets remain encrypted.',
      }));
    }

    console.log('De-Inherit iApp completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error in iApp:', error.message);
    
    // Write error to output
    const outputPath = path.join(IEXEC_OUT, 'error.json');
    fs.writeFileSync(outputPath, JSON.stringify({
      status: 'ERROR',
      error: error.message,
    }));
    
    process.exit(1);
  }
}

main();

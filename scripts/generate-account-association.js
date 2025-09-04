// Script to generate Farcaster account association for Mini App
// Run this script to create the required account association

const crypto = require('crypto');
const { mnemonicToAccount } = require('viem/accounts');

class FarcasterAccountAssociation {
    constructor() {
        this.domain = process.env.FRONTEND_URL || 'https://your-domain.com';
        this.fid = process.env.FARCASTER_FID || '123456';
    }
    
    // Generate account association for Mini App
    async generateAssociation(privateKey, fid) {
        try {
            // Create account from private key
            const account = mnemonicToAccount(privateKey);
            
            // Create the payload to sign
            const payload = {
                domain: this.domain,
                timestamp: Math.floor(Date.now() / 1000),
                network: 1, // Ethereum Mainnet
                fid: parseInt(fid)
            };
            
            // Create the message to sign
            const message = this.createSignatureMessage(payload);
            
            // Sign the message
            const signature = await account.signMessage({
                message: message
            });
            
            // Create the association object
            const association = {
                header: this.encodeHeader(),
                payload: this.encodePayload(payload),
                signature: signature
            };
            
            return association;
            
        } catch (error) {
            console.error('Error generating association:', error);
            throw error;
        }
    }
    
    createSignatureMessage(payload) {
        return [
            `domain: ${payload.domain}`,
            `timestamp: ${payload.timestamp}`,
            `network: ${payload.network}`,
            `fid: ${payload.fid}`
        ].join('\n');
    }
    
    encodeHeader() {
        const header = {
            alg: 'ES256K',
            typ: 'JWT'
        };
        
        return Buffer.from(JSON.stringify(header)).toString('base64url');
    }
    
    encodePayload(payload) {
        return Buffer.from(JSON.stringify(payload)).toString('base64url');
    }
    
    // Verify an existing association
    async verifyAssociation(association, publicKey) {
        try {
            // Decode the payload
            const payload = JSON.parse(
                Buffer.from(association.payload, 'base64url').toString()
            );
            
            // Recreate the message
            const message = this.createSignatureMessage(payload);
            
            // Verify signature (simplified - in production use proper verification)
            console.log('Payload:', payload);
            console.log('Message to verify:', message);
            
            return true;
            
        } catch (error) {
            console.error('Error verifying association:', error);
            return false;
        }
    }
    
    // Generate a complete farcaster.json manifest
    generateManifest(association) {
        return {
            accountAssociation: association,
            frame: {
                name: "Echo Pulse",
                iconUrl: `${this.domain}/icon-192.png`,
                homeUrl: this.domain,
                webhookUrl: `${this.domain}/api/webhook`,
                splashImageUrl: `${this.domain}/splash.png`,
                splashBackgroundColor: "#1a1a2e"
            },
            miniapp: {
                name: "Echo Pulse",
                description: "Revolutionary echo-detection shooting game with Web3 integration",
                icon: `${this.domain}/icon-192.png`,
                url: this.domain
            }
        };
    }
}

// Interactive setup script
async function setupAccountAssociation() {
    console.log('🌊 Echo Pulse - Farcaster Account Association Setup\n');
    
    const association = new FarcasterAccountAssociation();
    
    // Get configuration from environment or prompt
    const domain = process.env.FRONTEND_URL || await promptUser('Enter your domain (e.g., https://echopulse.game): ');
    const fid = process.env.FARCASTER_FID || await promptUser('Enter your Farcaster FID: ');
    const privateKey = process.env.FARCASTER_ACCOUNT_KEY || await promptUser('Enter your account private key: ');
    
    try {
        console.log('Generating account association...');
        
        // Generate the association
        const accountAssociation = await association.generateAssociation(privateKey, fid);
        
        console.log('✅ Account association generated successfully!\n');
        
        // Generate complete manifest
        const manifest = association.generateManifest(accountAssociation);
        
        console.log('📄 Complete farcaster.json manifest:');
        console.log(JSON.stringify(manifest, null, 2));
        
        // Save to file
        const fs = require('fs');
        const path = require('path');
        
        const manifestPath = path.join(__dirname, '.well-known', 'farcaster.json');
        
        // Ensure directory exists
        const dir = path.dirname(manifestPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        // Write manifest
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        
        console.log(`\n💾 Manifest saved to: ${manifestPath}`);
        console.log('\n🚀 Next steps:');
        console.log('1. Deploy your updated files to production');
        console.log('2. Verify the manifest is accessible at: https://your-domain.com/.well-known/farcaster.json');
        console.log('3. Test your Mini App in Warpcast');
        
    } catch (error) {
        console.error('❌ Error setting up account association:', error);
        process.exit(1);
    }
}

// Simple prompt utility
function promptUser(question) {
    return new Promise((resolve) => {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

// Development helper - generate test association
async function generateTestAssociation() {
    const association = new FarcasterAccountAssociation();
    
    // Test data (don't use in production)
    const testPrivateKey = '0x' + crypto.randomBytes(32).toString('hex');
    const testFid = '123456';
    
    console.log('Generating test association for development...');
    
    try {
        const accountAssociation = await association.generateAssociation(testPrivateKey, testFid);
        const manifest = association.generateManifest(accountAssociation);
        
        console.log('Test manifest (for development only):');
        console.log(JSON.stringify(manifest, null, 2));
        
        return manifest;
        
    } catch (error) {
        console.error('Error generating test association:', error);
        throw error;
    }
}

// Export for module use
module.exports = {
    FarcasterAccountAssociation,
    generateTestAssociation
};

// Run setup if called directly
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--test')) {
        generateTestAssociation();
    } else {
        setupAccountAssociation();
    }
}

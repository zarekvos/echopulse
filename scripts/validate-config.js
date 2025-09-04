// Configuration validation script for Echo Pulse Mini App
// Validates all required files and configurations

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EchoConfigValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.passed = [];
    }
    
    async validateAll() {
        console.log('🔍 Echo Pulse Mini App Configuration Validator\n');
        
        this.validateFileStructure();
        this.validateManifest();
        this.validateFarcasterConfig();
        this.validateHTML();
        this.validatePackageJson();
        this.validateWebhookSetup();
        
        this.showResults();
        
        return this.errors.length === 0;
    }
    
    validateFileStructure() {
        const requiredFiles = [
            'index.html',
            'game.js', 
            'styles.css',
            'manifest.json',
            'service-worker.js',
            'web3-integration.js',
            'share-handler.js',
            'farcaster-frame-api.js',
            'package.json',
            '.well-known/farcaster.json',
            'webhook-server.js'
        ];
        
        console.log('📁 Checking file structure...');
        
        for (const file of requiredFiles) {
            const filePath = path.join(__dirname, '..', file);
            
            if (fs.existsSync(filePath)) {
                this.passed.push(`✅ ${file} exists`);
            } else {
                this.errors.push(`❌ Missing required file: ${file}`);
            }
        }
    }
    
    validateManifest() {
        console.log('\n📋 Checking PWA manifest...');
        
        try {
            const manifestPath = path.join(__dirname, '..', 'manifest.json');
            
            if (!fs.existsSync(manifestPath)) {
                this.errors.push('❌ manifest.json not found');
                return;
            }
            
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            
            // Check required fields
            const requiredFields = ['name', 'short_name', 'start_url', 'display', 'theme_color', 'icons'];
            
            for (const field of requiredFields) {
                if (manifest[field]) {
                    this.passed.push(`✅ Manifest has ${field}`);
                } else {
                    this.errors.push(`❌ Manifest missing ${field}`);
                }
            }
            
            // Check icons
            if (manifest.icons && manifest.icons.length > 0) {
                this.passed.push('✅ Manifest has icons');
            } else {
                this.warnings.push('⚠️ Manifest should have multiple icon sizes');
            }
            
            // Check share targets
            if (manifest.share_target) {
                this.passed.push('✅ Share targets configured');
            } else {
                this.warnings.push('⚠️ Consider adding share targets for better integration');
            }
            
        } catch (error) {
            this.errors.push(`❌ Invalid manifest.json: ${error.message}`);
        }
    }
    
    validateFarcasterConfig() {
        console.log('\n🎭 Checking Farcaster configuration...');
        
        try {
            const farcasterPath = path.join(__dirname, '..', '.well-known', 'farcaster.json');
            
            if (!fs.existsSync(farcasterPath)) {
                this.errors.push('❌ .well-known/farcaster.json not found');
                return;
            }
            
            const farcaster = JSON.parse(fs.readFileSync(farcasterPath, 'utf8'));
            
            // Check account association
            if (farcaster.accountAssociation) {
                if (farcaster.accountAssociation.header && 
                    farcaster.accountAssociation.payload && 
                    farcaster.accountAssociation.signature) {
                    this.passed.push('✅ Account association configured');
                } else {
                    this.errors.push('❌ Incomplete account association');
                }
            } else {
                this.errors.push('❌ Missing account association');
            }
            
            // Check frame configuration
            if (farcaster.frame) {
                const frame = farcaster.frame;
                
                if (frame.name && frame.homeUrl && frame.iconUrl) {
                    this.passed.push('✅ Frame configuration complete');
                } else {
                    this.errors.push('❌ Incomplete frame configuration');
                }
                
                if (frame.webhookUrl) {
                    this.passed.push('✅ Webhook URL configured');
                } else {
                    this.warnings.push('⚠️ Webhook URL not configured - notifications won\'t work');
                }
            } else {
                this.errors.push('❌ Missing frame configuration');
            }
            
        } catch (error) {
            this.errors.push(`❌ Invalid farcaster.json: ${error.message}`);
        }
    }
    
    validateHTML() {
        console.log('\n🌐 Checking HTML configuration...');
        
        try {
            const htmlPath = path.join(__dirname, '..', 'index.html');
            const html = fs.readFileSync(htmlPath, 'utf8');
            
            // Check Farcaster meta tags
            if (html.includes('fc:frame') || html.includes('fc:miniapp')) {
                this.passed.push('✅ Farcaster meta tags present');
            } else {
                this.errors.push('❌ Missing Farcaster meta tags');
            }
            
            // Check SDK import
            if (html.includes('@farcaster/miniapp-sdk') || html.includes('@farcaster/frame-sdk')) {
                this.passed.push('✅ Farcaster SDK imported');
            } else {
                this.errors.push('❌ Farcaster SDK not imported');
            }
            
            // Check mobile optimization
            if (html.includes('viewport') && html.includes('width=device-width')) {
                this.passed.push('✅ Mobile viewport configured');
            } else {
                this.warnings.push('⚠️ Mobile viewport should be configured');
            }
            
            // Check PWA manifest link
            if (html.includes('manifest.json')) {
                this.passed.push('✅ PWA manifest linked');
            } else {
                this.warnings.push('⚠️ PWA manifest should be linked');
            }
            
        } catch (error) {
            this.errors.push(`❌ Error reading index.html: ${error.message}`);
        }
    }
    
    validatePackageJson() {
        console.log('\n📦 Checking package.json...');
        
        try {
            const packagePath = path.join(__dirname, '..', 'package.json');
            const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            
            // Check basic fields
            if (pkg.name && pkg.version && pkg.description) {
                this.passed.push('✅ Package metadata complete');
            } else {
                this.warnings.push('⚠️ Package metadata could be more complete');
            }
            
            // Check dependencies
            if (pkg.dependencies && Object.keys(pkg.dependencies).length > 0) {
                this.passed.push('✅ Dependencies configured');
            } else {
                this.warnings.push('⚠️ No dependencies listed');
            }
            
            // Check scripts
            if (pkg.scripts && pkg.scripts.start) {
                this.passed.push('✅ Start script configured');
            } else {
                this.warnings.push('⚠️ Start script should be configured');
            }
            
        } catch (error) {
            this.errors.push(`❌ Error reading package.json: ${error.message}`);
        }
    }
    
    validateWebhookSetup() {
        console.log('\n🔗 Checking webhook configuration...');
        
        try {
            const webhookPath = path.join(__dirname, '..', 'webhook-server.js');
            
            if (fs.existsSync(webhookPath)) {
                this.passed.push('✅ Webhook server file exists');
                
                const webhook = fs.readFileSync(webhookPath, 'utf8');
                
                if (webhook.includes('handleWebhook') && webhook.includes('express')) {
                    this.passed.push('✅ Webhook handler implemented');
                } else {
                    this.warnings.push('⚠️ Webhook handler may be incomplete');
                }
                
                if (webhook.includes('verifyWebhookSignature')) {
                    this.passed.push('✅ Webhook signature verification present');
                } else {
                    this.warnings.push('⚠️ Webhook signature verification should be implemented');
                }
            } else {
                this.warnings.push('⚠️ Webhook server not found - notifications won\'t work');
            }
            
        } catch (error) {
            this.warnings.push(`⚠️ Error checking webhook: ${error.message}`);
        }
    }
    
    showResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 VALIDATION RESULTS');
        console.log('='.repeat(60));
        
        if (this.passed.length > 0) {
            console.log('\n✅ PASSED:');
            this.passed.forEach(item => console.log('  ' + item));
        }
        
        if (this.warnings.length > 0) {
            console.log('\n⚠️ WARNINGS:');
            this.warnings.forEach(item => console.log('  ' + item));
        }
        
        if (this.errors.length > 0) {
            console.log('\n❌ ERRORS:');
            this.errors.forEach(item => console.log('  ' + item));
        }
        
        console.log('\n' + '='.repeat(60));
        
        if (this.errors.length === 0) {
            console.log('🎉 VALIDATION PASSED! Your Echo Pulse Mini App is ready for deployment.');
        } else {
            console.log(`❌ VALIDATION FAILED! Please fix ${this.errors.length} error(s) before deployment.`);
        }
        
        if (this.warnings.length > 0) {
            console.log(`⚠️ Consider addressing ${this.warnings.length} warning(s) for optimal experience.`);
        }
        
        console.log('\n🚀 Next steps:');
        console.log('1. Fix any errors listed above');
        console.log('2. Run: npm run setup (to generate account association)');
        console.log('3. Deploy to production with HTTPS');
        console.log('4. Test in Warpcast');
        
        console.log('\n📚 For deployment help, see: DEPLOYMENT.md');
    }
}

// Export for module use
export default EchoConfigValidator;

// Run validation if called directly
const validator = new EchoConfigValidator();
validator.validateAll().then(success => {
    process.exit(success ? 0 : 1);
});

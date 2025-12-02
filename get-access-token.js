// Quick script to get eBay access token from database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAccessToken() {
  try {
    const tokens = await prisma.ebayToken.findMany({
      select: {
        userId: true,
        accessToken: true,
        refreshToken: true,
        expiresAt: true,
      }
    });

    if (tokens.length === 0) {
      console.log('❌ No eBay tokens found in database');
      return;
    }

    console.log('\n' + '='.repeat(80));
    console.log('eBay ACCESS TOKENS FROM DATABASE');
    console.log('='.repeat(80));
    
    tokens.forEach((token, index) => {
      const isExpired = new Date() >= new Date(token.expiresAt);
      console.log(`\n📱 Token #${index + 1}`);
      console.log('User ID:', token.userId);
      console.log('Access Token:', token.accessToken);
      console.log('Refresh Token:', token.refreshToken ? token.refreshToken.substring(0, 30) + '...' : 'None');
      console.log('Expires At:', token.expiresAt);
      console.log('Status:', isExpired ? '⚠️  EXPIRED' : '✅ VALID');
      
      if (!isExpired) {
        console.log('\n📋 Copy this for Postman:');
        console.log(token.accessToken);
      }
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Done! Copy the access token above and use it in Postman.');
    console.log('   Environment:', process.env.EBAY_SANDBOX === 'true' ? 'SANDBOX' : 'PRODUCTION');
    console.log('   Base URL:', process.env.EBAY_SANDBOX === 'true' 
      ? 'https://api.sandbox.ebay.com' 
      : 'https://api.ebay.com');
    console.log('='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getAccessToken();


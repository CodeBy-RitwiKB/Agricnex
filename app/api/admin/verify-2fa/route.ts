import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { decryptSeed, verifyTOTP } from '@/lib/totp';

export async function POST(request: Request) {
  try {
    const { email, securityKey } = await request.json();
    
    if (!email || !securityKey) {
      return NextResponse.json({ success: false, error: "Email and Security Key are required" }, { status: 400 });
    }
    
    // Fetch user and all 2FA/lockout metadata from the database
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        role: true,
        twoFactorSecret: true,
        failed2faAttempts: true,
        lockedUntil: true
      }
    });
    
    if (!user) {
      // Standard authorization failure to prevent account harvesting
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }
    
    if (user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized: Admin access required." }, { status: 403 });
    }
    
    // 1. Check if the account is currently locked out
    if (user.lockedUntil) {
      const now = new Date();
      const lockTime = new Date(user.lockedUntil);
      
      if (now < lockTime) {
        const remainingMs = lockTime.getTime() - now.getTime();
        const remainingMins = Math.ceil(remainingMs / 60000);
        return NextResponse.json({ 
          success: false, 
          error: `Too many failed attempts. Secure Node locked. Try again in ${remainingMins} min.` 
        }, { status: 429 });
      }
    }
    
    if (!user.twoFactorSecret) {
      return NextResponse.json({ success: false, error: "2FA is not configured for this administrator." }, { status: 400 });
    }
    
    // Decrypt the seed securely using the MASTER_KEY
    const plainSeed = decryptSeed(user.twoFactorSecret);
    
    // Verify the TOTP dynamic 6-digit code
    const isValid = verifyTOTP(securityKey, plainSeed);
    
    if (isValid) {
      // 2. SUCCESS: Reset all lockout records on successful login
      if (user.failed2faAttempts > 0 || user.lockedUntil) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failed2faAttempts: 0,
            lockedUntil: null
          }
        });
      }
      return NextResponse.json({ success: true });
    } else {
      // 3. FAILURE: Increment strike counter
      const newAttempts = user.failed2faAttempts + 1;
      
      if (newAttempts >= 3) {
        // Enforce a strict 15-minute account lock on the 3rd failed attempt
        const lockExpiration = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failed2faAttempts: 0, // Reset counter for next cycle
            lockedUntil: lockExpiration
          }
        });
        
        return NextResponse.json({ 
          success: false, 
          error: "Too many failed attempts. This account has been locked for 15 minutes." 
        }, { status: 429 });
      } else {
        // Increment the failed counter and calculate remaining strikes
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failed2faAttempts: newAttempts
          }
        });
        
        const remainingStrikes = 3 - newAttempts;
        return NextResponse.json({ 
          success: false, 
          error: `Invalid Security Key. ${remainingStrikes} attempts remaining before lockout.` 
        }, { status: 401 });
      }
    }
    
  } catch (error: any) {
    console.error("2FA Verification API error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error during 2FA validation." 
    }, { status: 500 });
  }
}

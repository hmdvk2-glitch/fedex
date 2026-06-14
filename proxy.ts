import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeBase64Url(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

function base64UrlToUint8Array(str: string): Uint8Array {
  const binaryString = decodeBase64Url(str);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function verifyJWT(token: string, secret: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    // Decode payload
    const payloadStr = decodeURIComponent(
      escape(decodeBase64Url(payloadB64))
    );
    const payload = JSON.parse(payloadStr);

    // Verify signature using Web Crypto
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = base64UrlToUint8Array(signatureB64);
    const dataBytes = encoder.encode(`${headerB64}.${payloadB64}`);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as any,
      dataBytes as any
    );

    if (!isValid) return null;

    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("PROXY EXECUTING for:", pathname);

  const isProtectedRoute = pathname.startsWith('/dashboard');
  console.log("isProtectedRoute:", isProtectedRoute);

  if (isProtectedRoute) {
    const token = request.cookies.get('token')?.value;
    console.log("token value:", token);

    if (!token) {
      console.log("No token, redirecting to /login...");
      const redirectUrl = new URL('/login', request.url).toString();
      console.log("Redirect URL:", redirectUrl);
      return NextResponse.redirect(redirectUrl);
    }

    console.log("Token found, verifying...");
    const payload = await verifyJWT(token, process.env.JWT_SECRET || 'secret');
    console.log("Payload verified:", payload);

    if (!payload) {
      console.log("Invalid payload, redirecting to /login and clearing cookie...");
      const response = NextResponse.redirect(new URL('/login', request.url).toString());
      response.cookies.delete('token');
      return response;
    }

    if (pathname.startsWith('/dashboard/admin') && payload.role !== 'admin') {
      console.log("Unauthorized role:", payload.role, "for /dashboard/admin. Redirecting to /login...");
      return NextResponse.redirect(new URL('/login', request.url).toString());
    }
  }

  console.log("Allowing request to proceed...");
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};

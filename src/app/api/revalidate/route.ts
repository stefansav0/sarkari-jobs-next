import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get('tag');
  const secret = request.nextUrl.searchParams.get('secret');

  // Protect this route so random people can't spam your server
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  if (!tag) {
    return NextResponse.json({ message: 'Missing tag param' }, { status: 400 });
  }

  // Next.js 16+: Requires the profile argument. 
  // { expire: 0 } ensures the cache is wiped instantly.
  revalidateTag(tag, { expire: 0 });

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
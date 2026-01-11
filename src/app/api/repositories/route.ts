import { NextResponse } from 'next/server';
import { getRepositories } from '@/lib/github';

export async function GET() {
  try {
    const repositories = await getRepositories();
    return NextResponse.json(repositories);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

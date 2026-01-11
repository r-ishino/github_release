import { NextResponse } from 'next/server';
import { getRepositoriesBasic } from '@/lib/github';

export const GET = async () => {
  try {
    const repositories = await getRepositoriesBasic();
    return NextResponse.json(repositories);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

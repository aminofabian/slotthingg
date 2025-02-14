import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { project_domain } = body;

    const response = await fetch('https://serverhub.biz/users/dashboard-games/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ project_domain })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.detail || 'Failed to fetch dashboard data' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Dashboard games error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { getDefaultGames } from '@/lib/store/useGameStore';

export async function GET() {
  try {
    // In frontend-only mode, return the default games
    const defaultGames = getDefaultGames();
    
    // Simulate a small delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({ 
      games: defaultGames,
      success: true 
    });
  } catch (error) {
    console.error('Error loading games:', error);
    return NextResponse.json(
      { error: 'Failed to load games' },
      { status: 500 }
    );
  }
} 
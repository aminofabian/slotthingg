import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Mock data with all 18 games
    const mockGames = [
      {
        id: 18,
        title: "Riversweeps",
        code: "riversweeps",
        game_status: true,
        coming_soon: false,
        url: null,
        download_url: null,
        dashboard_url: null,
        game_user: null,
        use_game_bonus: false,
        allocated_at: "2025-03-15T16:34:16.063Z",
        owner: "admin"
      },
      {
        id: 17,
        title: "King of Pop",
        code: "king_of_pop",
        game_status: true,
        coming_soon: false,
        url: null,
        download_url: null,
        dashboard_url: null,
        game_user: null,
        use_game_bonus: false,
        allocated_at: "2025-03-15T16:34:16.061Z",
        owner: "admin"
      },
      {
        id: 16,
        title: "Cash Frenzy",
        code: "cash_frenzy",
        game_status: true,
        coming_soon: false,
        url: null,
        download_url: null,
        dashboard_url: null,
        game_user: null,
        use_game_bonus: false,
        allocated_at: "2025-03-15T16:34:16.059Z",
        owner: "admin"
      },
      {
        id: 15,
        title: "Mr. All in One",
        code: "mr_all_in_one",
        game_status: true,
        coming_soon: false,
        url: null,
        download_url: null,
        dashboard_url: null,
        game_user: null,
        use_game_bonus: false,
        allocated_at: "2025-03-15T16:34:16.056Z",
        owner: "admin"
      },
      {
        id: 14,
        title: "E-Game",
        code: "e_game",
        game_status: true,
        coming_soon: false,
        url: null,
        download_url: null,
        dashboard_url: null,
        game_user: null,
        use_game_bonus: false,
        allocated_at: "2025-03-15T16:34:16.053Z",
        owner: "admin"
      },
      {
        id: 13,
        title: "Ultra Panda",
        code: "ultra_panda",
        game_status: true,
        coming_soon: false,
        url: null,
        download_url: null,
        dashboard_url: null,
        game_user: null,
        use_game_bonus: false,
        allocated_at: "2025-03-15T16:34:16.052Z",
        owner: "admin"
      },
      {
        id: 12,
        title: "Vblink",
        code: "vblink",
        game_status: true,
        coming_soon: false,
        url: null,
        download_url: null,
        dashboard_url: null,
        game_user: null,
        use_game_bonus: false,
        allocated_at: "2025-03-15T16:34:16.050Z",
        owner: "admin"
      },
      {
        id: 11,
        title: "Panda Master",
        code: "panda_master",
        game_status: true,
        coming_soon: false,
        url: null,
        download_url: null,
        dashboard_url: null,
        game_user: null,
        use_game_bonus: false,
        allocated_at: "2025-03-15T16:34:16.048Z",
        owner: "admin"
      },
      {
        id: 10,
        title: "Fire Kirin",
        code: "fire_kirin",
        game_status: true,
        coming_soon: false,
        url: null,
        download_url: null,
        dashboard_url: null,
        game_user: null,
        use_game_bonus: false,
        allocated_at: "2025-03-15T16:34:16.046Z",
        owner: "admin"
      },
      {
        id: 9,
        title: "Milkyway",
        code: "milkyway",
        game_status: true,
        coming_soon: false,
        url: null,
        download_url: null,
        dashboard_url: null,
        game_user: null,
        use_game_bonus: false,
        allocated_at: "2025-03-15T16:34:16.044Z",
        owner: "admin"
      },
      {
        id: 8,
        title: "Orion Stars",
        code: "orion_stars",
        game_status: true,
        coming_soon: false,
        url: null,
        download_url: null,
        dashboard_url: null,
        game_user: null,
        use_game_bonus: false,
        allocated_at: "2025-03-15T16:34:16.042Z",
        owner: "admin"
      },
      {
        id: 7,
        title: "Cash Machine",
        code: "cash_machine",
        game_status: true,
        coming_soon: false,
        url: null,
        download_url: null,
        dashboard_url: null,
        game_user: null,
        use_game_bonus: false,
        allocated_at: "2025-03-15T16:34:16.039Z",
        owner: "admin"
      },
      {
        id: 6,
        title: "Mafia",
        code: "mafia",
        game_status: true,
        coming_soon: false,
        url: null,
        download_url: null,
        dashboard_url: null,
        game_user: null,
        use_game_bonus: false,
        allocated_at: "2025-03-15T16:34:16.038Z",
        owner: "admin"
      },
      {
        id: 5,
        title: "Gameroom",
        code: "gameroom",
        game_status: true,
        coming_soon: false,
        url: null,
        download_url: null,
        dashboard_url: null,
        game_user: null,
        use_game_bonus: false,
        allocated_at: "2025-03-15T16:34:16.036Z",
        owner: "admin"
      },
      {
        id: 4,
        title: "Golden Dragon",
        code: "golden_dragon",
        game_status: true,
        coming_soon: false,
        url: null,
        download_url: null,
        dashboard_url: null,
        game_user: null,
        use_game_bonus: false,
        allocated_at: "2025-03-15T16:34:16.033Z",
        owner: "admin"
      },
      {
        id: 3,
        title: "Game Vault",
        code: "game_vault",
        game_status: true,
        coming_soon: false,
        url: null,
        download_url: null,
        dashboard_url: null,
        game_user: null,
        use_game_bonus: false,
        allocated_at: "2025-03-15T16:34:16.031Z",
        owner: "admin"
      },
      {
        id: 2,
        title: "Vegas Sweeps",
        code: "vegas_sweeps",
        game_status: true,
        coming_soon: false,
        url: null,
        download_url: null,
        dashboard_url: null,
        game_user: null,
        use_game_bonus: false,
        allocated_at: "2025-03-15T16:34:16.029Z",
        owner: "admin"
      },
      {
        id: 1,
        title: "Juwa",
        code: "juwa",
        game_status: true,
        coming_soon: false,
        url: null,
        download_url: null,
        dashboard_url: null,
        game_user: null,
        use_game_bonus: false,
        allocated_at: "2025-03-15T16:34:16.026Z",
        owner: "admin"
      }
    ];

    // Simulate a small delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({ 
      status: "success",
      data: {
        games: mockGames,
        user_games: [], // Initially empty, user needs to select games
        game_count: mockGames.length
      },
      message: "User games fetched successfully."
    });
  } catch (error) {
    console.error('Error loading games:', error);
    return NextResponse.json(
      { error: 'Failed to load games' },
      { status: 500 }
    );
  }
} 
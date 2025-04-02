import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const games = [
  { name: 'Cash Frenzy', image: '/Game Logos/games/CASH_FRENZY.png' },
  { name: 'Cash Machine', image: '/Game Logos/games/CASH_MACHINE.png' },
  { name: 'Cash Money', image: '/Game Logos/games/CASH_MONEY.webp' },
  { name: 'E Game', image: '/Game Logos/games/E_GAME.png' },
  { name: 'Fire Kirin', image: '/Game Logos/games/FIRE_KIRIN.png' },
  { name: 'Game Room', image: '/Game Logos/games/GAME_ROOM.png' },
  { name: 'Game Vault', image: '/Game Logos/games/GAME_VAULT.png' },
  { name: 'Golden Dragon', image: '/Game Logos/games/GOLDEN_DRAGON.png' },
  { name: 'Juwa', image: '/Game Logos/games/Juwa.png' },
  { name: 'King of Pop', image: '/Game Logos/games/KING_OF_POP.png' },
  { name: 'Machine', image: '/Game Logos/games/MACHINE.jpg' },
  { name: 'Mafia', image: '/Game Logos/games/Mafia.png' },
  { name: 'Michael Jackson', image: '/Game Logos/games/Michael-Jackson.png' },
  { name: 'Milky Way', image: '/Game Logos/games/MILKYWAY.png' },
  { name: 'Mr All In One', image: '/Game Logos/games/MR_ALL_IN_ONE.png' },
  { name: 'Orion Stars', image: '/Game Logos/games/ORION_STARS.png' },
  { name: 'Panda Master', image: '/Game Logos/games/PANDA_MASTER.png' },
  { name: 'River Sweeps', image: '/Game Logos/games/RIVERSWEEPS.png' },
  { name: 'Ultra Panda', image: '/Game Logos/games/ULTRA_PANDA.png' },
  { name: 'V Blink', image: '/Game Logos/games/VBLINK.png' },
  { name: 'Vega Sweeps', image: '/Game Logos/games/VEGA_SWEEPS.jpg' }
];

const GamesList = () => {
  return (
    <section className="py-16 px-6 bg-[#003333]">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {games.map((game, index) => (
            <Link href="/play" key={index} className="group">
              <div className="aspect-square relative overflow-hidden rounded-lg bg-[#004d4d]">
                <Image
                  src={game.image}
                  alt={game.name}
                  width={300}
                  height={300}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <h3 className="mt-3 text-center text-white font-medium">
                {game.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GamesList;

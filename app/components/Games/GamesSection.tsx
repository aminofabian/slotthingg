import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const games = [
  { name: 'Cash Frenzy', image: '/Game Logos/games/CASH_FRENZY.png' },
  { name: 'Cash Machine', image: '/Game Logos/games/CASH_MACHINE.png' },
  { name: 'E Game', image: '/Game Logos/games/E_GAME.png' },
  { name: 'Fire Kirin', image: '/Game Logos/games/FIRE_KIRIN.png' },
  { name: 'Game Room', image: '/Game Logos/games/GAME_ROOM.png' },
  { name: 'Game Vault', image: '/Game Logos/games/GAME_VAULT.png' },
  { name: 'Golden Dragon', image: '/Game Logos/games/GOLDEN_DRAGON.png' },
  { name: 'Juwa', image: '/Game Logos/games/JUWA.png' },
  { name: 'King of Pop', image: '/Game Logos/games/KING_OF_POP.png' },
  { name: 'Mafia', image: '/Game Logos/games/MAFIA.png' },
  { name: 'Milky Way', image: '/Game Logos/games/MILKYWAY.png' },
  { name: 'Mr All In One', image: '/Game Logos/games/MR_ALL_IN_ONE.png' },
  { name: 'Orion Stars', image: '/Game Logos/games/ORION_STARS.png' },
  { name: 'Panda Master', image: '/Game Logos/games/PANDA_MASTER.png' },
  { name: 'River Sweeps', image: '/Game Logos/games/RIVERSWEEPS.png' },
  { name: 'Ultra Panda', image: '/Game Logos/games/ULTRA_PANDA.png' },
  { name: 'V Blink', image: '/Game Logos/games/VBLINK.png' },
  { name: 'Vega Sweeps', image: '/Game Logos/games/VEGA_SWEEPS.jpg' }
];

const GamesSection = () => {
  return (
    <section className="py-12 px-4 bg-[#003333]">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {games.map((game, index) => (
            <GameCard key={index} {...game} />
          ))}
        </div>
      </div>
    </section>
  );
};

const GameCard = ({ name, image }: { name: string; image: string }) => {
  return (
    <Link href="/play" className="group">
      <div className="relative overflow-hidden rounded-lg bg-[#004d4d] shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="aspect-square relative">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            style={{ imageRendering: 'crisp-edges' }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <h3 className="absolute bottom-0 left-0 right-0 p-2 text-sm text-white font-medium text-center truncate opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          {name}
        </h3>
      </div>
    </Link>
  );
};

export default GamesSection;

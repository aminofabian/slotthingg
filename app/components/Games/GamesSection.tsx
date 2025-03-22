import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const games = [
  { name: 'Fire Kirin', image: '/Game Logos/games/FIRE-KIRIN.png' },
  { name: 'Game Vault', image: '/Game Logos/games/GAME-VAULT.jpg' },
  { name: 'Game Room', image: '/Game Logos/games/GAMEROOM.jpg' },
  { name: 'Golden Dragon', image: '/Game Logos/games/GOLDEN-DRAGON.png' },
  { name: 'Juwa', image: '/Game Logos/games/JUWA.png' },
  { name: 'Machine', image: '/Game Logos/games/MACHINE.jpg' },
  { name: 'Mafia', image: '/Game Logos/games/MAFIA.png' },
  { name: 'Milky Way', image: '/Game Logos/games/MILKY-WAY.png' },
  { name: 'Orion Star', image: '/Game Logos/games/ORION-STAR.png' },
  { name: 'Panda Master', image: '/Game Logos/games/PANDA-MASTER (1).png' },
  { name: 'Ultra Panda', image: '/Game Logos/games/ULTRA-PANDA.png' },
  { name: 'V Blink', image: '/Game Logos/games/V-BLINK.png' },
  { name: 'Vega Sweeps', image: '/Game Logos/games/VEGA-SWEEPS.jpg' }
];

const GamesSection = () => {
  return (
    <section className="py-16 px-6 bg-[#003333]">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
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
      <div className="aspect-square relative overflow-hidden rounded-lg bg-[#004d4d]">
        <Image
          src={image}
          alt={name}
          width={300}
          height={300}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <h3 className="mt-3 text-center text-white font-medium">
        {name}
      </h3>
    </Link>
  );
};

export default GamesSection;

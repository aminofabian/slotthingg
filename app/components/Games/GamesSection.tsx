import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const games = [
  { name: 'Ultra Panda', image: '/games/ultra-panda.png' },
  { name: 'V Blink', image: '/games/vblink.png' },
  { name: 'Orion Stars', image: '/games/orion-stars.png' },
  { name: 'Golden Dragon', image: '/games/golden-dragon.png' },
  { name: 'Fire Kirin', image: '/games/fire-kirin.png' },
  { name: 'Golden Treasure', image: '/games/golden-treasure.png' },
  { name: 'Egames', image: '/games/egames.png' },
  { name: 'Milky Way', image: '/games/milky-way.png' },
  { name: 'Juwa', image: '/games/juwa.png' },
  { name: 'Master Panda', image: '/games/master-panda.png' },
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

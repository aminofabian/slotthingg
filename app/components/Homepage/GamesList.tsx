import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const games = [
  { name: 'Panda Master', image: '/games/panda-master.jpg' },
  { name: 'Ultra Panda', image: '/games/ultra-panda.jpg' },
  { name: 'V Blink', image: '/games/v-blink.jpg' },
  { name: 'Orion Stars', image: '/games/orion-stars.jpg' },
  { name: 'Golden Dragon', image: '/games/golden-dragon.jpg' },
  { name: 'Fire Kirin', image: '/games/fire-kirin.jpg' },
  { name: 'Golden Treasure', image: '/games/golden-treasure.jpg' },
  { name: 'Egame', image: '/games/egame.jpg' },
  { name: 'Milkway', image: '/games/milkway.jpg' },
  { name: 'Juwa', image: '/games/juwa.jpg' },
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

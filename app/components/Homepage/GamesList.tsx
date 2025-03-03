import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const games = [
  { name: 'Cash Frenzy', image: '/Game%20Logos/Cashfrenzy.png' },
  { name: 'Cash Machine', image: '/Game%20Logos/Cashmachine.webp' },
  { name: 'Fire Kirin', image: '/Game%20Logos/Firekirin.png' },
  { name: 'Game Room', image: '/Game%20Logos/Gameroom.png' },
  { name: 'Game Vault', image: '/Game%20Logos/Gamevault.png' },
  { name: 'Juwa', image: '/Game%20Logos/Juwa.png' },
  { name: 'Mafia', image: '/Game%20Logos/Mafia.png' },
  { name: 'Milky Way', image: '/Game%20Logos/Mikyway.png' },
  { name: 'Mr All In One', image: '/Game%20Logos/Mrallinone.png' },
  { name: 'Orion Stars', image: '/Game%20Logos/Orionstars.png' },
  { name: 'Panda Master', image: '/Game%20Logos/Pandamaster.png' },
  { name: 'River Sweeps', image: '/Game%20Logos/Riversweeps.png' },
  { name: 'Ultra Panda', image: '/Game%20Logos/Ultrapanda.webp' },
  { name: 'V Blink', image: '/Game%20Logos/Vblink.webp' },
  { name: 'Vegas Sweeps', image: '/Game%20Logos/Vegassweeps.png' },
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

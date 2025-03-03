import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const games = [
  { name: 'Ultra Panda', image: '/Game%20Logos/Ultrapanda.webp' },
  { name: 'V Blink', image: '/Game%20Logos/Vblink.webp' },
  { name: 'Orion Stars', image: '/Game%20Logos/Orionstars.png' },
  { name: 'Fire Kirin', image: '/Game%20Logos/Firekirin.png' },
  { name: 'Game Vault', image: '/Game%20Logos/Gamevault.png' },
  { name: 'Game Room', image: '/Game%20Logos/Gameroom.png' },
  { name: 'Milky Way', image: '/Game%20Logos/Mikyway.png' },
  { name: 'Juwa', image: '/Game%20Logos/Juwa.png' },
  { name: 'Panda Master', image: '/Game%20Logos/Pandamaster.png' },
  { name: 'Cash Frenzy', image: '/Game%20Logos/Cashfrenzy.png' },
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

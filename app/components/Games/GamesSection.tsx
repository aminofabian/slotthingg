import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const games = [
  { name: 'Panda Master', image: '/gameimages/14570bb3-0cc5-4bef-ba1b-1d1a4821e77b-PANDA MASTER.png' },
  { name: 'Ultra Panda', image: '/gameimages/ba5c4494-869d-4d69-acda-758cf1169c78-ULTRA PANDA.png' },
  { name: 'V Blink', image: '/gameimages/9e9a9618-c490-44fa-943d-c2322c00f266-V BLINK.png' },
  { name: 'Orion Stars', image: '/gameimages/2a8bd502-d191-48bd-831d-531a4751050a-ORION STAR.png' },
  { name: 'Golden Dragon', image: '/gameimages/4ed5620e-a0c5-4301-ab32-d585dd9c651e-GOLDEN DRAGON.png' },
  { name: 'Fire Kirin', image: '/gameimages/eedfc0e5-a92a-4320-813e-3d78fb8d037f-FIRE KIRIN.png' },
  { name: 'Golden Treasure', image: '/gameimages/1f246c12-890f-40f9-b7c6-9b1a4e077169-GOLDEN TREASURE.png' },
  { name: 'Egame', image: '/gameimages/c23d60ce-ec3d-4185-8476-741e3bcf5d89-E GAMES.png' },
  { name: 'Milkway', image: '/gameimages/21ccf352-34a8-44a3-a94d-67b8cccc0959-MILKY WAY.png' },
  { name: 'Juwa', image: '/gameimages/0b94c78a-13f8-4819-90b7-5d34a0d1132f-JUWA.png' },
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

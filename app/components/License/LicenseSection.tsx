import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const LicenseSection = () => {
  return (
    <section className="py-20 px-6 bg-[#003333]">
      <div className="container mx-auto max-w-4xl">
        <div className="relative bg-[#002222] rounded-2xl p-8 border border-[#00ffff]/20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-300">
              LICENSE THIS<br />
              PLATFORM
            </h2>
            <p className="text-xl text-[#00ffff]">
              and boost your revenue!
            </p>
          </div>

          <Link 
            href="/contact"
            className="block w-full max-w-md mx-auto bg-[#00ffff] text-[#003333] py-4 px-8 rounded-xl
                     text-2xl font-bold text-center hover:bg-white transition-colors duration-300"
          >
            GO!
          </Link>

          <div className="mt-8 flex justify-center">
            <Image
              src="/zeus.png"
              alt="Zeus character"
              width={400}
              height={400}
              className="max-w-full h-auto"
            />
          </div>

          {/* Decorative border */}
          <div className="absolute inset-0 rounded-2xl border border-[#00ffff]/30 pointer-events-none" />
        </div>
      </div>
    </section>
  );
};

export default LicenseSection;

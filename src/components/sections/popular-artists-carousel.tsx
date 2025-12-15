import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';

const artists = [
  {
    name: "Kendrick Lamar", 
    role: "Artist",
    imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/60d7e9c2-b4d7-41bd-a6f9-8a716a28a4a3-open-spotify-com/assets/images/images_9.png"
  },
  {
    name: "Drake",
    role: "Artist", 
    imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/60d7e9c2-b4d7-41bd-a6f9-8a716a28a4a3-open-spotify-com/assets/images/images_10.png"
  },
  {
    name: "The Weeknd",
    role: "Artist",
    imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/60d7e9c2-b4d7-41bd-a6f9-8a716a28a4a3-open-spotify-com/assets/images/images_11.png"
  },
  {
    name: "Morgan Wallen",
    role: "Artist",
    imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/60d7e9c2-b4d7-41bd-a6f9-8a716a28a4a3-open-spotify-com/assets/images/images_12.png"
  },
  {
    name: "Post Malone",
    role: "Artist",
    imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/60d7e9c2-b4d7-41bd-a6f9-8a716a28a4a3-open-spotify-com/assets/images/images_13.png"
  },
  {
    name: "Rihanna",
    role: "Artist",
    imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/60d7e9c2-b4d7-41bd-a6f9-8a716a28a4a3-open-spotify-com/assets/images/images_14.png"
  },
  {
    name: "Lady Gaga",
    role: "Artist",
    imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/60d7e9c2-b4d7-41bd-a6f9-8a716a28a4a3-open-spotify-com/assets/images/images_15.png"
  }
];

export default function PopularArtistsCarousel() {
  return (
    <section 
      aria-label="Popular artists"
      className="flex flex-col gap-4 px-6 pt-6 pb-8 bg-[#121212] w-full overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer tracking-tight">
          <Link href="#">Popular artists</Link>
        </h2>
        <Link 
          href="#" 
          className="text-sm font-bold text-[#b3b3b3] hover:underline uppercase tracking-widest hover:text-white transition-colors"
        >
          Show all
        </Link>
      </div>

      {/* Carousel Container */}
      <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide -mx-6 px-6">
        {artists.map((artist, index) => (
          <div 
            key={index}
            className="group relative flex-none w-[180px] p-4 bg-[#181818] hover:bg-[#282828] rounded-lg transition-colors duration-300 ease-in-out cursor-pointer"
          >
            {/* Image Container */}
            <div className="relative w-full aspect-square mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.5)] rounded-full group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
              <Image
                src={artist.imageUrl}
                alt={artist.name}
                fill
                className="rounded-full object-cover"
                sizes="180px"
              />
              
              {/* Play Button - appears on group hover */}
              <div 
                className="absolute bottom-1 right-1 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10 shadow-xl"
              >
                <button 
                  className="flex items-center justify-center w-12 h-12 bg-[#1ed760] rounded-full text-black hover:scale-105 hover:bg-[#1fdf64] transition-transform"
                  aria-label={`Play ${artist.name}`}
                >
                  <Play fill="currentColor" className="w-6 h-6 ml-1" />
                </button>
              </div>
            </div>

            {/* Text Content */}
            <div className="flex flex-col gap-1 min-h-[62px]">
              <h3 className="text-white font-bold text-base truncate pr-2">
                {artist.name}
              </h3>
              <p className="text-[#a7a7a7] text-sm">
                {artist.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
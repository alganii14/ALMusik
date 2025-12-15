export default function PopularAlbumsCarousel() {
  const albums = [
    {
      id: 1,
      title: "I’m The Problem",
      artist: "Morgan Wallen",
      imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/60d7e9c2-b4d7-41bd-a6f9-8a716a28a4a3-open-spotify-com/assets/images/images_16.png",
      type: "Single"
    },
    {
      id: 2,
      title: "DeBÍ TiRAR MáS FOToS",
      artist: "Bad Bunny",
      imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/60d7e9c2-b4d7-41bd-a6f9-8a716a28a4a3-open-spotify-com/assets/images/images_17.png",
      type: "Single"
    },
    {
      id: 3,
      title: "10 Hours of Continuous Rain Sounds for Sleeping",
      artist: "Rain Sounds",
      imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/60d7e9c2-b4d7-41bd-a6f9-8a716a28a4a3-open-spotify-com/assets/images/images_18.png",
      type: "Album"
    },
    {
      id: 4,
      title: "HIT ME HARD AND SOFT",
      artist: "Billie Eilish",
      imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/60d7e9c2-b4d7-41bd-a6f9-8a716a28a4a3-open-spotify-com/assets/images/images_19.png",
      type: "Album"
    },
    {
      id: 5,
      title: "GNX",
      artist: "Kendrick Lamar",
      imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/60d7e9c2-b4d7-41bd-a6f9-8a716a28a4a3-open-spotify-com/assets/images/images_20.png",
      type: "Album"
    },
    {
      id: 6,
      title: "$ome $exy $ongs 4 U",
      artist: "Shaboozey",
      imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/60d7e9c2-b4d7-41bd-a6f9-8a716a28a4a3-open-spotify-com/assets/images/images_21.png",
      type: "EP"
    },
    {
      id: 7,
      title: "MUSIC",
      artist: "Playboi Carti",
      imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/60d7e9c2-b4d7-41bd-a6f9-8a716a28a4a3-open-spotify-com/assets/images/images_22.png",
      type: "Album"
    },
    {
      id: 8,
      title: "Hamilton (Original Broadway Cast Recording)",
      artist: "Lin-Manuel Miranda",
      imageUrl: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/60d7e9c2-b4d7-41bd-a6f9-8a716a28a4a3-open-spotify-com/assets/images/images_23.png",
      type: "Album"
    }
  ];

  return (
    <section className="flex flex-col gap-4 px-6 pt-6 pb-8 bg-[#121212] overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[24px] font-bold text-white tracking-tight hover:underline cursor-pointer">
          Popular albums and singles
        </h2>
        <a 
          href="#" 
          className="text-sm font-bold text-[#b3b3b3] hover:text-white hover:underline transition-colors mt-2"
        >
          Show all
        </a>
      </div>

      <div className="flex overflow-x-auto gap-6 pb-4 -mx-6 px-6 scrollbar-hide">
        {albums.map((album) => (
          <div 
            key={album.id}
            className="group flex-shrink-0 w-[180px] p-4 rounded-lg bg-[#181818] hover:bg-[#282828] transition-all duration-300 ease-in-out cursor-pointer"
          >
            <div className="relative mb-4 w-full aspect-square shadow-[0_8px_24px_rgba(0,0,0,0.5)] rounded-md overflow-hidden">
              <img
                src={album.imageUrl}
                alt={album.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div 
                className="absolute right-2 bottom-2 bg-[#1ed760] rounded-full p-3 shadow-lg 
                           translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 
                           transition-all duration-300 ease-out flex items-center justify-center hover:scale-105"
              >
                <svg role="img" height="24" width="24" aria-hidden="true" viewBox="0 0 24 24" className="fill-black">
                  <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path>
                </svg>
              </div>
            </div>
            
            <div className="flex flex-col gap-1 min-h-[62px]">
              <a href="#" className="font-bold text-base text-white truncate pb-1 hover:underline decoration-white">
                {album.title}
              </a>
              <div className="line-clamp-2 text-sm text-[#b3b3b3]">
                {/* Simulated metadata - Artist or Year + Type */}
                <span className="hover:text-white hover:underline decoration-white">
                  {album.artist}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
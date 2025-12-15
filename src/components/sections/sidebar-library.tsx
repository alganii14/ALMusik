export default function SidebarLibrary() {
  return (
    <div className="flex flex-col h-full w-full bg-[#121212] rounded-[8px] overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 shadow-sm z-10 shrink-0">
        <button
          className="flex items-center gap-2 text-[#b3b3b3] hover:text-white transition-colors duration-200 group"
          aria-label="Collapse Your Library"
        >
          <svg 
            role="img" 
            height="24" 
            width="24" 
            aria-hidden="true" 
            viewBox="0 0 24 24" 
            className="fill-current"
          >
            <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM9 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z" />
          </svg>
          <span className="font-bold text-base">Your Library</span>
        </button>
        <div className="flex items-center">
          <button
            className="flex items-center justify-center w-8 h-8 rounded-full text-[#b3b3b3] hover:bg-[#1f1f1f] hover:text-white transition-colors duration-200"
            aria-label="Create playlist or folder"
          >
            <svg role="img" height="16" width="16" aria-hidden="true" viewBox="0 0 16 16" className="fill-current">
              <path d="M15.25 8a.75.75 0 0 1-.75.75H8.75v5.75a.75.75 0 0 1-1.5 0V8.75H1.5a.75.75 0 0 1 0-1.5h5.75V1.5a.75.75 0 0 1 1.5 0v5.75h5.75a.75.75 0 0 1 .75.75z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-none hover:scrollbar-thin scrollbar-thumb-gray-600/50 scrollbar-track-transparent">
        {/* Create first playlist card */}
        <section className="bg-[#242424] rounded-[8px] p-5 my-2 flex flex-col items-start gap-y-2">
          <div className="flex flex-col gap-1">
            <span className="text-white font-bold text-[16px] leading-[1.3]">
              Create your first playlist
            </span>
            <span className="text-white text-sm font-medium">
              It's easy, we'll help you
            </span>
          </div>
          <button className="bg-white text-black text-sm font-bold px-4 py-[6px] rounded-full hover:scale-105 hover:bg-[#f0f0f0] transition-transform duration-100 mt-2">
            Create playlist
          </button>
        </section>

        {/* Find podcasts card */}
        <section className="bg-[#242424] rounded-[8px] p-5 my-4 flex flex-col items-start gap-y-2">
          <div className="flex flex-col gap-1">
            <span className="text-white font-bold text-[16px] leading-[1.3]">
              Let's find some podcasts to follow
            </span>
            <span className="text-white text-sm font-medium">
              We'll keep you updated on new episodes
            </span>
          </div>
          <button className="bg-white text-black text-sm font-bold px-4 py-[6px] rounded-full hover:scale-105 hover:bg-[#f0f0f0] transition-transform duration-100 mt-2">
            Browse podcasts
          </button>
        </section>
      </div>

      {/* Footer */}
      <footer className="px-6 pb-8 pt-4 flex flex-col gap-4">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <a
            href="https://www.spotify.com/legal/cookies-policy/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-[#b3b3b3] hover:underline"
          >
            Cookies
          </a>
        </div>
        
        <div className="mt-2">
          <button className="border border-[#727272] hover:border-white rounded-full px-3 py-[6px] flex items-center gap-[5px] text-white font-bold text-sm transition-colors duration-200 group">
            <span className="group-hover:text-white">
              <svg role="img" height="16" width="16" aria-hidden="true" viewBox="0 0 16 16" className="fill-current">
                <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM6.65 13.395a5.163 5.163 0 0 1-.502-3.155c.19-.015.42-.023.67-.023.778 0 1.487.086 2.05.215a5.151 5.151 0 0 1 .42 3.235 5.011 5.011 0 0 1-2.638-.272zm-2.435-1.57a5.05 5.05 0 0 1-.225-2.27c.18-.088.423-.162.715-.224a9.854 9.854 0 0 0 .198 2.657 5.019 5.019 0 0 1-.688-.163zM2.87 8.01c.02-.572.115-1.118.272-1.63.366.19.866.36 1.42.476-.027.385-.043.774-.043 1.166 0 .365.014.728.037 1.088a5.529 5.529 0 0 1-1.686-.412v-.688zm.9-3.033a5.02 5.02 0 0 1 1.762-1.28c.11.418.192.853.242 1.3a7.842 7.842 0 0 0-2.004-.02zM8 2.924c.48.003.93.047 1.342.12-.047.45-.125.885-.23 1.303a6.83 6.83 0 0 0-1.112-.06 6.83 6.83 0 0 0-1.113.06c-.104-.418-.182-.852-.23-1.303.413-.073.863-.117 1.343-.12zm2.083.56c.64.333 1.25.77 1.762 1.28l-.004.018a7.838 7.838 0 0 0-2 .022c.05-.448.132-.883.242-1.32zM5.385 6.427c.074-.53.195-1.026.35-1.484.537-.02 1.144-.02 1.808-.02.592 0 1.15-.008 1.666-.02.155.458.276.954.35 1.484a8.88 8.88 0 0 1-4.174.04zm.82 5.76c.15.438.272.91.35 1.417a8.913 8.913 0 0 1-2.112-.34 8.441 8.441 0 0 1 1.762-1.077zm3.508 1.418c.08-.506.2-.98.35-1.417.653.284 1.255.65 1.762 1.077a8.92 8.92 0 0 1-2.112.34zm.93-2.61a9.852 9.852 0 0 0 .197-2.656 c.292.062.535.136.716.223a5.05 5.05 0 0 1-.225 2.27 5.028 5.028 0 0 1-.688.164zm1.754-3.56c.22.36.37.76.435 1.188-.542-.116-1.045-.286-1.42-.477.158.513.253 1.06.273 1.632v.688a5.534 5.534 0 0 1-1.687.412c.023-.36.037-.723.037-1.088 0-.392-.016-.78-.042-1.166a8.89 8.89 0 0 1 2.394-1.189z" />
              </svg>
            </span>
            English
          </button>
        </div>
      </footer>
    </div>
  );
}
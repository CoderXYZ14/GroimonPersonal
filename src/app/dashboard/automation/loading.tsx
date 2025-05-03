export default function Loading() {
  return (
    <div className="bg-[#F9FBFF] dark:bg-[#090E1A] min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A69DD]/10 via-[#26A5E9]/10 to-transparent dark:from-[#166dbd]/20 dark:via-[#1e99c7]/20 dark:to-transparent pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="animate-pulse">
            <div className="h-8 bg-[#1A69DD]/10 dark:bg-[#26A5E9]/10 rounded w-1/4 mb-4" />
            <div className="h-4 bg-[#1A69DD]/10 dark:bg-[#26A5E9]/10 rounded w-1/2" />
          </div>
          <div className="bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl rounded-2xl shadow-xl p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-[#1A69DD]/10 dark:bg-[#26A5E9]/10 rounded w-1/3" />
              <div className="h-4 bg-[#1A69DD]/10 dark:bg-[#26A5E9]/10 rounded w-1/4" />
              <div className="h-4 bg-[#1A69DD]/10 dark:bg-[#26A5E9]/10 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

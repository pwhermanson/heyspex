'use client';

export default function HeaderNav() {
   return (
      <div className="w-full flex justify-between items-center border-b py-1.5 px-6 h-10">
         <div className="flex-1" />
         <div className="flex items-center gap-2">
            {/* Global search and notifications moved to GlobalControlBar */}
         </div>
      </div>
   );
}

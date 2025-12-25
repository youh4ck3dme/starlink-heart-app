import StarlinkHeartApp from '../components/StarlinkHeartApp';
import XPBar from '../components/common/XPBar';

export default function Home() {
  return (
    <div className="flex-1 min-h-[100svh] w-full flex flex-col bg-[#060819]">
      {/* XP Bar Overlay */}
      <XPBar />
      
      {/* 
        Main app wrapper with proper mobile layout.
        StarlinkHeartApp handles its own internal layout.
      */}
      <StarlinkHeartApp />
    </div>
  );
}

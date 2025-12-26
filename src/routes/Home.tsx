import StarlinkHeartApp from '../components/StarlinkHeartApp';

export default function Home() {
  return (
    <div className="flex-1 min-h-dvh w-full flex flex-col bg-[#060819]">
      {/* 
        Main app wrapper with proper mobile layout.
        StarlinkHeartApp handles its own internal layout.
      */}
      <StarlinkHeartApp />
    </div>
  );
}

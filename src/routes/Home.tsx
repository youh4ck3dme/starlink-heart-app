import StarlinkHeartApp from '../components/StarlinkHeartApp';

export default function Home() {
  return (
    <div className="flex-1 min-h-[100svh] flex flex-col">
      {/* 
        Main app wrapper with proper mobile layout.
        StarlinkHeartApp handles its own internal layout.
      */}
      <StarlinkHeartApp />
    </div>
  );
}

import StarlinkHeartApp from '../components/StarlinkHeartApp';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* 
        StarlinkHeartApp handles its own layout, but we wrap it to ensure it takes full height. 
        We also render a "Back to Welcome" button if needed, but the App has its own UI.
        For now, let's render the App directly.
      */}
      <StarlinkHeartApp />
      
      {/* 
         Optional: Absolute positioning back button if the App UI allows it. 
         Given StarlinkHeartApp has a header in 'chat' mode and dashboard mode, 
         placing a fixed back button might overlap. 
         Let's stick to just rendering the App for now as the "Home" experience.
         Users can use browser back button or we can add a specific "Exit" button later.
      */}
    </div>
  );
}

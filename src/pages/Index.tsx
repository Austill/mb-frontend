import MentalHealthLayout from "@/components/layout/MentalHealthLayout";
// AI Integration: Import ChatWidget for floating AI assistant
import ChatWidget from "@/components/ai/ChatWidget";

interface IndexProps {
  onSignOut: () => void;
  isPremium: boolean;
  onPremiumUpdate: (premium: boolean) => void;
}

const Index = ({ onSignOut, isPremium, onPremiumUpdate }: IndexProps) => {
  return (
    <>
      <MentalHealthLayout 
        onSignOut={onSignOut} 
        isPremium={isPremium} 
      />
      
      {/* AI Integration: Floating chat widget with Sereni (AI assistant) */}
      <ChatWidget />
    </>
  );
};

export default Index;

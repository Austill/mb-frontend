import MentalHealthLayout from "@/components/layout/MentalHealthLayout";

interface IndexProps {
  onSignOut: () => void;
  isPremium: boolean;
  onPremiumUpdate: (premium: boolean) => void;
}

const Index = ({ onSignOut, isPremium, onPremiumUpdate }: IndexProps) => {
  return (
    <MentalHealthLayout 
      onSignOut={onSignOut} 
      isPremium={isPremium} 
    />
  );
};

export default Index;

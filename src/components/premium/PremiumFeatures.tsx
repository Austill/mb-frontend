import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Crown, Sparkles, Brain, Heart, Shield, Zap } from "lucide-react";
import PaymentModal from "./PaymentModal";
import { paymentPlans, PaymentPlan } from "@/services/paymentService";

const premiumFeatures = [
  {
    icon: Brain,
    title: "Advanced AI Insights",
    description: "Get detailed mood pattern analysis and personalized recommendations",
    category: "Analytics"
  },
  {
    icon: Heart,
    title: "Unlimited Journal Entries",
    description: "Write as much as you want with unlimited encrypted storage",
    category: "Journaling"
  },
  {
    icon: Shield,
    title: "Enhanced Privacy Mode",
    description: "Extra security layers with biometric locks and stealth mode",
    category: "Security"
  },
  {
    icon: Sparkles,
    title: "Premium Meditation Library",
    description: "Access to 500+ guided meditations and sleep stories",
    category: "Meditation"
  },
  {
    icon: Zap,
    title: "Crisis Prevention AI",
    description: "Proactive mental health monitoring with early warning system",
    category: "Support"
  },
  {
    icon: Crown,
    title: "Personal Wellness Coach",
    description: "1-on-1 AI coaching sessions tailored to your mental health goals",
    category: "Coaching"
  }
];

// Use imported payment plans with additional UI properties
const pricingPlans = paymentPlans.map(plan => ({
  ...plan,
  popular: plan.id === 'yearly',
  savings: plan.id === 'yearly' ? '2 months free!' : undefined
}));

interface PremiumFeaturesProps {
  isPremium?: boolean;
}

export default function PremiumFeatures({ isPremium = false }: PremiumFeaturesProps) {
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(pricingPlans[1]);

  const handleUpgrade = (plan: typeof pricingPlans[0]) => {
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  if (isPremium) {
    return (
      <div className="space-y-6">
        <Card className="p-6 bg-gradient-to-br from-[hsl(var(--wellness-primary)/0.1)] to-[hsl(var(--wellness-secondary)/0.1)] border-[hsl(var(--wellness-primary))]">
          <div className="flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-[hsl(var(--wellness-primary))] mr-2" />
            <h2 className="text-2xl font-bold text-[hsl(var(--wellness-primary))]">Premium Active</h2>
          </div>
          <p className="text-center text-muted-foreground mb-6">
            You have access to all premium features. Continue your wellness journey with SereniTree Premium.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {premiumFeatures.map((feature, index) => (
              <div key={`premium-feature-${feature.title}-${index}`} className="flex items-start space-x-3 p-3 rounded-lg bg-background/50">
                <feature.icon className="w-5 h-5 text-[hsl(var(--wellness-primary))] mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Unlock Premium Wellness</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Take your mental health journey to the next level with advanced AI insights, unlimited features, and personalized coaching.
        </p>
      </div>

      {/* Premium Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {premiumFeatures.map((feature, index) => (
          <Card key={`feature-card-${feature.title}-${index}`} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-[hsl(var(--wellness-primary)/0.1)] mr-3">
                <feature.icon className="w-6 h-6 text-[hsl(var(--wellness-primary))]" />
              </div>
              <Badge variant="secondary" className="text-xs">
                {feature.category}
              </Badge>
            </div>
            <h3 className="font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </Card>
        ))}
      </div>

      {/* Pricing Plans */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
          <p className="text-muted-foreground">Select the perfect plan for your wellness journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card
              key={`pricing-plan-${plan.id}-${index}`}
              className={`p-6 relative ${
                plan.popular 
                  ? 'border-[hsl(var(--wellness-primary))] shadow-lg scale-105' 
                  : 'hover:shadow-md transition-shadow'
              }`}
            >
              {plan.popular && (
                <Badge 
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[hsl(var(--wellness-primary))] text-white"
                >
                  Most Popular
                </Badge>
              )}
              
              {plan.savings && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-3 right-4 bg-[hsl(var(--wellness-secondary))] text-white"
                >
                  {plan.savings}
                </Badge>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-[hsl(var(--wellness-primary))] mb-1">
                  {plan.price}
                </div>
                <p className="text-muted-foreground text-sm">{plan.period}</p>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </div>

              <div className="space-y-3 mb-6">
                {premiumFeatures.slice(0, 4).map((feature, featureIndex) => (
                  <div key={`plan-feature-${plan.id}-${feature.title}-${featureIndex}`} className="flex items-center text-sm">
                    <Check className="w-4 h-4 text-[hsl(var(--wellness-primary))] mr-2 flex-shrink-0" />
                    <span>{feature.title}</span>
                  </div>
                ))}
                <div className="flex items-center text-sm">
                  <Check className="w-4 h-4 text-[hsl(var(--wellness-primary))] mr-2 flex-shrink-0" />
                  <span>24/7 Premium Support</span>
                </div>
              </div>

              <Button
                onClick={() => handleUpgrade(plan)}
                className={`w-full ${
                  plan.popular 
                    ? 'bg-[hsl(var(--wellness-primary))] hover:bg-[hsl(var(--wellness-primary))] text-white' 
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
                size="lg"
              >
                {plan.name === 'Lifetime' ? 'Get Lifetime Access' : 'Start Free Trial'}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          plan={selectedPlan}
        />
      )}
    </div>
  );
}

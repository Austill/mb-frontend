import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { 
  Phone, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Heart,
  Shield,
  Users,
  ExternalLink,
  AlertTriangle,
  Headphones
} from "lucide-react";

interface CrisisResource {
  id: string;
  name: string;
  phone: string;
  description: string;
  availability: string;
  type: 'hotline' | 'text' | 'chat' | 'local';
  urgent?: boolean;
}

const crisisResources: CrisisResource[] = [
  {
    id: "988",
    name: "988 Suicide & Crisis Lifeline",
    phone: "988",
    description: "24/7 free and confidential support for people in distress, prevention and crisis resources",
    availability: "24/7",
    type: 'hotline',
    urgent: true
  },
  {
    id: "crisis-text",
    name: "Crisis Text Line",
    phone: "Text HOME to 741741",
    description: "Free, 24/7 crisis support via text message with trained crisis counselors",
    availability: "24/7",
    type: 'text',
    urgent: true
  },
  {
    id: "samhsa",
    name: "SAMHSA National Helpline",
    phone: "1-800-662-4357",
    description: "Treatment referral and information service for mental health and substance use disorders",
    availability: "24/7",
    type: 'hotline'
  },
  {
    id: "nami",
    name: "NAMI HelpLine",
    phone: "1-800-950-6264",
    description: "Information, referrals and support for mental health conditions and family members",
    availability: "Mon-Fri 10am-10pm ET",
    type: 'hotline'
  },
  {
    id: "trevor",
    name: "The Trevor Project",
    phone: "1-866-488-7386",
    description: "Crisis intervention and suicide prevention for LGBTQ+ youth under 25",
    availability: "24/7",
    type: 'hotline'
  },
  {
    id: "veterans",
    name: "Veterans Crisis Line",
    phone: "1-800-273-8255 (Press 1)",
    description: "24/7 confidential support for veterans in crisis and their families",
    availability: "24/7",
    type: 'hotline'
  },
  {
    id: "postpartum",
    name: "Postpartum Support International",
    phone: "1-800-944-4773",
    description: "Support for perinatal mood and anxiety disorders",
    availability: "24/7",
    type: 'hotline'
  },
  {
    id: "domestic-violence",
    name: "National Domestic Violence Hotline",
    phone: "1-800-799-7233",
    description: "24/7 confidential support for domestic violence survivors",
    availability: "24/7",
    type: 'hotline'
  },
  {
    id: "sexual-assault",
    name: "RAINN National Sexual Assault Hotline",
    phone: "1-800-656-4673",
    description: "24/7 confidential support for sexual assault survivors",
    availability: "24/7",
    type: 'hotline'
  },
  {
    id: "trans-lifeline",
    name: "Trans Lifeline",
    phone: "1-877-565-8860",
    description: "Crisis support specifically for transgender people, by transgender people",
    availability: "24/7",
    type: 'hotline'
  }
];

const copingStrategies = [
  {
    title: "Grounding Technique (5-4-3-2-1)",
    description: "Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste",
    icon: <Shield className="w-5 h-5" />
  },
  {
    title: "Box Breathing",
    description: "Breathe in for 4, hold for 4, out for 4, hold for 4. Repeat slowly.",
    icon: <Heart className="w-5 h-5" />
  },
  {
    title: "Reach Out",
    description: "Call a trusted friend, family member, counselor, or crisis hotline",
    icon: <Users className="w-5 h-5" />
  },
  {
    title: "Change Your Environment",
    description: "Move to a safe space, go outside, or change your physical position",
    icon: <MapPin className="w-5 h-5" />
  },
  {
    title: "Progressive Muscle Relaxation",
    description: "Tense and release each muscle group from toes to head",
    icon: <Heart className="w-5 h-5" />
  },
  {
    title: "Cold Water",
    description: "Splash cold water on your face or hold ice cubes to ground yourself",
    icon: <Shield className="w-5 h-5" />
  }
];

export default function CrisisSupport() {
  const [selectedResource, setSelectedResource] = useState<CrisisResource | null>(null);

  const handleCall = (phone: string, name: string) => {
    // For web, we can create a tel: link
    if (phone.includes("Text")) {
      alert(`To use Crisis Text Line:\n${phone}\n\nThis will open your messaging app.`);
    } else {
      const telLink = `tel:${phone.replace(/[^\d]/g, '')}`;
      window.location.href = telLink;
    }
  };

  const handleEmergencyCall = () => {
    if (confirm("This will dial 911 for emergency services. Continue?")) {
      window.location.href = "tel:911";
    }
  };

  const getResourceIcon = (type: CrisisResource['type']) => {
    switch (type) {
      case 'hotline': return <Phone className="w-5 h-5" />;
      case 'text': return <MessageCircle className="w-5 h-5" />;
      case 'chat': return <Headphones className="w-5 h-5" />;
      case 'local': return <MapPin className="w-5 h-5" />;
      default: return <Phone className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Emergency Alert */}
      <Alert className="border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.05)]">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span className="font-medium">
            If you're having thoughts of suicide or are in immediate danger, please call 911 or go to your nearest emergency room.
          </span>
          <Button 
            size="sm" 
            variant="destructive"
            onClick={handleEmergencyCall}
            className="ml-4 flex-shrink-0"
          >
            Call 911
          </Button>
        </AlertDescription>
      </Alert>

      {/* Quick Help Section */}
      <Card className="p-6 bg-gradient-to-br from-background to-[hsl(var(--wellness-primary)/0.05)]">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Crisis Support & Resources</h2>
          <p className="text-muted-foreground">
            You're not alone. Help is available 24/7 from trained counselors.
          </p>
        </div>

        {/* Immediate Help Buttons */}
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <Button
            size="lg"
            onClick={() => handleCall("988", "988 Suicide & Crisis Lifeline")}
            className="bg-[hsl(var(--wellness-primary))] hover:bg-[hsl(var(--wellness-primary))] text-white h-16"
          >
            <Phone className="w-6 h-6 mr-3" />
            <div className="text-left">
              <div className="font-semibold">Call 988</div>
              <div className="text-sm opacity-90">Suicide & Crisis Lifeline</div>
            </div>
          </Button>

          <Button
            size="lg"
            onClick={() => handleCall("Text HOME to 741741", "Crisis Text Line")}
            variant="outline"
            className="h-16 border-[hsl(var(--wellness-primary))] text-[hsl(var(--wellness-primary))] hover:bg-[hsl(var(--wellness-primary)/0.1)]"
          >
            <MessageCircle className="w-6 h-6 mr-3" />
            <div className="text-left">
              <div className="font-semibold">Text HOME to 741741</div>
              <div className="text-sm opacity-70">Crisis Text Line</div>
            </div>
          </Button>
        </div>

        {/* Quick Coping Strategies */}
        <div>
          <h3 className="font-semibold mb-4 text-center">Quick Coping Strategies</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {copingStrategies.map((strategy, index) => (
              <div key={`coping-strategy-${strategy.title}-${index}`} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                <div className="text-[hsl(var(--wellness-primary))] mt-0.5">
                  {strategy.icon}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{strategy.title}</h4>
                  <p className="text-xs text-muted-foreground">{strategy.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* All Crisis Resources */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Crisis Resources & Hotlines</h3>
        <div className="space-y-4">
          {crisisResources.map((resource) => (
            <div 
              key={resource.id}
              className={cn(
                "border rounded-lg p-4 transition-all hover:shadow-md",
                resource.urgent && "border-[hsl(var(--wellness-primary))] bg-[hsl(var(--wellness-primary)/0.02)]"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={cn(
                    "p-2 rounded-full text-white",
                    resource.urgent 
                      ? "bg-[hsl(var(--wellness-primary))]" 
                      : "bg-[hsl(var(--wellness-secondary))]"
                  )}>
                    {getResourceIcon(resource.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold">{resource.name}</h4>
                      {resource.urgent && (
                        <span className="text-xs bg-[hsl(var(--wellness-primary))] text-white px-2 py-1 rounded-full">
                          24/7
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {resource.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{resource.availability}</span>
                      </div>
                      <div className="font-medium text-foreground">
                        {resource.phone}
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleCall(resource.phone, resource.name)}
                  className={cn(
                    "ml-4",
                    resource.urgent 
                      ? "bg-[hsl(var(--wellness-primary))] hover:bg-[hsl(var(--wellness-primary))] text-white"
                      : "bg-[hsl(var(--wellness-secondary))] hover:bg-[hsl(var(--wellness-secondary))] text-white"
                  )}
                >
                  {resource.type === 'text' ? 'Text' : 'Call'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Safety Planning */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Safety Planning</h3>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/30">
            <h4 className="font-medium mb-2">Create Your Safety Plan</h4>
            <p className="text-sm text-muted-foreground mb-3">
              A safety plan helps you recognize warning signs and know what to do during a crisis.
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Identify your personal warning signs</li>
              <li>• List coping strategies that have worked</li>
              <li>• Keep contact information easily accessible</li>
              <li>• Remove or secure means of self-harm</li>
              <li>• Identify supportive people in your life</li>
            </ul>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() => alert("Safety planning feature coming soon! For now, consider writing down your plan or working with a counselor.")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Learn More About Safety Planning
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-muted/30">
            <h4 className="font-medium mb-2">Share Your Location (Optional)</h4>
            <p className="text-sm text-muted-foreground mb-3">
              In case of emergency, you can share your location with trusted contacts.
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      const { latitude, longitude } = position.coords;
                      alert(`Location sharing would work here:\nLatitude: ${latitude}\nLongitude: ${longitude}\n\nIn a real app, this would be shared with your emergency contacts.`);
                    },
                    (error) => {
                      alert("Location access denied or unavailable.");
                    }
                  );
                } else {
                  alert("Geolocation is not supported by this browser.");
                }
              }}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Share Location with Trusted Contact
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

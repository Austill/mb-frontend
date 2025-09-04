import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  Wind,
  Heart,
  Brain,
  Zap,
  Clock
} from "lucide-react";

interface MeditationSession {
  id: string;
  name: string;
  description: string;
  duration: number; // in seconds
  type: 'breathing' | 'mindfulness' | 'relaxation' | 'stress-relief';
  icon: React.ReactNode;
  instructions: string[];
}

const meditationSessions: MeditationSession[] = [
  {
    id: "quick-calm",
    name: "Quick Calm Down",
    description: "Immediate stress relief in just 2 minutes",
    duration: 120,
    type: 'stress-relief',
    icon: <Zap className="w-5 h-5" />,
    instructions: [
      "Find a comfortable position",
      "Close your eyes if you feel comfortable",
      "Take a deep breath in for 4 counts",
      "Hold your breath for 4 counts", 
      "Exhale slowly for 6 counts",
      "Repeat and let your body relax"
    ]
  },
  {
    id: "breathing-exercise",
    name: "4-7-8 Breathing",
    description: "Calming breathing technique for anxiety relief",
    duration: 300,
    type: 'breathing',
    icon: <Wind className="w-5 h-5" />,
    instructions: [
      "Sit comfortably with your back straight",
      "Place the tip of your tongue behind your upper teeth",
      "Exhale completely through your mouth",
      "Inhale through your nose for 4 counts",
      "Hold your breath for 7 counts", 
      "Exhale through your mouth for 8 counts"
    ]
  },
  {
    id: "body-scan",
    name: "Body Scan Relaxation", 
    description: "Progressive muscle relaxation for deep calm",
    duration: 600,
    type: 'relaxation',
    icon: <Heart className="w-5 h-5" />,
    instructions: [
      "Lie down or sit comfortably",
      "Start by focusing on your toes",
      "Tense and then relax each muscle group",
      "Move slowly up through your body", 
      "Notice the difference between tension and relaxation",
      "End with your whole body feeling calm and heavy"
    ]
  },
  {
    id: "mindful-moment",
    name: "Mindful Awareness",
    description: "Present moment awareness practice",
    duration: 480,
    type: 'mindfulness', 
    icon: <Brain className="w-5 h-5" />,
    instructions: [
      "Sit quietly and focus on the present moment",
      "Notice your thoughts without judgment",
      "Bring attention back to your breath when mind wanders",
      "Observe sounds, sensations, and feelings",
      "Accept whatever arises with kindness",
      "Return to breath as your anchor"
    ]
  }
];

export default function Meditation() {
  const [selectedSession, setSelectedSession] = useState<MeditationSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  const startSession = (session: MeditationSession) => {
    setSelectedSession(session);
    setTimeRemaining(session.duration);
    setCurrentInstructionIndex(0);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (!selectedSession) return;
    
    if (isPlaying) {
      clearInterval(intervalRef.current);
    } else {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsPlaying(false);
            clearInterval(intervalRef.current);
            // Session completed
            alert("Meditation session completed! Great job! 🧘‍♀️");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    setIsPlaying(!isPlaying);
  };

  const resetSession = () => {
    clearInterval(intervalRef.current);
    setIsPlaying(false);
    if (selectedSession) {
      setTimeRemaining(selectedSession.duration);
    }
    setCurrentInstructionIndex(0);
  };

  const exitSession = () => {
    clearInterval(intervalRef.current);
    setSelectedSession(null);
    setIsPlaying(false);
    setTimeRemaining(0);
    setCurrentInstructionIndex(0);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Update instruction index based on time progression
  useEffect(() => {
    if (selectedSession && timeRemaining > 0) {
      const elapsed = selectedSession.duration - timeRemaining;
      const instructionDuration = selectedSession.duration / selectedSession.instructions.length;
      const newIndex = Math.min(
        Math.floor(elapsed / instructionDuration),
        selectedSession.instructions.length - 1
      );
      setCurrentInstructionIndex(newIndex);
    }
  }, [timeRemaining, selectedSession]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeColor = (type: MeditationSession['type']) => {
    switch (type) {
      case 'breathing': return 'hsl(var(--wellness-secondary))';
      case 'mindfulness': return 'hsl(var(--wellness-primary))';
      case 'relaxation': return 'hsl(var(--wellness-calm))';
      case 'stress-relief': return 'hsl(var(--wellness-accent))';
      default: return 'hsl(var(--wellness-primary))';
    }
  };

  if (selectedSession) {
    const progress = ((selectedSession.duration - timeRemaining) / selectedSession.duration) * 100;
    
    return (
      <div className="space-y-6">
        {/* Session Header */}
        <Card className="p-6 bg-gradient-to-br from-background to-[hsl(var(--wellness-primary)/0.05)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div 
                className="p-2 rounded-full text-white"
                style={{ backgroundColor: getTypeColor(selectedSession.type) }}
              >
                {selectedSession.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold">{selectedSession.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedSession.description}</p>
              </div>
            </div>
            <Button variant="outline" onClick={exitSession}>
              Exit Session
            </Button>
          </div>

          {/* Timer Display */}
          <div className="text-center mb-6">
            <div className="text-4xl font-mono font-bold mb-2" style={{ color: getTypeColor(selectedSession.type) }}>
              {formatTime(timeRemaining)}
            </div>
            <Progress value={progress} className="w-full h-2 mb-4" />
            <div className="text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4 mb-6">
            <Button
              onClick={togglePlayPause}
              size="lg"
              className="bg-[hsl(var(--wellness-primary))] hover:bg-[hsl(var(--wellness-primary))] text-white"
            >
              {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
              {isPlaying ? "Pause" : "Start"}
            </Button>
            <Button onClick={resetSession} variant="outline" size="lg">
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
            </Button>
            <Button 
              onClick={() => setIsMuted(!isMuted)} 
              variant="outline" 
              size="lg"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>
        </Card>

        {/* Current Instruction */}
        <Card className="p-6 text-center">
          <div className="mb-4">
            <div className="text-sm text-muted-foreground mb-2">
              Step {currentInstructionIndex + 1} of {selectedSession.instructions.length}
            </div>
            <h3 className="text-lg font-semibold mb-4">Current Guidance</h3>
          </div>
          
          <div className="max-w-md mx-auto">
            <p className="text-xl leading-relaxed" style={{ color: getTypeColor(selectedSession.type) }}>
              {selectedSession.instructions[currentInstructionIndex]}
            </p>
          </div>

          {/* Breathing Visual (for breathing exercises) */}
          {selectedSession.type === 'breathing' && (
            <div className="mt-8">
              <div 
                className={cn(
                  "w-20 h-20 mx-auto rounded-full transition-all duration-4000 ease-in-out",
                  isPlaying && "animate-pulse"
                )}
                style={{ 
                  backgroundColor: `${getTypeColor(selectedSession.type)}20`,
                  border: `2px solid ${getTypeColor(selectedSession.type)}`
                }}
              />
              <p className="text-sm text-muted-foreground mt-2">
                {isPlaying ? "Breathe with the rhythm" : "Press start to begin"}
              </p>
            </div>
          )}
        </Card>

        {/* All Instructions */}
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Session Guide</h4>
          <div className="space-y-3">
            {selectedSession.instructions.map((instruction, index) => (
              <div 
                key={index}
                className={cn(
                  "flex items-start space-x-3 p-3 rounded-lg transition-all",
                  index === currentInstructionIndex 
                    ? "bg-primary/10 border-l-4 border-primary" 
                    : "bg-muted/30"
                )}
              >
                <div 
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium",
                    index === currentInstructionIndex 
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {index + 1}
                </div>
                <p className={cn(
                  "flex-1",
                  index === currentInstructionIndex ? "font-medium" : "text-muted-foreground"
                )}>
                  {instruction}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-background to-[hsl(var(--wellness-primary)/0.05)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Meditation & Relaxation</h2>
          <p className="text-muted-foreground mb-6">
            Take a moment to breathe, relax, and center yourself
          </p>
          
          {/* Quick Calm Button */}
          <Button
            onClick={() => startSession(meditationSessions[0])}
            size="lg"
            className="bg-[hsl(var(--wellness-accent))] hover:bg-[hsl(var(--wellness-accent))] text-white shadow-lg"
          >
            <Zap className="w-5 h-5 mr-2" />
            Quick Calm Down (2 min)
          </Button>
        </div>
      </Card>

      {/* Meditation Sessions */}
      <div className="grid gap-6 md:grid-cols-2">
        {meditationSessions.map((session) => (
          <Card key={session.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <div 
                className="p-3 rounded-full text-white flex-shrink-0"
                style={{ backgroundColor: getTypeColor(session.type) }}
              >
                {session.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold">{session.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" />
                    {Math.ceil(session.duration / 60)} min
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  {session.description}
                </p>
                
                {/* Instructions Preview */}
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">What you'll do:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {session.instructions.slice(0, 2).map((instruction, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1 h-1 rounded-full bg-current mt-2 mr-2 flex-shrink-0" />
                        {instruction}
                      </li>
                    ))}
                    {session.instructions.length > 2 && (
                      <li className="text-xs">
                        +{session.instructions.length - 2} more steps
                      </li>
                    )}
                  </ul>
                </div>

                <Button
                  onClick={() => startSession(session)}
                  className="w-full"
                  style={{ 
                    backgroundColor: getTypeColor(session.type),
                    color: 'white'
                  }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Session
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
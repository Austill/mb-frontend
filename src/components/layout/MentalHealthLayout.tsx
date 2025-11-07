import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, X, Settings as SettingsIcon, Heart, BookOpen, Brain, Phone, BarChart3, Crown, LogOut, Leaf } from "lucide-react";
import MoodTracker from "@/components/mood/MoodTracker";
import Journal from "@/components/journal/Journal";
import Meditation from "@/components/meditation/Meditation";
import CrisisSupport from "@/components/crisis/CrisisSupport";
import ProgressDashboard from "@/components/progress/ProgressDashboard";
import PremiumFeatures from "@/components/premium/PremiumFeatures";
import Settings from "@/components/settings/Settings";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { Outlet } from "react-router-dom";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  isPremium?: boolean;
}

const navItems: NavItem[] = [
  { id: "mood", label: "Mood Tracker", icon: Heart, path: "/mood" },
  { id: "journal", label: "Journal", icon: BookOpen, path: "/journal" },
  { id: "meditation", label: "Meditation", icon: Brain, path: "/meditation" },
  { id: "crisis", label: "Crisis Support", icon: Phone, path: "/crisis" },
  { id: "progress", label: "Progress", icon: BarChart3, path: "/progress" },
  { id: "premium", label: "Premium", icon: Crown, path: "/premium", isPremium: true },
  { id: "settings", label: "Settings", icon: SettingsIcon, path: "/settings" }
];

interface MentalHealthLayoutProps {
  onSignOut?: () => void;
  isPremium?: boolean;
}

export default function MentalHealthLayout({ onSignOut, isPremium = false }: MentalHealthLayoutProps) {
  const [activeTab, setActiveTab] = useState("mood");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="bg-background border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--wellness-primary))] to-[hsl(var(--wellness-secondary))] flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-[hsl(var(--wellness-primary))] to-[hsl(var(--wellness-secondary))] bg-clip-text text-transparent">
              SereniTree
            </h1>
            {isPremium && (
              <Badge className="bg-gradient-to-r from-[hsl(var(--wellness-primary))] to-[hsl(var(--wellness-secondary))] text-white">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => setActiveTab("settings")}>
              <SettingsIcon className="w-4 h-4" />
            </Button>
            {onSignOut && (
              <Button variant="ghost" size="sm" onClick={onSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </header>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-background border-b border-border">
            <div className="flex flex-col">
              {navItems.map((item) => (
                <div key={`mobile-nav-${item.id}`}>
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-3 w-full px-4 py-3 text-left transition-colors relative ${
                      activeTab === item.id
                        ? "bg-[hsl(var(--wellness-primary))] text-white"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {item.isPremium && (
                      <Crown className="w-4 h-4 ml-auto text-[hsl(var(--wellness-primary))]" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Desktop Navigation */}
        <nav className="hidden md:block bg-background/50 border-b border-border">
          <div className="px-4 py-2">
            <div className="flex space-x-1">
              {navItems.map((item) => (
                <button
                  key={`desktop-nav-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors relative ${
                    activeTab === item.id
                      ? "bg-[hsl(var(--wellness-primary))] text-white"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.isPremium && (
                    <Crown className="w-4 h-4 ml-auto text-[hsl(var(--wellness-primary))]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === "mood" && <MoodTracker />}
          {activeTab === "journal" && <Journal />}
          {activeTab === "meditation" && <Meditation />}
          {activeTab === "crisis" && <CrisisSupport />}
          {activeTab === "progress" && <ProgressDashboard />}
          {activeTab === "premium" && <PremiumFeatures isPremium={isPremium} />}
          {activeTab === "settings" && <Settings />}
        </main>
      </div>
    </div>
  );
}

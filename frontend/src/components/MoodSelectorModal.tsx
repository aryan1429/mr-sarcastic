import { Smile, Frown, Zap, Cloud, Target, Meh } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface MoodOption {
    value: string;
    label: string;
    icon: React.ReactNode;
    color: string;
}

const moodOptions: MoodOption[] = [
    { value: "happy", label: "Happy", icon: <Smile className="w-5 h-5" />, color: "text-yellow-500" },
    { value: "sad", label: "Sad", icon: <Frown className="w-5 h-5" />, color: "text-blue-500" },
    { value: "energetic", label: "Energetic", icon: <Zap className="w-5 h-5" />, color: "text-orange-500" },
    { value: "calm", label: "Calm", icon: <Cloud className="w-5 h-5" />, color: "text-green-500" },
    { value: "focused", label: "Focused", icon: <Target className="w-5 h-5" />, color: "text-purple-500" },
    { value: "neutral", label: "Neutral", icon: <Meh className="w-5 h-5" />, color: "text-gray-500" },
];

interface MoodSelectorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentMood: string;
    onMoodChange: (mood: string) => void;
}

export const MoodSelectorModal = ({
    open,
    onOpenChange,
    currentMood,
    onMoodChange,
}: MoodSelectorModalProps) => {
    const handleMoodSelect = (mood: string) => {
        onMoodChange(mood);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Change Your Mood</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3 py-4">
                    {moodOptions.map((mood) => (
                        <Button
                            key={mood.value}
                            variant={currentMood.toLowerCase() === mood.value ? "default" : "outline"}
                            className={`flex items-center justify-start gap-3 h-14 ${currentMood.toLowerCase() === mood.value ? "" : mood.color
                                }`}
                            onClick={() => handleMoodSelect(mood.value)}
                        >
                            {mood.icon}
                            <span className="font-medium">{mood.label}</span>
                        </Button>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground text-center">
                    Select a mood to influence Mr. Sarcastic's responses
                </p>
            </DialogContent>
        </Dialog>
    );
};

export default MoodSelectorModal;

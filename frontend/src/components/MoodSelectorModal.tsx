import { useState } from "react";
import { Smile, Frown, Zap, Cloud, Target, Meh, Skull } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MoodOption {
    value: string;
    label: string;
    icon: React.ReactNode;
    color: string;
    isDangerous?: boolean;
}

const moodOptions: MoodOption[] = [
    { value: "happy", label: "Happy", icon: <Smile className="w-5 h-5" />, color: "text-yellow-500" },
    { value: "sad", label: "Sad", icon: <Frown className="w-5 h-5" />, color: "text-blue-500" },
    { value: "energetic", label: "Energetic", icon: <Zap className="w-5 h-5" />, color: "text-orange-500" },
    { value: "calm", label: "Calm", icon: <Cloud className="w-5 h-5" />, color: "text-green-500" },
    { value: "focused", label: "Focused", icon: <Target className="w-5 h-5" />, color: "text-purple-500" },
    { value: "neutral", label: "Neutral", icon: <Meh className="w-5 h-5" />, color: "text-gray-500" },
    { value: "toxic", label: "Toxic", icon: <Skull className="w-5 h-5" />, color: "text-red-600", isDangerous: true },
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
    const [showToxicWarning, setShowToxicWarning] = useState(false);

    const handleMoodSelect = (mood: string, isDangerous?: boolean) => {
        if (isDangerous) {
            // Show warning dialog for toxic mood
            setShowToxicWarning(true);
        } else {
            onMoodChange(mood);
            onOpenChange(false);
        }
    };

    const handleToxicConfirm = () => {
        setShowToxicWarning(false);
        onMoodChange("toxic");
        onOpenChange(false);
    };

    const handleToxicCancel = () => {
        setShowToxicWarning(false);
    };

    return (
        <>
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
                                className={`flex items-center justify-start gap-3 h-14 ${currentMood.toLowerCase() === mood.value
                                        ? mood.isDangerous ? "bg-red-600 hover:bg-red-700" : ""
                                        : mood.color
                                    } ${mood.isDangerous ? "border-red-500 hover:bg-red-50 dark:hover:bg-red-950" : ""}`}
                                onClick={() => handleMoodSelect(mood.value, mood.isDangerous)}
                            >
                                {mood.icon}
                                <span className="font-medium">{mood.label}</span>
                                {mood.isDangerous && <span className="text-xs ml-auto">⚠️</span>}
                            </Button>
                        ))}
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                        Select a mood to influence Mr. Sarcastic's responses
                    </p>
                </DialogContent>
            </Dialog>

            {/* Toxic Mode Warning Dialog */}
            <AlertDialog open={showToxicWarning} onOpenChange={setShowToxicWarning}>
                <AlertDialogContent className="border-red-500">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <Skull className="w-6 h-6" />
                            ⚠️ TOXIC MODE WARNING 😈
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                            <div className="space-y-3">
                                <p className="font-semibold text-red-500">
                                    Are you SURE you want me to be toxic? 😈💀
                                </p>
                                <p className="text-muted-foreground">
                                    In Toxic Mode, I will be <strong>completely unfiltered</strong>.
                                    I won't hold back, I'll roast you mercilessly, and yes...
                                    there WILL be swearing. 🔥
                                </p>
                                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                    This is your only warning. Proceed at your own risk! 💀
                                </p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleToxicCancel} className="mr-2">
                            ❌ No, keep it friendly
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleToxicConfirm}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            😈 Yes, unleash the toxicity!
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default MoodSelectorModal;

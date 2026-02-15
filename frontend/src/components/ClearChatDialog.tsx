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

interface ClearChatDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export const ClearChatDialog = ({ open, onOpenChange, onConfirm }: ClearChatDialogProps) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="border-destructive/30">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <span className="text-destructive">🗑️</span>
                        Clear Chat History?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete all your chat messages with Mr. Sarcastic.
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="transition-all duration-200 hover:scale-[1.02]">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-destructive/20"
                    >
                        Clear All
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ClearChatDialog;

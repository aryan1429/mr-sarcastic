import { Download, FileText, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToText, exportToJSON, downloadFile, getExportFilename } from "@/utils/chatExport";

interface ExportMessage {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
    mood?: string;
}

interface ExportDropdownProps {
    messages: ExportMessage[];
    disabled?: boolean;
}

export const ExportDropdown = ({ messages, disabled = false }: ExportDropdownProps) => {
    const handleExportText = () => {
        const textContent = exportToText(messages);
        downloadFile(textContent, getExportFilename('txt'), 'text/plain');
    };

    const handleExportJSON = () => {
        const jsonContent = exportToJSON(messages);
        downloadFile(jsonContent, getExportFilename('json'), 'application/json');
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    disabled={disabled}
                >
                    <Download className="w-4 h-4" />
                    Export Conversation
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={handleExportText} className="cursor-pointer">
                    <FileText className="w-4 h-4 mr-2" />
                    Export as Text
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportJSON} className="cursor-pointer">
                    <FileJson className="w-4 h-4 mr-2" />
                    Export as JSON
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ExportDropdown;

export interface ExportMessage {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
    mood?: string;
}

/**
 * Convert messages to plain text format
 */
export const exportToText = (messages: ExportMessage[]): string => {
    const header = `Mr. Sarcastic Chat Export\nExported on: ${new Date().toLocaleString()}\n${'='.repeat(50)}\n\n`;

    const content = messages.map(msg => {
        const timestamp = new Date(msg.timestamp).toLocaleString();
        const sender = msg.isUser ? 'You' : 'Mr. Sarcastic';
        const moodInfo = msg.mood ? ` [Mood: ${msg.mood}]` : '';
        return `[${timestamp}] ${sender}${moodInfo}:\n${msg.text}\n`;
    }).join('\n');

    return header + content;
};

/**
 * Convert messages to JSON format
 */
export const exportToJSON = (messages: ExportMessage[]): string => {
    const exportData = {
        exportedAt: new Date().toISOString(),
        appName: 'Mr. Sarcastic',
        messageCount: messages.length,
        messages: messages.map(msg => ({
            id: msg.id,
            sender: msg.isUser ? 'user' : 'mr-sarcastic',
            text: msg.text,
            timestamp: new Date(msg.timestamp).toISOString(),
            mood: msg.mood || null
        }))
    };

    return JSON.stringify(exportData, null, 2);
};

/**
 * Trigger file download in browser
 */
export const downloadFile = (content: string, filename: string, mimeType: string): void => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Get filename with timestamp
 */
export const getExportFilename = (extension: string): string => {
    const date = new Date().toISOString().split('T')[0];
    return `mr-sarcastic-chat-${date}.${extension}`;
};

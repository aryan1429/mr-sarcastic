import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Upload, Youtube, Brain, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

interface TrainingData {
  prompt: string;
  completion: string;
}

const Training = () => {
  const { token } = useAuth();
  const [youtubeUrls, setYoutubeUrls] = useState("");
  const [customData, setCustomData] = useState<TrainingData[]>([
    { prompt: "", completion: "" }
  ]);
  const [maxSteps, setMaxSteps] = useState(500);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState<string>("");
  const [trainingResult, setTrainingResult] = useState<any>(null);

  const addCustomDataRow = () => {
    setCustomData([...customData, { prompt: "", completion: "" }]);
  };

  const updateCustomData = (index: number, field: keyof TrainingData, value: string) => {
    const updated = customData.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setCustomData(updated);
  };

  const removeCustomDataRow = (index: number) => {
    setCustomData(customData.filter((_, i) => i !== index));
  };

  const handleTraining = async () => {
    setIsTraining(true);
    setTrainingStatus("Preparing training data...");
    
    try {
      // Filter out empty custom data
      const validCustomData = customData.filter(
        item => item.prompt.trim() && item.completion.trim()
      );

      // Parse YouTube URLs
      const urls = youtubeUrls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      if (validCustomData.length === 0 && urls.length === 0) {
        throw new Error("Please provide either custom training data or YouTube URLs");
      }

      const requestData = {
        customData: validCustomData.length > 0 ? validCustomData : undefined,
        youtubeUrls: urls.length > 0 ? urls : undefined,
        maxSteps: maxSteps
      };

      setTrainingStatus("Starting training process...");

      const response = await fetch('/api/chat/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (data.success) {
        setTrainingResult({
          status: 'success',
          message: data.data.message,
          modelPath: data.data.model_path
        });
        setTrainingStatus("Training completed successfully!");
      } else {
        throw new Error(data.error || 'Training failed');
      }

    } catch (error: any) {
      console.error('Training error:', error);
      setTrainingResult({
        status: 'error',
        message: error.message || 'Training failed'
      });
      setTrainingStatus("Training failed");
    } finally {
      setIsTraining(false);
    }
  };

  const checkTrainingStatus = async () => {
    try {
      const response = await fetch('/api/chat/training-status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setTrainingResult({
          status: 'info',
          message: `Model trained: ${data.data.model_trained}, Model loaded: ${data.data.model_loaded}`,
          modelPath: data.data.model_path
        });
      }
    } catch (error) {
      console.error('Error checking training status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Train Mr. Sarcastic</h1>
          <p className="text-muted-foreground">
            Customize the AI's personality with your own training data and YouTube content.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* YouTube Training */}
          <Card className="p-6 border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <Youtube className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-semibold">YouTube Training</h2>
            </div>
            
            <Label htmlFor="youtube-urls" className="text-sm font-medium">
              YouTube URLs (one per line)
            </Label>
            <Textarea
              id="youtube-urls"
              placeholder="https://www.youtube.com/watch?v=example1&#10;https://www.youtube.com/watch?v=example2"
              value={youtubeUrls}
              onChange={(e) => setYoutubeUrls(e.target.value)}
              className="mt-2 min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Add YouTube video URLs to extract transcripts for training data.
            </p>
          </Card>

          {/* Custom Training Data */}
          <Card className="p-6 border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-semibold">Custom Training Data</h2>
            </div>
            
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {customData.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Training Pair #{index + 1}</Label>
                    {customData.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeCustomDataRow(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor={`prompt-${index}`} className="text-xs text-muted-foreground">
                      User Prompt
                    </Label>
                    <Input
                      id={`prompt-${index}`}
                      placeholder="User: How are you today?"
                      value={item.prompt}
                      onChange={(e) => updateCustomData(index, 'prompt', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`completion-${index}`} className="text-xs text-muted-foreground">
                      AI Response
                    </Label>
                    <Textarea
                      id={`completion-${index}`}
                      placeholder="Oh, just living the dream! Couldn't be better."
                      value={item.completion}
                      onChange={(e) => updateCustomData(index, 'completion', e.target.value)}
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addCustomDataRow}
              className="mt-4 w-full"
            >
              Add Training Pair
            </Button>
          </Card>
        </div>

        {/* Training Configuration */}
        <Card className="p-6 border-primary/20 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl font-semibold">Training Configuration</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="max-steps" className="text-sm font-medium">
                Maximum Training Steps
              </Label>
              <Input
                id="max-steps"
                type="number"
                min="100"
                max="5000"
                value={maxSteps}
                onChange={(e) => setMaxSteps(parseInt(e.target.value) || 500)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                More steps = better training but longer time
              </p>
            </div>
            
            <Button 
              onClick={handleTraining}
              disabled={isTraining}
              className="w-full"
              size="lg"
            >
              {isTraining ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Training...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Start Training
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={checkTrainingStatus}
              className="w-full"
              size="lg"
            >
              Check Status
            </Button>
          </div>
        </Card>

        {/* Training Status */}
        {(trainingStatus || trainingResult) && (
          <Card className="p-6 border-primary/20 mt-6">
            <div className="flex items-center gap-2 mb-4">
              {trainingResult?.status === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : trainingResult?.status === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : (
                <Brain className="w-5 h-5 text-blue-500" />
              )}
              <h2 className="text-xl font-semibold">Training Status</h2>
            </div>
            
            {trainingStatus && (
              <div className="mb-4">
                <Badge 
                  variant={isTraining ? "default" : "secondary"} 
                  className="mb-2"
                >
                  {trainingStatus}
                </Badge>
              </div>
            )}
            
            {trainingResult && (
              <div className="space-y-2">
                <p className="text-sm">{trainingResult.message}</p>
                {trainingResult.modelPath && (
                  <p className="text-xs text-muted-foreground">
                    Model saved to: {trainingResult.modelPath}
                  </p>
                )}
              </div>
            )}
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Training;

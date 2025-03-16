
import { DiagnosisResponse } from "@/types";
import DiagnosisResult from "./DiagnosisResult";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ResultsDisplayProps {
  results: DiagnosisResponse;
  onReset: () => void;
}

export default function ResultsDisplay({ results, onReset }: ResultsDisplayProps) {
  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={onReset}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>New diagnosis</span>
        </Button>
        
        <div className="text-right">
          <h2 className="text-xl font-semibold">Diagnosis Results</h2>
          <p className="text-sm text-muted-foreground">Based on your symptoms</p>
        </div>
      </div>

      <Separator className="my-4" />

      <Alert className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900/30">
        <AlertTriangle className="h-4 w-4 mr-2" />
        <AlertDescription>
          {results.disclaimer || "This diagnosis is provided for informational purposes only and should not replace professional medical advice. Please consult a healthcare provider for proper diagnosis and treatment."}
        </AlertDescription>
      </Alert>

      <div className="space-y-6 pt-4">
        {results.diagnosis && results.diagnosis.length > 0 ? (
          results.diagnosis.map((item, index) => (
            <DiagnosisResult key={index} diagnosis={item} index={index} />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No diagnosis results available. Please try again with different symptoms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

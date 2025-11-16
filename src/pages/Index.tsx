
import { useState } from "react";
import SymptomForm from "@/components/SymptomForm";
import ResultsDisplay from "@/components/ResultsDisplay";
import { DiagnosisResponse, Symptom } from "@/types";
import { getDiagnosis } from "@/utils/geminiApi";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [diagnosisResults, setDiagnosisResults] = useState<DiagnosisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };
  
  const handleSubmit = async (symptoms: Symptom[], language: string) => {
    setIsLoading(true);
    try {
      const results = await getDiagnosis(symptoms, language);
      if (results) {
        setDiagnosisResults(results);
      }
    } catch (error) {
      console.error("Error getting diagnosis:", error);
      toast.error("Failed to get diagnosis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetDiagnosis = () => {
    setDiagnosisResults(null);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8 border-b">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1">
              <div className="bg-gradient-to-r from-medical-600 to-health-600 p-2 rounded-lg">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="h-6 w-6 text-white"
                >
                  <path d="M19 14a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v.5a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-7c0-.58-.16-1.13-.5-1.59-.24-.33-.4-.57-.47-.68A1 1 0 0 1 6 6a2 2 0 0 1 4 0 1 1 0 0 0 1.71.7l.3-.3a1 1 0 0 0 0-1.4 5 5 0 0 0-7 0 1 1 0 0 0 0 1.4l.3.3a1 1 0 0 0 1.7-.7 2 2 0 0 1 3.22-1.59c.01.01.02.03.04.04" />
                  <path d="M6 10a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4v-3a4 4 0 0 0-4-4h-2a4 4 0 0 0-4 4v3z" />
                  <path d="m11 18 3 6h2l-3-6" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold">CureTrackr</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Medical Diagnosis</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl mx-auto">
          {!diagnosisResults ? (
            <div className="space-y-12">
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">
                  Advanced Medical Diagnosis
                </h1>
                <p className="text-xl text-muted-foreground">
                  Enter your symptoms and get AI-powered diagnosis and treatment recommendations
                </p>
              </div>
              
              <SymptomForm onSubmit={handleSubmit} isLoading={isLoading} />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {[
                  {
                    title: "AI-Powered Diagnosis",
                    description: "Advanced AI analyzes your symptoms and provides potential diagnoses",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <path d="M12 2H2v10h10V2z" /><path d="M12 12H2v10h10V12z" /><path d="M22 2h-10v10h10V2z" /><path d="M22 12h-10v10h10V12z" />
                      </svg>
                    )
                  },
                  {
                    title: "Treatment Information",
                    description: "Get detailed treatment plans and medication recommendations",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <rect width="8" height="12" x="8" y="2" rx="2" /><path d="M4 18a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2H4v-2z" />
                      </svg>
                    )
                  },
                  {
                    title: "Multi-Language Support",
                    description: "Access medical information in multiple languages",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <circle cx="12" cy="12" r="10" /><path d="m2 12 20 0" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                    )
                  }
                ].map((feature, index) => (
                  <div 
                    key={index} 
                    className="glass-card p-6 card-hover-animation flex flex-col items-center text-center animate-fade-up"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="rounded-full bg-primary/10 p-3 mb-4">
                      <div className="text-primary">{feature.icon}</div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ResultsDisplay results={diagnosisResults} onReset={resetDiagnosis} />
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t py-6 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} CureTrackr. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              This tool provides information for educational purposes only and is not a substitute for professional medical advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

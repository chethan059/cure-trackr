
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SYMPTOM_SUGGESTIONS, LANGUAGES } from "@/lib/constants";
import { Symptom } from "@/types";
import { Search, Plus, X, Info, Languages } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { v4 as uuidv4 } from "@/utils/uuid";

interface SymptomFormProps {
  onSubmit: (symptoms: Symptom[], language: string) => void;
  isLoading: boolean;
}

export default function SymptomForm({ onSubmit, isLoading }: SymptomFormProps) {
  const [inputValue, setInputValue] = useState("");
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [language, setLanguage] = useState("en");
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim() === "") {
      setFilteredSuggestions([]);
    } else {
      const filtered = SYMPTOM_SUGGESTIONS.filter(suggestion =>
        suggestion.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    }
  }, [inputValue]);

  // Handle click outside suggestions to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const addSymptom = (text: string) => {
    if (text.trim() === "") return;
    
    const symptomExists = symptoms.some(
      s => s.text.toLowerCase() === text.toLowerCase()
    );
    
    if (!symptomExists) {
      setSymptoms([...symptoms, { id: uuidv4(), text }]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      addSymptom(inputValue);
    }
  };

  const removeSymptom = (id: string) => {
    setSymptoms(symptoms.filter(s => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symptoms.length > 0) {
      onSubmit(symptoms, language);
    }
  };

  return (
    <Card className="glass-card p-6 w-full max-w-2xl mx-auto animate-fade-in">
      <div className="space-y-4">
        <div className="flex flex-col space-y-1.5">
          <h3 className="text-2xl font-semibold tracking-tight">What symptoms are you experiencing?</h3>
          <p className="text-sm text-muted-foreground">
            Enter your symptoms below for an AI-powered diagnosis
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a symptom..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-10 pr-4 py-2 w-full"
                  disabled={isLoading}
                />
              </div>
              <Button
                type="button"
                onClick={() => addSymptom(inputValue)}
                disabled={inputValue.trim() === "" || isLoading}
                size="icon"
                className="hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Symptom Suggestions */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-10 mt-1 w-full bg-background border border-input rounded-md shadow-md overflow-hidden animate-fade-in"
              >
                <ul className="py-1 max-h-60 overflow-auto">
                  {filteredSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="px-4 py-2 text-sm hover:bg-muted cursor-pointer"
                      onClick={() => addSymptom(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Language Selection */}
          <div className="flex items-center space-x-2">
            <Languages className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Language:</span>
            <Select
              value={language}
              onValueChange={setLanguage}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Symptom Tags */}
          <div>
            <div className="flex flex-wrap gap-2">
              {symptoms.map((symptom) => (
                <div
                  key={symptom.id}
                  className={cn(
                    "bg-primary/10 text-primary rounded-full pl-3 pr-1 py-1",
                    "flex items-center text-sm animate-scale-in"
                  )}
                >
                  <span>{symptom.text}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 ml-1 hover:bg-primary/20 rounded-full"
                    onClick={() => removeSymptom(symptom.id)}
                    disabled={isLoading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {symptoms.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  No symptoms added yet
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Info className="h-3 w-3 mr-1" />
                    <span>AI-powered diagnosis</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">
                    This tool uses AI to provide possible diagnoses based on your symptoms. 
                    Always consult with a healthcare professional for medical advice.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              type="submit"
              disabled={symptoms.length === 0 || isLoading}
              className="relative overflow-hidden group"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin mr-2" />
                  <span>Analyzing...</span>
                </div>
              ) : (
                <span>Get Diagnosis</span>
              )}
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}

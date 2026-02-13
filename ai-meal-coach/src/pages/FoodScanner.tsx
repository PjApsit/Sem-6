import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, X, Loader2, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { recognizeFood, getNutritionInfo, indianFoodDatabase, searchFoods } from '@/services/mockApi';
import { FoodItem, FoodRecognitionResult, MealEntry } from '@/types/nutrition';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const mealTypes: { value: MealType; label: string; icon: string }[] = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { value: 'lunch', label: 'Lunch', icon: '☀️' },
  { value: 'dinner', label: 'Dinner', icon: '🌙' },
  { value: 'snack', label: 'Snack', icon: '🍎' },
];

const FoodScanner: React.FC = () => {
  const navigate = useNavigate();
  const { user, addMeal } = useUser();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [step, setStep] = useState<'capture' | 'analyzing' | 'result' | 'confirm'>('capture');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<FoodRecognitionResult | null>(null);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  // Get current meal type based on time
  const getCurrentMealType = (): MealType => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 15) return 'lunch';
    if (hour >= 15 && hour < 18) return 'snack';
    return 'dinner';
  };

  React.useEffect(() => {
    setMealType(getCurrentMealType());
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      processImage(file);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      toast({
        title: 'Camera Error',
        description: 'Could not access camera. Please use file upload instead.',
        variant: 'destructive',
      });
    }
  };

  const captureFromCamera = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg');
    setImagePreview(imageData);
    
    // Stop camera
    const stream = videoRef.current.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsCameraActive(false);
    
    // Process as file
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        processImage(file);
      }
    }, 'image/jpeg');
  };

  const processImage = async (file: File) => {
    setStep('analyzing');
    
    try {
      // Call mock ML API
      const result = await recognizeFood(file);
      setRecognitionResult(result);
      
      // Fetch nutrition info
      const nutritionInfo = await getNutritionInfo(result.foodName);
      if (nutritionInfo) {
        setSelectedFood(nutritionInfo);
      } else {
        // Fallback to first item if not found
        setSelectedFood(indianFoodDatabase[0]);
      }
      
      setStep('result');
    } catch (error) {
      toast({
        title: 'Recognition Failed',
        description: 'Could not identify the food. Please try again or search manually.',
        variant: 'destructive',
      });
      setStep('capture');
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      const results = await searchFoods(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const selectFoodFromSearch = (food: FoodItem) => {
    setSelectedFood(food);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const confirmMeal = () => {
    if (!selectedFood || !user) return;
    
    const meal: MealEntry = {
      id: `meal_${Date.now()}`,
      userId: user.id,
      foodItem: selectedFood,
      quantity,
      mealType,
      timestamp: new Date(),
      imageUrl: imagePreview || undefined,
    };
    
    addMeal(meal);
    
    toast({
      title: 'Meal Logged! 🎉',
      description: `${selectedFood.name} added to your ${mealType}.`,
    });
    
    navigate('/dashboard');
  };

  const reset = () => {
    setStep('capture');
    setImagePreview(null);
    setRecognitionResult(null);
    setSelectedFood(null);
    setQuantity(1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="pt-safe px-4 pt-6 pb-4 flex items-center justify-between">
        <div className="max-w-lg mx-auto w-full">
          <h1 className="text-xl font-display font-bold text-foreground">
            {step === 'capture' ? 'Scan Your Food' : step === 'analyzing' ? 'Analyzing...' : 'Food Detected'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {step === 'capture' 
              ? 'Take a photo or upload an image'
              : step === 'analyzing'
              ? 'Our AI is identifying your meal'
              : 'Review and confirm your meal'
            }
          </p>
        </div>
      </header>

      <main className="px-4 pb-8 max-w-lg mx-auto">
        {/* Capture Step */}
        {step === 'capture' && (
          <div className="space-y-4 animate-fade-in">
            {/* Camera Preview */}
            {isCameraActive ? (
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-foreground/5">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                  <Button
                    onClick={captureFromCamera}
                    className="w-16 h-16 rounded-full gradient-primary shadow-glow"
                  >
                    <Camera className="w-8 h-8" />
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const stream = videoRef.current?.srcObject as MediaStream;
                      stream?.getTracks().forEach(track => track.stop());
                      setIsCameraActive(false);
                    }}
                    className="w-12 h-12 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="aspect-square rounded-2xl bg-muted/50 border-2 border-dashed border-border flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Camera className="w-10 h-10 text-primary" />
                </div>
                <p className="text-muted-foreground text-center px-4">
                  Take a photo of your meal to identify it automatically
                </p>
              </div>
            )}

            {!isCameraActive && (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={startCamera}
                  className="h-14 gradient-primary text-primary-foreground font-semibold rounded-xl"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Camera
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-14 font-semibold rounded-xl"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            )}

            {/* Manual Search Option */}
            <div className="relative">
              <Button
                variant="ghost"
                onClick={() => setShowSearch(!showSearch)}
                className="w-full justify-between text-muted-foreground"
              >
                Or search manually
                <ChevronDown className={cn('w-4 h-4 transition-transform', showSearch && 'rotate-180')} />
              </Button>
              
              {showSearch && (
                <div className="mt-2 space-y-2 animate-fade-in">
                  <input
                    type="text"
                    placeholder="Search for food..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none transition-colors"
                  />
                  {searchResults.length > 0 && (
                    <div className="glass-card p-2 max-h-60 overflow-y-auto">
                      {searchResults.map((food) => (
                        <button
                          key={food.id}
                          onClick={() => {
                            selectFoodFromSearch(food);
                            setStep('result');
                          }}
                          className="w-full p-3 text-left rounded-lg hover:bg-muted transition-colors"
                        >
                          <p className="font-medium text-foreground">{food.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {food.nutrition.calories} kcal • {food.servingSize}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analyzing Step */}
        {step === 'analyzing' && (
          <div className="space-y-6 animate-fade-in">
            {imagePreview && (
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img src={imagePreview} alt="Food" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="relative">
                <div className="w-16 h-16 rounded-full gradient-primary animate-pulse" />
                <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-primary-foreground animate-spin" />
              </div>
              <p className="text-muted-foreground">Analyzing your meal...</p>
            </div>
          </div>
        )}

        {/* Result Step */}
        {step === 'result' && selectedFood && (
          <div className="space-y-6 animate-fade-in">
            {imagePreview && (
              <div className="relative aspect-video rounded-2xl overflow-hidden">
                <img src={imagePreview} alt="Food" className="w-full h-full object-cover" />
                <button
                  onClick={reset}
                  className="absolute top-3 right-3 p-2 rounded-full bg-foreground/20 backdrop-blur-sm"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            )}

            {/* Recognition Result */}
            {recognitionResult && (
              <div className="glass-card p-4 flex items-center gap-3">
                <Check className="w-6 h-6 text-success shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">{recognitionResult.foodName}</p>
                  <p className="text-sm text-muted-foreground">
                    Confidence: {Math.round(recognitionResult.confidence * 100)}%
                  </p>
                </div>
              </div>
            )}

            {/* Food Details */}
            <div className="glass-card p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">{selectedFood.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedFood.servingSize}</p>
                </div>
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                  {selectedFood.category}
                </span>
              </div>

              {/* Nutrition Grid */}
              <div className="grid grid-cols-5 gap-2 pt-2 border-t border-border">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{selectedFood.nutrition.calories}</p>
                  <p className="text-[10px] text-muted-foreground">kcal</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">{selectedFood.nutrition.protein}g</p>
                  <p className="text-[10px] text-muted-foreground">Protein</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-accent">{selectedFood.nutrition.carbohydrates}g</p>
                  <p className="text-[10px] text-muted-foreground">Carbs</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-warning">{selectedFood.nutrition.fat}g</p>
                  <p className="text-[10px] text-muted-foreground">Fat</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-success">{selectedFood.nutrition.fiber}g</p>
                  <p className="text-[10px] text-muted-foreground">Fiber</p>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="glass-card p-4">
              <p className="text-sm font-medium text-foreground mb-3">Servings</p>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))}
                  className="rounded-full"
                >
                  -
                </Button>
                <span className="text-2xl font-bold w-16 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 0.5)}
                  className="rounded-full"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Meal Type Selector */}
            <div className="glass-card p-4">
              <p className="text-sm font-medium text-foreground mb-3">Meal Type</p>
              <div className="grid grid-cols-4 gap-2">
                {mealTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setMealType(type.value)}
                    className={cn(
                      'p-3 rounded-xl border-2 transition-all',
                      mealType === type.value
                        ? 'border-primary bg-primary/10'
                        : 'border-transparent bg-muted'
                    )}
                  >
                    <span className="text-xl block mb-1">{type.icon}</span>
                    <span className="text-xs font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Total Calories */}
            <div className="glass-card p-4 flex items-center justify-between">
              <span className="text-muted-foreground">Total Calories</span>
              <span className="text-2xl font-bold text-foreground">
                {Math.round(selectedFood.nutrition.calories * quantity)} kcal
              </span>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                onClick={reset}
                className="h-14 rounded-xl"
              >
                Try Again
              </Button>
              <Button
                onClick={confirmMeal}
                className="h-14 gradient-primary text-primary-foreground font-semibold rounded-xl"
              >
                Add Meal
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FoodScanner;

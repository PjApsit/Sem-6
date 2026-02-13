import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, X, Loader2, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
//import { recognizeFood, getNutritionInfo, indianFoodDatabase, searchFoods } from '@/services/mockApi';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { NutritionSummaryCards } from '@/components/food/NutritionSummaryCards';

import { recognizeFood } from '@/services/foodApi';
import { getNutritionInfo, indianFoodDatabase, searchFoods } from '@/services/mockApi';
// import { getNutritionFromAI } from '@/services/mockApi';
// import { getNutritionFromAI } from '@/services/nutritionApi';
import { searchUSDAFoods } from '@/services/usdaApi';

const mealTypes = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { value: 'lunch', label: 'Lunch', icon: '☀️' },
  { value: 'dinner', label: 'Dinner', icon: '🌙' },
  { value: 'snack', label: 'Snack', icon: '🍎' },
];

const FoodScanner = () => {
  const navigate = useNavigate();
  const { user, addMeal } = useUser();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  
  const [step, setStep] = useState('capture');
  const [imagePreview, setImagePreview] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState('lunch');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  // Get current meal type based on time
  const getCurrentMealType = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 15) return 'lunch';
    if (hour >= 15 && hour < 18) return 'snack';
    return 'dinner';
  };

  useEffect(() => {
    setMealType(getCurrentMealType());
  }, []);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
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
    const stream = videoRef.current.srcObject;
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

  // const processImage = async (file) => {
  //   setStep('analyzing');
    
  //   try {
  //     // Call mock ML API
  //     const result = await recognizeFood(file);
  //     setRecognitionResult(result);
      
  //     // Fetch nutrition info
  //     const nutritionInfo = await getNutritionInfo(result.foodName);
  //     if (nutritionInfo) {
  //       setSelectedFood(nutritionInfo);
  //     } else {
  //       // Fallback to first item if not found
  //       setSelectedFood(indianFoodDatabase[0]);
  //     }
      
  //     setStep('result');
  //   } catch (error) {
  //     toast({
  //       title: 'Recognition Failed',
  //       description: 'Could not identify the food. Please try again or search manually.',
  //       variant: 'destructive',
  //     });
  //     setStep('capture');
  //   }
  // };

    const processImage = async (file) => {
    setStep('analyzing');

    try {
      // 1️⃣ Always try recognition
      const result = await recognizeFood(file);
      setRecognitionResult(result);

      let nutritionData = null;

      try {
        // 2️⃣ Try nutrition fetch
        const usdaResults = await searchUSDAFoods(result.foodName);

        if (usdaResults.length > 0) {
          nutritionData = usdaResults[0];
        }else{
          console.log("Nutrition fetch failed");
        }
      } catch (nutritionError) {
        console.log("Nutrition fetch failed, using fallback");
      }

      // 3️⃣ If nutrition not found → create fallback object
      if (!nutritionData) {
        nutritionData = {
          name: result.foodName,
          servingSize: "1 serving",
          category: "Unknown",
          nutrition: {
            calories: 0,
            protein: 0,
            carbohydrates: 0,
            fat: 0,
            fiber: 0,
          },
        };
      }

      setSelectedFood(nutritionData);
      setStep('result');

      } catch (error) {
        // Only recognition error should reach here
        toast({
          title: 'Recognition Failed',
          description: 'Could not identify the food from image.',
          variant: 'destructive',
        });

        setStep('capture');
      }
    };


  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      const results = await searchUSDAFoods(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const selectFoodFromSearch = (food) => {
    setSelectedFood(food);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const confirmMeal = () => {
    if (!selectedFood || !user) return;
    
    const meal = {
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

  // Quick add suggestions
  const quickAddSuggestions = [
    'almonds',
    'Carrot',
    'Apple',
    'Banana',
    'Orange'
  ];

  // Manual food entries state
  const [manualFoods, setManualFoods] = useState([{ id: 1, value: '' }]);
  const [isDragOver, setIsDragOver] = useState(false);

  const addManualFoodField = () => {
    setManualFoods([...manualFoods, { id: Date.now(), value: '' }]);
  };

  const updateManualFood = (id, value) => {
    setManualFoods(manualFoods.map(f => f.id === id ? { ...f, value } : f));
  };

  const removeManualFood = (id) => {
    if (manualFoods.length > 1) {
      setManualFoods(manualFoods.filter(f => f.id !== id));
    }
  };

  const handleQuickAdd = (suggestion) => {
    const emptyField = manualFoods.find(f => !f.value.trim());
    if (emptyField) {
      updateManualFood(emptyField.id, suggestion);
    } else {
      setManualFoods([...manualFoods, { id: Date.now(), value: suggestion }]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        processImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddToAnalytics = async () => {
    const validFoods = manualFoods.filter(f => f.value.trim());
    if (validFoods.length === 0) {
      toast({
        title: 'No foods entered',
        description: 'Please enter at least one food item.',
        variant: 'destructive',
      });
      return;
    }

    // Search for first valid food and show result
    const results = await searchUSDAFoods(validFoods[0].value);
    if (results.length > 0) {
      setSelectedFood(results[0]);
      setStep('result');
    } else {
      toast({
        title: 'Food not found',
        description: 'Could not find nutrition info. Try a different food name.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="pt-safe px-4 pt-6 pb-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-display font-bold text-foreground">
            {step === 'capture' ? 'Food Analytics' : step === 'analyzing' ? 'Analyzing...' : 'Food Detected'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {step === 'capture' 
              ? 'Upload a photo or add foods manually'
              : step === 'analyzing'
              ? 'Our AI is identifying your meal'
              : 'Review and confirm your meal'
            }
          </p>
        </div>
      </header>

      <main className="px-4 pb-8 max-w-4xl mx-auto">
        {/* Capture Step - Two Column Dashboard Layout */}
        {step === 'capture' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in p-6 rounded-3xl bg-gradient-to-br from-primary/5 via-background to-accent/5">
            {/* Left Section - Upload & Analyze */}
            <div className="glass-card p-6 space-y-4">
              <div>
                <h2 className="text-lg font-display font-bold text-foreground">Upload and Analyze</h2>
                <p className="text-sm text-muted-foreground">PNG, JPG, JPEG, HEIC</p>
              </div>

              {/* Camera Preview or Upload Area */}
              {isCameraActive ? (
                <div className="relative aspect-square rounded-xl overflow-hidden bg-foreground/5">
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
                        const stream = videoRef.current?.srcObject;
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
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "aspect-[4/3] rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-4",
                    isDragOver 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50 hover:bg-muted/30"
                  )}
                >
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
                    isDragOver ? "bg-primary/20" : "bg-muted"
                  )}>
                    <Upload className={cn(
                      "w-8 h-8 transition-colors",
                      isDragOver ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground">Upload Your Food Photo</p>
                    <p className="text-sm text-muted-foreground">Drop an image here or click to browse</p>
                  </div>
                  <Button className="gradient-primary text-primary-foreground font-semibold rounded-lg px-6">
                    Choose File
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

              {!isCameraActive && (
                <Button
                  variant="outline"
                  onClick={startCamera}
                  className="w-full h-12 rounded-xl"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Use Camera Instead
                </Button>
              )}
            </div>

            {/* Right Section - Manual Food Logging */}
            <div className="glass-card p-6 space-y-4">
              <div>
                <h2 className="text-lg font-display font-bold text-foreground">Log foods manually</h2>
                <p className="text-sm text-muted-foreground">
                  Add quick bites without scanning. We'll estimate macros and include them in your analytics.
                </p>
              </div>

              {/* Quick Add Suggestions */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Quick add:</p>
                <div className="flex flex-wrap gap-2">
                  {quickAddSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleQuickAdd(suggestion)}
                      className="px-3 py-1.5 text-sm rounded-full border border-border bg-background hover:bg-muted hover:border-primary/50 transition-all duration-200 text-foreground"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Food Inputs */}
              <div className="space-y-3">
                {manualFoods.map((food, index) => (
                  <div key={food.id} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={index === 0 ? "e.g., 2 boiled eggs" : "Add another food..."}
                      value={food.value}
                      onChange={(e) => updateManualFood(food.id, e.target.value)}
                      className="flex-1 h-12 px-4 rounded-xl bg-muted border border-border focus:border-primary focus:outline-none transition-colors text-foreground placeholder:text-muted-foreground"
                    />
                    {manualFoods.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeManualFood(food.id)}
                        className="h-12 w-12 rounded-xl text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={addManualFoodField}
                  className="h-11 rounded-xl"
                >
                  <span className="mr-2 text-lg">+</span>
                  Add another food
                </Button>
                <Button
                  onClick={handleAddToAnalytics}
                  className="h-11 gradient-primary text-primary-foreground font-semibold rounded-xl px-6"
                >
                  Add to analytics
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Analyzing Step */}
        {step === 'analyzing' && (
          <div className="space-y-6 animate-fade-in max-w-lg mx-auto">
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
          <div className="space-y-6 animate-fade-in max-w-lg mx-auto">
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
            </div>

            {/* Nutrition Summary Cards */}
            <NutritionSummaryCards 
              nutrition={selectedFood.nutrition} 
              quantity={quantity}
            />

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

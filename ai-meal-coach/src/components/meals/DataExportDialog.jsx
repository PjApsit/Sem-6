import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { Download, FileJson, FileSpreadsheet, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, subDays, subMonths, startOfDay, endOfDay } from 'date-fns';
import * as XLSX from 'xlsx';

const dateRangeOptions = [
  { value: 'today', label: 'Today', getDates: () => ({ start: startOfDay(new Date()), end: endOfDay(new Date()) }) },
  { value: '7days', label: 'Last 7 Days', getDates: () => ({ start: startOfDay(subDays(new Date(), 6)), end: endOfDay(new Date()) }) },
  { value: '30days', label: 'Last 30 Days', getDates: () => ({ start: startOfDay(subDays(new Date(), 29)), end: endOfDay(new Date()) }) },
  { value: '1month', label: 'This Month', getDates: () => ({ start: startOfDay(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), end: endOfDay(new Date()) }) },
  { value: '6months', label: 'Last 6 Months', getDates: () => ({ start: startOfDay(subMonths(new Date(), 6)), end: endOfDay(new Date()) }) },
  { value: 'all', label: 'All Time', getDates: () => ({ start: new Date(0), end: endOfDay(new Date()) }) },
];

const formatOptions = [
  { value: 'json', label: 'JSON', icon: FileJson, description: 'Raw data format' },
  { value: 'csv', label: 'CSV', icon: FileText, description: 'Spreadsheet compatible' },
  { value: 'excel', label: 'Excel', icon: FileSpreadsheet, description: 'Microsoft Excel' },
];

const DataExportDialog = () => {
  const { allMeals, user, dailyGoals } = useUser();
  const [dateRange, setDateRange] = useState('30days');
  const [exportFormat, setExportFormat] = useState('csv');
  const [isOpen, setIsOpen] = useState(false);

  const getFilteredMeals = () => {
    const range = dateRangeOptions.find(r => r.value === dateRange);
    if (!range) return allMeals;

    const { start, end } = range.getDates();
    return allMeals.filter(meal => {
      const mealDate = new Date(meal.timestamp);
      return mealDate >= start && mealDate <= end;
    });
  };

  const prepareMealData = (meals) => {
    return meals.map(meal => {
      const nutrition = meal.nutrition || {};
      return {
        id: meal.id,
        date: format(new Date(meal.timestamp), 'yyyy-MM-dd'),
        time: format(new Date(meal.timestamp), 'HH:mm'),
        mealType: meal.category || 'snack',
        foodName: meal.name || 'Unknown',
        quantity: meal.quantity || 1,
        calories: Math.round((nutrition.calories || 0) * (meal.quantity || 1)),
        protein: Math.round((nutrition.protein || 0) * (meal.quantity || 1) * 10) / 10,
        carbohydrates: Math.round((nutrition.carbohydrates || 0) * (meal.quantity || 1) * 10) / 10,
        fat: Math.round((nutrition.fat || 0) * (meal.quantity || 1) * 10) / 10,
        fiber: Math.round((nutrition.fiber || 0) * (meal.quantity || 1) * 10) / 10,
      };
    });
  };

  const prepareDailySummary = (meals) => {
    const dailyData = {};
    
    meals.forEach(meal => {
      const dateKey = format(new Date(meal.timestamp), 'yyyy-MM-dd');
      const nutrition = meal.nutrition || {};
      const quantity = meal.quantity || 1;
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          totalCalories: 0,
          totalProtein: 0,
          totalCarbohydrates: 0,
          totalFat: 0,
          totalFiber: 0,
          mealCount: 0,
        };
      }
      
      dailyData[dateKey].totalCalories += (nutrition.calories || 0) * quantity;
      dailyData[dateKey].totalProtein += (nutrition.protein || 0) * quantity;
      dailyData[dateKey].totalCarbohydrates += (nutrition.carbohydrates || 0) * quantity;
      dailyData[dateKey].totalFat += (nutrition.fat || 0) * quantity;
      dailyData[dateKey].totalFiber += (nutrition.fiber || 0) * quantity;
      dailyData[dateKey].mealCount += 1;
    });
          totalCalories: 0,
          totalProtein: 0,
          totalCarbohydrates: 0,
          totalFat: 0,
          totalFiber: 0,
          mealCount: 0,
        };
      }
      
      dailyData[dateKey].totalCalories += (nutrition.calories || 0) * quantity;
      dailyData[dateKey].totalProtein += (nutrition.protein || 0) * quantity;
      dailyData[dateKey].totalCarbohydrates += (nutrition.carbohydrates || 0) * quantity;
      dailyData[dateKey].totalFat += (nutrition.fat || 0) * quantity;
      dailyData[dateKey].totalFiber += (nutrition.fiber || 0) * quantity;
      dailyData[dateKey].mealCount += 1;
    });

    return Object.values(dailyData).map(day => ({
      ...day,
      totalCalories: Math.round(day.totalCalories),
      totalProtein: Math.round(day.totalProtein * 10) / 10,
      totalCarbohydrates: Math.round(day.totalCarbohydrates * 10) / 10,
      totalFat: Math.round(day.totalFat * 10) / 10,
      totalFiber: Math.round(day.totalFiber * 10) / 10,
    }));
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAsJSON = (meals) => {
    const mealData = prepareMealData(meals);
    const dailySummary = prepareDailySummary(meals);
    
    const exportData = {
      exportDate: new Date().toISOString(),
      dateRange: dateRangeOptions.find(r => r.value === dateRange)?.label,
      user: user ? { name: user.name, email: user.email } : null,
      dailyGoals,
      summary: {
        totalMeals: meals.length,
        totalDays: dailySummary.length,
        averageCaloriesPerDay: dailySummary.length > 0 
          ? Math.round(dailySummary.reduce((sum, d) => sum + d.totalCalories, 0) / dailySummary.length)
          : 0,
      },
      dailySummary,
      meals: mealData,
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    downloadFile(jsonContent, `nutrition-data-${format(new Date(), 'yyyy-MM-dd')}.json`, 'application/json');
  };

  const exportAsCSV = (meals) => {
    const mealData = prepareMealData(meals);
    
    if (mealData.length === 0) {
      alert('No data to export for the selected date range.');
      return;
    }

    const headers = Object.keys(mealData[0]);
    const csvRows = [
      headers.join(','),
      ...mealData.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in values
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ];

    const csvContent = csvRows.join('\n');
    downloadFile(csvContent, `nutrition-data-${format(new Date(), 'yyyy-MM-dd')}.csv`, 'text/csv');
  };

  const exportAsExcel = (meals) => {
    const mealData = prepareMealData(meals);
    const dailySummary = prepareDailySummary(meals);

    if (mealData.length === 0) {
      alert('No data to export for the selected date range.');
      return;
    }

    const wb = XLSX.utils.book_new();

    // Meals sheet
    const mealsWs = XLSX.utils.json_to_sheet(mealData);
    XLSX.utils.book_append_sheet(wb, mealsWs, 'Meals');

    // Daily Summary sheet
    const summaryWs = XLSX.utils.json_to_sheet(dailySummary);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Daily Summary');

    // User Info sheet
    const userInfo = [
      { field: 'Export Date', value: format(new Date(), 'yyyy-MM-dd HH:mm') },
      { field: 'Date Range', value: dateRangeOptions.find(r => r.value === dateRange)?.label },
      { field: 'Total Meals', value: meals.length },
      { field: 'Total Days', value: dailySummary.length },
    ];
    if (dailyGoals) {
      userInfo.push(
        { field: 'Daily Calorie Goal', value: dailyGoals.calories },
        { field: 'Daily Protein Goal', value: dailyGoals.protein },
        { field: 'Daily Carbs Goal', value: dailyGoals.carbohydrates },
        { field: 'Daily Fat Goal', value: dailyGoals.fat }
      );
    }
    const infoWs = XLSX.utils.json_to_sheet(userInfo);
    XLSX.utils.book_append_sheet(wb, infoWs, 'Export Info');

    XLSX.writeFile(wb, `nutrition-data-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const handleExport = () => {
    const filteredMeals = getFilteredMeals();
    
    switch (exportFormat) {
      case 'json':
        exportAsJSON(filteredMeals);
        break;
      case 'csv':
        exportAsCSV(filteredMeals);
        break;
      case 'excel':
        exportAsExcel(filteredMeals);
        break;
      default:
        break;
    }
    
    setIsOpen(false);
  };

  const filteredCount = getFilteredMeals().length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Export Nutrition Data
          </DialogTitle>
          <DialogDescription>
            Download your meal history and nutrition data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Date Range Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Date Range
            </label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                {dateRangeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {filteredCount} meal{filteredCount !== 1 ? 's' : ''} found in this range
            </p>
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {formatOptions.map(option => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setExportFormat(option.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      exportFormat === option.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-muted-foreground/50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mx-auto mb-1 ${
                      exportFormat === option.value ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <p className={`text-xs font-medium ${
                      exportFormat === option.value ? 'text-primary' : 'text-foreground'
                    }`}>
                      {option.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Export Button */}
          <Button 
            onClick={handleExport} 
            className="w-full gap-2"
            disabled={filteredCount === 0}
          >
            <Download className="h-4 w-4" />
            Download {formatOptions.find(f => f.value === exportFormat)?.label} File
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DataExportDialog;

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Sparkles, Wand2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Transaction, Category } from '@/types';
import { AICategorizationService } from '@/lib/ai-categorization';
import { DatabaseService } from '@/lib/database-service-auth';
import { toast } from 'sonner';

interface TransactionFormProps {
  onSubmit: (transaction: Transaction) => void;
  onCancel?: () => void;
  initialData?: Transaction | null;
  categories: Category[];
}

export function TransactionForm({ onSubmit, onCancel, initialData, categories }: TransactionFormProps) {
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [type, setType] = useState<'income' | 'expense'>(initialData?.type || 'expense');
  const [date, setDate] = useState<Date>(initialData?.date || new Date());
  const [aiInput, setAiInput] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showAI, setShowAI] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filteredCategories = categories.filter(cat => 
    cat.type === type || cat.type === 'both'
  );

  const handleAIInput = () => {
    if (!aiInput.trim()) return;

    setIsLoading(true);
    
    try {
      const result = AICategorizationService.categorizeTransaction(aiInput);
      
      // Fill form with AI suggestions
      if (result.amount) setAmount(result.amount.toString());
      if (result.description) setDescription(result.description);
      if (result.category) setCategory(result.category);
      if (result.type) setType(result.type);

      // Show confidence and reasoning
      if (result.confidence > 70) {
        toast.success(`AI categorized with ${result.confidence.toFixed(0)}% confidence: ${result.reasoning}`);
      } else {
        toast.info(`AI suggestion with ${result.confidence.toFixed(0)}% confidence: ${result.reasoning}`);
      }

      // Generate suggestions for similar inputs
      const suggestions = AICategorizationService.generateSmartSuggestions(aiInput);
      setAiSuggestions(suggestions);
      
      setAiInput('');
    } catch {
      toast.error('Failed to process AI categorization');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const transactionData = {
      amount: amountValue,
      description: description.trim(),
      category,
      type,
      date,
    };

    try {
      if (initialData) {
        const updated = await DatabaseService.updateTransaction(initialData.id, transactionData);
        if (updated) {
          onSubmit(updated);
          toast.success('Transaction updated successfully');
        }
      } else {
        const newTransaction = await DatabaseService.saveTransaction(transactionData);
        onSubmit(newTransaction);
        toast.success('Transaction added successfully');
        
        // Reset form
        setAmount('');
        setDescription('');
        setCategory('');
        setDate(new Date());
      }
    } catch {
      toast.error('Failed to save transaction');
    }
  };

  const applySuggestion = (suggestion: string) => {
    const result = AICategorizationService.categorizeTransaction(suggestion);
    
    if (result.amount) setAmount(result.amount.toString());
    if (result.description) setDescription(result.description);
    if (result.category) setCategory(result.category);
    if (result.type) setType(result.type);
    
    setAiSuggestions([]);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {initialData ? 'Edit Transaction' : 'Add New Transaction'}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAI(!showAI)}
            className="ml-auto"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            AI Assistant
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {showAI && (
          <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Wand2 className="h-5 w-5 text-purple-600" />
              <Label className="text-sm font-medium text-purple-800">
                AI-Powered Quick Entry
              </Label>
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="E.g., 'Bought groceries $50' or 'Freelance payment $1200'"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAIInput()}
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={handleAIInput} 
                disabled={isLoading || !aiInput.trim()}
                size="sm"
              >
                {isLoading ? 'Processing...' : 'Categorize'}
              </Button>
            </div>

            {aiSuggestions.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Smart suggestions:</Label>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-purple-100"
                      onClick={() => applySuggestion(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(value: 'income' | 'expense') => setType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter transaction description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              {initialData ? 'Update Transaction' : 'Add Transaction'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Edit3, Check, X as XIcon, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

interface MetronomeSettings {
  breathInDuration: number;
  breathOutDuration: number;
  numberOfCycles: number;
  soundEnabled: boolean;
  visualEnabled: boolean;
}

export default function MetronomeApp() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isCountdown, setIsCountdown] = useState(false);
  const [countdownNumber, setCountdownNumber] = useState(3);
  const [currentPhase, setCurrentPhase] = useState<'in' | 'out'>('in');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(1);
  
  // Edit states
  const [editingCycles, setEditingCycles] = useState(false);
  const [editingBreathIn, setEditingBreathIn] = useState(false);
  const [editingBreathOut, setEditingBreathOut] = useState(false);
  const [tempCycles, setTempCycles] = useState('');
  const [tempBreathIn, setTempBreathIn] = useState('');
  const [tempBreathOut, setTempBreathOut] = useState('');
  
  const [settings, setSettings] = useState<MetronomeSettings>({
    breathInDuration: 4000, // 4 seconds
    breathOutDuration: 6000, // 6 seconds
    numberOfCycles: 5,
    soundEnabled: true,
    visualEnabled: true,
  });

  // Edit functions
  const startEditingCycles = () => {
    setEditingCycles(true);
    setTempCycles(settings.numberOfCycles.toString());
  };

  const startEditingBreathIn = () => {
    setEditingBreathIn(true);
    setTempBreathIn((settings.breathInDuration / 1000).toString());
  };

  const startEditingBreathOut = () => {
    setEditingBreathOut(true);
    setTempBreathOut((settings.breathOutDuration / 1000).toString());
  };

  const saveCycles = () => {
    const value = parseInt(tempCycles);
    if (value >= 1 && value <= 100) {
      setSettings(prev => ({ ...prev, numberOfCycles: value }));
    }
    setEditingCycles(false);
  };

  const saveBreathIn = () => {
    const value = parseFloat(tempBreathIn);
    if (value >= 0.5 && value <= 60) {
      setSettings(prev => ({ ...prev, breathInDuration: value * 1000 }));
    }
    setEditingBreathIn(false);
  };

  const saveBreathOut = () => {
    const value = parseFloat(tempBreathOut);
    if (value >= 0.5 && value <= 60) {
      setSettings(prev => ({ ...prev, breathOutDuration: value * 1000 }));
    }
    setEditingBreathOut(false);
  };

  const cancelEdit = () => {
    setEditingCycles(false);
    setEditingBreathIn(false);
    setEditingBreathOut(false);
  };

  const audioContextRef = useRef<AudioContext | null>(null);
  const phaseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio context
  useEffect(() => {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioContextRef.current = new AudioContextClass();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Play beep sound
  const playBeep = (frequency: number = 800, duration: number = 200) => {
    if (!audioContextRef.current || !settings.soundEnabled) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration / 1000);

    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
  };

  // Start countdown
  const startCountdown = () => {
    setIsCountdown(true);
    setIsFullScreen(true);
    setCountdownNumber(3);

    const countdown = (num: number) => {
      if (num > 0) {
        setCountdownNumber(num);
        playBeep(1000, 200);
        countdownTimeoutRef.current = setTimeout(() => countdown(num - 1), 1000);
      } else {
        setCountdownNumber(0);
        playBeep(800, 300); // "Go" beep
        countdownTimeoutRef.current = setTimeout(() => {
          setIsCountdown(false);
          startBreathingSession();
        }, 1000);
      }
    };

    countdown(3);
  };

  // Start the actual breathing session
  const startBreathingSession = () => {
    setIsPlaying(true);
    setCurrentPhase('in');
    setCurrentCycle(1);
    setTimeRemaining(settings.breathInDuration);

    // Start the cycle
    startCycle(1);
  };

  // Start a single cycle (breath in + breath out)
  const startCycle = (cycleNumber: number) => {
    if (cycleNumber > settings.numberOfCycles) {
      // All cycles completed
      stopMetronome();
      return;
    }

    setCurrentCycle(cycleNumber);
    setCurrentPhase('in');
    setTimeRemaining(settings.breathInDuration);

    // Play breath in beep
    playBeep(800, 200);

    // Schedule breath out
    phaseTimeoutRef.current = setTimeout(() => {
      setCurrentPhase('out');
      setTimeRemaining(settings.breathOutDuration);
      
      // Play breath out beep
      if (settings.soundEnabled) {
        playBeep(600, 200);
      }

      // Schedule next cycle or completion
      phaseTimeoutRef.current = setTimeout(() => {
        startCycle(cycleNumber + 1);
      }, settings.breathOutDuration);

    }, settings.breathInDuration);
  };

  // Start metronome (now starts countdown)
  const startMetronome = () => {
    if (isPlaying || isCountdown) return;
    startCountdown();
  };

  // Restart metronome
  const restartMetronome = () => {
    stopMetronome();
    setTimeout(() => {
      startCountdown();
    }, 100);
  };

  // Stop metronome
  const stopMetronome = () => {
    setIsPlaying(false);
    setIsFullScreen(false);
    setIsCountdown(false);
    setCurrentPhase('in');
    setTimeRemaining(0);
    setCurrentCycle(1);
    // Don't set sessionCompleted(true) here - only when session naturally completes

    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }

    if (countdownTimeoutRef.current) {
      clearTimeout(countdownTimeoutRef.current);
      countdownTimeoutRef.current = null;
    }
  };

  // Update time remaining
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 100) {
          return prev;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
      if (countdownTimeoutRef.current) clearTimeout(countdownTimeoutRef.current);
    };
  }, []);

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  const getProgressPercentage = () => {
    const currentDuration = currentPhase === 'in' ? settings.breathInDuration : settings.breathOutDuration;
    return ((currentDuration - timeRemaining) / currentDuration) * 100;
  };

  // Full screen breathing display
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        {/* Full screen breathing display */}
        <div className="flex-1 flex flex-col items-center justify-center bg-white px-4">
          {isCountdown ? (
            // Countdown display
            <div className="text-center">
              <div className="text-6xl md:text-9xl font-light text-gray-900 mb-6 md:mb-8">
                {countdownNumber > 0 ? countdownNumber : 'GO!'}
              </div>
              <div className="text-lg md:text-2xl font-light text-gray-600">
                {countdownNumber > 0 ? 'Get ready...' : 'Begin with breath in'}
              </div>
            </div>
          ) : (
            // Breathing session display
            settings.visualEnabled && (
              <div className="text-center">
                <div className="text-4xl md:text-8xl font-light text-gray-900 mb-8 md:mb-12 transition-all duration-300">
                  {currentPhase === 'in' ? 'BREATHE IN' : 'BREATHE OUT'}
                </div>
                
                {/* Cycle counter */}
                <div className="text-lg md:text-xl font-light text-gray-600 mb-6 md:mb-8">
                  Cycle {currentCycle} of {settings.numberOfCycles}
                </div>
                
                {/* Progress Bar - Centered */}
                <div className="flex justify-center mb-8 md:mb-12">
                  <div className="w-72 md:w-96 bg-gray-100 rounded-full h-2 md:h-3">
                    <div 
                      className="h-2 md:h-3 rounded-full transition-all duration-100 bg-gray-900"
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                </div>
                
                {/* Time Remaining */}
                <div className="text-3xl md:text-5xl font-light text-gray-900">
                  {formatTime(timeRemaining)}
                </div>
              </div>
            )
          )}
        </div>

        {/* Bottom controls */}
        <div className="p-4 md:p-6 bg-white border-t border-gray-100">
          <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
            <Button 
              onClick={stopMetronome}
              variant="destructive"
              size="lg"
              className="px-6 md:px-8 py-3 w-full sm:w-auto"
            >
              <Pause className="h-5 w-5 mr-2" />
              Stop Session
            </Button>
            {!isCountdown && (
              <Button 
                onClick={restartMetronome}
                variant="outline"
                size="lg"
                className="px-6 md:px-8 py-3 w-full sm:w-auto"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Restart
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-5xl font-light text-gray-900 mb-4 md:mb-6">
            Metronome App
          </h1>
          
          {/* Start Button */}
          <Button 
            onClick={startMetronome}
            size="lg"
            className="mb-6 md:mb-8 w-full sm:w-auto"
          >
            <Play className="h-5 w-5 mr-2" />
            Start Breathing Session
          </Button>
        </div>

        <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
          {/* Settings Panel */}
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader className="bg-gray-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-gray-900 font-medium">
                <Settings className="h-5 w-5" />
                Settings
              </CardTitle>
              <CardDescription className="text-gray-600">
                Customize your breathing session
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 bg-white space-y-6">
              {/* Number of Cycles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-900 font-medium">
                    Number of Cycles: {settings.numberOfCycles}
                  </Label>
                  {!editingCycles && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={startEditingCycles}
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {editingCycles ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={tempCycles}
                      onChange={(e) => setTempCycles(e.target.value)}
                      className="flex-1"
                      placeholder="Enter cycles (1-100)"
                      min="1"
                      max="100"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={saveCycles}
                      className="h-8 w-8 p-0 text-green-600"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEdit}
                      className="h-8 w-8 p-0 text-red-600"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Slider
                    value={[settings.numberOfCycles]}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, numberOfCycles: value[0] }))}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                )}
                <p className="text-xs text-gray-500">
                  How many complete breathing cycles to complete
                </p>
              </div>

              <Separator className="bg-gray-100" />

              {/* Breath In Duration */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-900 font-medium">
                    Breath In Duration: {settings.breathInDuration / 1000}s
                  </Label>
                  {!editingBreathIn && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={startEditingBreathIn}
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {editingBreathIn ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.5"
                      value={tempBreathIn}
                      onChange={(e) => setTempBreathIn(e.target.value)}
                      className="flex-1"
                      placeholder="Enter seconds (0.5-60)"
                      min="0.5"
                      max="60"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={saveBreathIn}
                      className="h-8 w-8 p-0 text-green-600"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEdit}
                      className="h-8 w-8 p-0 text-red-600"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Slider
                    value={[settings.breathInDuration / 1000]}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, breathInDuration: value[0] * 1000 }))}
                    max={10}
                    min={1}
                    step={0.5}
                    className="w-full"
                  />
                )}
                <p className="text-xs text-gray-500">
                  How long to breathe in (seconds)
                </p>
              </div>

              <Separator className="bg-gray-100" />

              {/* Breath Out Duration */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-900 font-medium">
                    Breath Out Duration: {settings.breathOutDuration / 1000}s
                  </Label>
                  {!editingBreathOut && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={startEditingBreathOut}
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {editingBreathOut ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.5"
                      value={tempBreathOut}
                      onChange={(e) => setTempBreathOut(e.target.value)}
                      className="flex-1"
                      placeholder="Enter seconds (0.5-60)"
                      min="0.5"
                      max="60"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={saveBreathOut}
                      className="h-8 w-8 p-0 text-green-600"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEdit}
                      className="h-8 w-8 p-0 text-red-600"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Slider
                    value={[settings.breathOutDuration / 1000]}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, breathOutDuration: value[0] * 1000 }))}
                    max={15}
                    min={1}
                    step={0.5}
                    className="w-full"
                  />
                )}
                <p className="text-xs text-gray-500">
                  How long to breathe out (seconds)
                </p>
                
                {/* Beeps per Minute Calculation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-blue-900 mb-1">
                    Beeps per Minute: {Math.round((60 * 1000 * 2) / (settings.breathInDuration + settings.breathOutDuration))}
                  </div>
                  <div className="text-xs text-blue-700">
                    Based on your breath timing (2 beeps per cycle)
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-100" />

              {/* Toggles */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-gray-900 font-medium">Sound</Label>
                    <p className="text-xs text-gray-500">
                      Enable breathing beeps
                    </p>
                  </div>
                  <Switch
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, soundEnabled: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-gray-900 font-medium">Visual Cues</Label>
                    <p className="text-xs text-gray-500">
                      Show breathing instructions
                    </p>
                  </div>
                  <Switch
                    checked={settings.visualEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, visualEnabled: checked }))}
                  />
                </div>
              </div>

              {/* Session Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Session Info</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Total Cycles: {settings.numberOfCycles}</div>
                  <div>Breath In: {settings.breathInDuration / 1000}s</div>
                  <div>Breath Out: {settings.breathOutDuration / 1000}s</div>
                  <div>Cycle Duration: {(settings.breathInDuration + settings.breathOutDuration) / 1000}s</div>
                  <div>Beeps per Minute: {Math.round((60 * 1000 * 2) / (settings.breathInDuration + settings.breathOutDuration))}</div>
                  <div>Total Session Time: {Math.round((settings.numberOfCycles * (settings.breathInDuration + settings.breathOutDuration)) / 1000)}s</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader className="bg-gray-50 rounded-t-lg">
              <CardTitle className="text-gray-900 font-medium">How to Use</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Setup</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-gray-900 mr-2">•</span>
                      Set breath in and out durations
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-900 mr-2">•</span>
                      Enable/disable sound and visual cues
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-900 mr-2">•</span>
                      Click Start to begin your session
                    </li>
                  </ul>
                </div>
                
                <Separator className="bg-gray-100" />
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Features</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-gray-900 mr-2">•</span>
                      Full screen breathing display
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-900 mr-2">•</span>
                      Audio cues for breathing transitions
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-900 mr-2">•</span>
                      Visual progress bar and countdown
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-900 mr-2">•</span>
                      Customizable timing intervals
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Home from "@/pages/Home";
import QuickAlarms from "@/pages/QuickAlarms";
import SleepCycle from "@/pages/SleepCycle";
import Statistics from "@/pages/Statistics";
import WorldClock from "@/pages/WorldClock";
import SoundRecorder from "@/pages/SoundRecorder";
import Stopwatch from "@/pages/Stopwatch";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/quick-alarms" component={QuickAlarms} />
      <Route path="/sleep-cycle" component={SleepCycle} />
      <Route path="/statistics" component={Statistics} />
      <Route path="/world-clock" component={WorldClock} />
      <Route path="/sound-recorder" component={SoundRecorder} />
      <Route path="/stopwatch" component={Stopwatch} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Provider } from "react-redux";
import { store } from "./store";
import Home from "@/pages/Home";
import Tasks from "@/pages/Tasks";
import Employees from "@/pages/Employees";
import Analytics from "@/pages/Analytics";
import { Navbar } from "./components/Navbar";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/employees" component={Employees} />
          <Route path="/analytics" component={Analytics} />
          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;

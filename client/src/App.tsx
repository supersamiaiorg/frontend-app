import { Switch, Route, useRoute } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import PropertyDetail from "@/pages/PropertyDetail";
import DataViewPage from "@/pages/DataViewPage";

function InternalRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/property/:id">
        {(params) => <PropertyDetail superId={params.id} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

// Main layout with sidebar for internal app routes
function InternalLayout() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        {/* Permanent history/sidebar */}
        <AppSidebar />

        <div className="flex flex-col flex-1 min-w-0">
          <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center px-4 gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1
                className="text-xl font-bold"
                data-testid="text-app-title"
              >
                Property Analysis
              </h1>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <InternalRouter />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  // Check if we're on a public route (data-view)
  const [isDataView, dataViewParams] = useRoute("/data-view/:superId");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {isDataView ? (
          // Public routes - no sidebar, clean layout
          <DataViewPage superId={dataViewParams?.superId || ""} />
        ) : (
          // Internal routes - with sidebar
          <InternalLayout />
        )}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

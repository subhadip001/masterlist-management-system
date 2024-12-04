import { AppProviders } from "@/providers";
import { RootLayout } from "@/components/layout/RootLayout";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <AppProviders>
      <RootLayout />
      <Toaster />
    </AppProviders>
  );
}

export default App;

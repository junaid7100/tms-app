import 'react-native-gesture-handler';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Colors from "../src/constants/Colors";
import { BottomNavProvider } from "../src/context/BottomNavContext";
import { useImageMemoryManager } from "../src/hooks/useImageMemoryManager";

/**
 * Root layout for the app
 */
export default function RootLayout() {
  // Initialize image memory management
  useImageMemoryManager();

  return (
    <SafeAreaProvider>
      <BottomNavProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
            animation: 'fade',
            animationDuration: 200,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            animationTypeForReplace: 'push',
          }}
        />
      </BottomNavProvider>
    </SafeAreaProvider>
  );
}

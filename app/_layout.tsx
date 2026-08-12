import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
  IBMPlexSans_700Bold,
} from "@expo-google-fonts/ibm-plex-sans";
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
} from "@expo-google-fonts/ibm-plex-mono";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlexSans_400Regular: IBMPlexSans_400Regular,
    PlexSans_500Medium: IBMPlexSans_500Medium,
    PlexSans_600SemiBold: IBMPlexSans_600SemiBold,
    PlexSans_700Bold: IBMPlexSans_700Bold,
    PlexMono_400Regular: IBMPlexMono_400Regular,
    PlexMono_500Medium: IBMPlexMono_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          contentStyle: {backgroundColor: "transparent"},
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="heart/index" options={{ headerShown: false }} />
        <Stack.Screen name="git/index" options={{ headerShown: false }} />
        <Stack.Screen name="fever/index" options={{ headerShown: false }} />
        <Stack.Screen name="neuro/index" options={{ headerShown: false }} />
        <Stack.Screen name="skin/index" options={{ headerShown: false }} />
        <Stack.Screen name="gynacology/index" options={{ headerShown: false }} />
        <Stack.Screen name="lungs/index" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}

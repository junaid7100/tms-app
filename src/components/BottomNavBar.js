import React, { useCallback, useMemo } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image, Platform } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import constants
import Colors from "../constants/Colors";
import Fonts from "../constants/Fonts";
import Layout from "../constants/Layout";

/**
 * Bottom Navigation Bar Component
 */
export default function BottomNavBar({ onLayout }) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // Memoize navigation items to prevent recreation on every render
  const navItems = useMemo(() => [
    {
      label: "Home",
      icon: require("../../assets/icon-home.png"),
      route: "/",
    },
    {
      label: "New Patients",
      icon: require("../../assets/icon-new-patients.png"),
      route: "/new-patients",
    },
    {
      label: "Treatment",
      icon: require("../../assets/icon-treatment.png"),
      route: "/treatment",
    },
    {
      label: "About",
      icon: require("../../assets/icon-about.png"),
      route: "/about",
    },
    {
      label: "Contact",
      icon: require("../../assets/icon-contact.png"),
      route: "/contact",
    },
  ], []);

  // Memoized function to check if a route is active
  const isActive = useCallback((route) => {
    if (route === "/" && pathname === "/") return true;
    if (route !== "/" && pathname.startsWith(route)) return true;
    return false;
  }, [pathname]);

  // Optimized navigation handler with immediate feedback
  const handleNavigation = useCallback((route) => {
    // Prevent navigation if already on the same route
    if (isActive(route)) return;
    
    // Use replace instead of push for better performance
    router.replace(route);
  }, [router, isActive]);

  // Memoize container style to prevent recalculation
  const containerStyle = useMemo(() => [
    styles.container,
    {
      paddingBottom: Math.max(insets.bottom - 5, 0),
      height: Platform.OS === 'ios' ? 85 : 70 + Math.max(insets.bottom - 5, 0),
    }
  ], [insets.bottom]);

  return (
    <View
      style={containerStyle}
      onLayout={onLayout}
    >
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.label}
          style={styles.navItem}
          onPress={() => handleNavigation(item.route)}
          activeOpacity={0.6} // Slightly reduced for faster feedback
          accessibilityRole="button"
          accessibilityLabel={item.label}
          accessibilityState={{ selected: isActive(item.route) }}
        >
          <Image
            source={item.icon}
            style={[
              styles.navIcon,
              {
                tintColor: isActive(item.route) ? Colors.primary : Colors.lightText,
              },
            ]}
            resizeMode="contain"
            fadeDuration={0} // Disable fade animation for faster rendering
          />
          <Text
            style={[
              styles.navLabel,
              isActive(item.route) && styles.activeNavLabel,
            ]}
            numberOfLines={1}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingVertical: 6,
    paddingHorizontal: 5,
    justifyContent: "space-between",
    ...Platform.select({
      ios: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  navIcon: {
    width: 24,
    height: 24,
  },
  navLabel: {
    fontSize: Layout.isSmallDevice ? 11 : 13,
    marginTop: 4,
    color: Colors.lightText,
    textAlign: "center",
  },
  activeNavLabel: {
    color: Colors.primary,
    fontWeight: Fonts.weights.medium,
  },
});

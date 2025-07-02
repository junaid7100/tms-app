import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  StatusBar,
  SafeAreaView,
  Platform,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Drawer } from "react-native-drawer-layout";
import { LinearGradient } from 'expo-linear-gradient';

// Import context
import { useBottomNavContext } from "../context/BottomNavContext";

// Import components
import BottomNavBar from "./BottomNavBar";

// Import constants
import Colors from "../constants/Colors";
import Fonts from "../constants/Fonts";
import Layout from "../constants/Layout";

const isSmallDevice = Layout.isSmallDevice;

/**
 * AppBar component with drawer navigation
 */
export default function AppBar({ children }) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const { setBottomNavHeight } = useBottomNavContext();

  const handleCall = () => {
    Linking.openURL("tel:850-254-9575");
  };

  // Handle bottom navigation layout measurement
  const handleBottomNavLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    setBottomNavHeight(height);
  };

  const navigationView = () => (
    <View style={styles.drawerContainer}>
      <View
        style={[styles.drawerHeader, { paddingTop: insets.top + 20 }]}
      >
        <Image source={require("../../assets/tms-logo2.png")} style={styles.drawerLogo} resizeMode="contain" />
      </View>
      <View style={styles.drawerContent}>
        <TouchableOpacity style={styles.drawerItem} onPress={() => {
          router.push("/");
          setDrawerOpen(false);
        }} activeOpacity={0.7}>
          <Text style={styles.drawerItemText}>HOME</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerItem} onPress={() => {
          router.push("/new-patients");
          setDrawerOpen(false);
        }} activeOpacity={0.7}>
          <Text style={styles.drawerItemText}>NEW PATIENTS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerItem} onPress={() => {
          router.push("/treatment");
          setDrawerOpen(false);
        }} activeOpacity={0.7}>
          <Text style={styles.drawerItemText}>TREATMENT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerItem} onPress={() => {
          router.push("/about");
          setDrawerOpen(false);
        }} activeOpacity={0.7}>
          <Text style={styles.drawerItemText}>ABOUT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerItem} onPress={() => {
          router.push("/contact");
          setDrawerOpen(false);
        }} activeOpacity={0.7}>
          <Text style={styles.drawerItemText}>CONTACT</Text>
        </TouchableOpacity>

        <View style={styles.socialLinksContainer}>
          <TouchableOpacity
            style={styles.socialIconButton}
            onPress={() => {
              Linking.openURL('https://www.facebook.com/profile.php?id=61568383621462&mibextid=LQQJ4di&rdid=NQbuAVyeIjACv0jp&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2FaAL7QjSekUpwb3oP%2F%3Fmibextid%3DLQQJ4di#');
              setDrawerOpen(false);
            }}
            activeOpacity={0.7}
          >
            <FontAwesome name="facebook" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialIconButton}
            onPress={() => {
              Linking.openURL('https://www.linkedin.com/company/tms-of-emerald-coast-llc/');
              setDrawerOpen(false);
            }}
            activeOpacity={0.7}
          >
            <FontAwesome name="linkedin" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialIconButton}
            onPress={() => {
              Linking.openURL('https://www.instagram.com/tmsemeraldcoast/?igsh=MWk1dHd1cmFwbWN6bg%3D%3D#');
              setDrawerOpen(false);
            }}
            activeOpacity={0.7}
          >
            <FontAwesome name="instagram" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.copyrightContainer}>
          <View style={styles.divider} />
          <Text style={styles.copyrightText}>Copyright © 2025 TMS of Emerald Coast - All rights reserved.</Text>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <StatusBar
        backgroundColor={Colors.primary}
        barStyle="light-content"

      />
      <Drawer
        drawerType="front"
        drawerStyle={{
          width: 280,
          backgroundColor: Colors.white
        }}
        overlayStyle={{ backgroundColor: Colors.overlay }}
        drawerPosition="right"
        renderDrawerContent={navigationView}
        open={drawerOpen}
        onOpen={() => setDrawerOpen(true)}
        onClose={() => setDrawerOpen(false)}
      >
        <View style={[styles.safeArea, { paddingTop: insets.top }]}>
          <LinearGradient
            colors={[Colors.primary, Colors.accessiblePrimary]}
            style={styles.navigation}
          >
            <TouchableOpacity
              style={styles.logoContainer}
              onPress={() => router.push("/")}
              activeOpacity={0.7}
            >
              <Image source={require("../../assets/tms-logo.png")} style={styles.logo} resizeMode="contain" />
              <Text style={styles.logoText}>TMS of Emerald Coast</Text>
            </TouchableOpacity>

            <View style={styles.navRight}>
              <TouchableOpacity onPress={handleCall} style={styles.callButton} activeOpacity={0.7}>
                <Ionicons name="call" size={isSmallDevice ? 18 : 22} color={Colors.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setDrawerOpen(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="menu" size={isSmallDevice ? 22 : 26} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
          <View style={styles.contentContainer}>
            {children}
          </View>
          <BottomNavBar onLayout={handleBottomNavLayout} />
        </View>
      </Drawer>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  navigation: {
    padding: Layout.spacing.medium,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 45,
    height: 45,
  },
  logoText: {
    color: Colors.white,
    fontSize: Fonts.sizes.large,
    fontWeight: Fonts.weights.medium,
    marginLeft: 8,
    flexShrink: 1,
  },
  navRight: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: Layout.spacing.medium,
  },
  callButton: {
    padding: 8,
    borderRadius: Layout.borderRadius.round,
    marginRight: 8,
  },
  menuButton: {
    padding: 5,
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    width: 280,
  },
  drawerHeader: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Layout.spacing.large,
    paddingBottom: Layout.spacing.large,
    alignItems: "center",
  },
  drawerLogo: {
    width: 120,
    height: 120,
  },
  drawerContent: {
    padding: Layout.spacing.large,
  },
  drawerItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
  },
  drawerItemText: {
    fontSize: Fonts.sizes.regular,
    color: Colors.primary,
    fontWeight: Fonts.weights.medium,
  },
  socialLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
    gap: 20,
  },
  socialIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(44,82,100,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyrightContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(44,82,100,0.1)',
    marginBottom: 15,
  },
  copyrightText: {
    fontSize: 12,
    color: Colors.lightText,
    textAlign: 'center',
    lineHeight: 18,
  },
});


import React, { useEffect } from 'react';
import { Alert, Linking } from 'react-native';
import Constants from 'expo-constants';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import HomeScreen from './screens/HomeScreen';
import BookDetailsScreen from './screens/BookDetailsScreen';
import ReaderScreen from './screens/ReaderScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    const checkForGitHubUpdate = async () => {
      try {
        const currentVersion = (Constants.manifest?.version || Constants.expoConfig?.version)?.replace(/^v/, '');
        const response = await fetch(
          'https://api.github.com/repos/calebfelix/MyBookApp/releases/latest'
        );
        const release = await response.json();

        const latestVersion = release.tag_name?.replace(/^v/, '');
        const apkAsset = release.assets.find((asset) => asset.name.endsWith('.apk'));
        const apkUrl = apkAsset?.browser_download_url;

        if (!currentVersion || !latestVersion) {
          console.log('Missing version info');
          return;
        }

        if (latestVersion !== currentVersion) {
          if (__DEV__) {
            // DEV MODE: show versions, no update
            Alert.alert(
              '🔧 DEV MODE',
              `Update Detected\n\nCurrent: ${currentVersion}\nLatest: ${latestVersion}\n\n(No update will be triggered)`,
              [{ text: 'OK', style: 'cancel' }],
              { cancelable: true }
            );
          } else {
            // RELEASE MODE: show update prompt
            Alert.alert(
              'Update Available',
              `A new version (v${latestVersion}) is available. Please update to continue.`,
              [
                {
                  text: 'Update Now',
                  onPress: () => Linking.openURL(apkUrl),
                },
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
              ],
              { cancelable: true }
            );
          }
        } else {
          if (__DEV__) {
            Alert.alert(
              '🔧 DEV MODE',
              `You're on the latest version.\n\nCurrent: ${currentVersion}`,
              [{ text: 'OK', style: 'cancel' }],
              { cancelable: true }
            );
          }
        }
      } catch (error) {
        console.log('Update check failed:', error);
      }
    };

    checkForGitHubUpdate();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }} edges={['top', 'bottom']}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="BookDetails" component={BookDetailsScreen} />
            <Stack.Screen name="Reader" component={ReaderScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

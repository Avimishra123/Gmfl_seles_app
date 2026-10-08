import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomerIcon, HomeIcon, LeadsIcon, ProfileIcon } from '../components/Icons';
import AppsScreen from '../screens/AppsScreen';
import CustomersScreen from '../screens/CustomersScreen';
import DocsScreen from '../screens/DocsScreen';
import HomeScreen from '../screens/HomeScreen';
import LeadsScreen from '../screens/LeadsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

function TabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { bottom: Math.max(insets.bottom, 40) }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        if (options.tabBarItemStyle?.display === 'none') {
          return null;
        }

        const focused = state.index === index;
        const color = focused ? '#FFFFFF' : '#8EA3B8';
        const label = options.title ?? route.name;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            style={styles.item}
          >
            {options.tabBarIcon?.({ focused, color, size: 22 })}
            <Text style={[styles.label, { color }]} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <HomeIcon color={color} /> }} />
      <Tab.Screen name="Customers" component={CustomersScreen} options={{ title: 'Application', tabBarIcon: ({ color }) => <CustomerIcon color={color} /> }} />
      <Tab.Screen name="Leads" component={LeadsScreen} options={{ tabBarIcon: ({ color }) => <LeadsIcon color={color} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <ProfileIcon color={color} /> }} />
      <Tab.Screen name="Apps" component={AppsScreen} options={{ tabBarItemStyle: { display: 'none' } }} />
      <Tab.Screen name="Docs" component={DocsScreen} options={{ tabBarItemStyle: { display: 'none' } }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 64,
    borderRadius: 22,
    backgroundColor: colors.navy,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    elevation: 12,
    shadowColor: '#0C1F33',
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: '100%',
  },
  label: {
    fontFamily: 'DMSans-Bold',
    fontSize: 11,
  },
});

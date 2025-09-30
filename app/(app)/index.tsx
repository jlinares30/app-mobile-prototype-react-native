import { useRouter } from "expo-router";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get('window');

export default function AppHome() {
  const router = useRouter();

  const menuItems = [
    {
      id: '1',
      title: 'Ver Recetas',
      description: 'Descubre deliciosas recetas',
      icon: '🍽️',
      color: '#e74c3c',
      route: '/recipes' as const
    },
    {
      id: '2',
      title: 'Favoritos',
      description: 'Tus recetas favoritas',
      icon: '❤️',
      color: '#e67e22',
      route: '/recipes' as const
    },
    {
      id: '3',
      title: 'Categorías',
      description: 'Explora por categorías',
      icon: '📂',
      color: '#3498db',
      route: '/recipes' as const
    },
    {
      id: '4',
      title: 'Mi Perfil',
      description: 'Configura tu cuenta',
      icon: '👤',
      color: '#9b59b6',
      route: '/recipes' as const
    }
  ];

  const renderMenuItem = (item: typeof menuItems[0]) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, { backgroundColor: item.color + '15' }]}
      onPress={() => router.push(item.route)}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Text style={styles.iconText}>{item.icon}</Text>
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuDescription}>{item.description}</Text>
      </View>
      <Text style={styles.arrowIcon}>›</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>¡Hola!</Text>
          <Text style={styles.subtitleText}>¿Qué vamos a cocinar hoy?</Text>
        </View>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => router.replace("/(auth)/login")}
        >
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.heroSection}>
        <Text style={styles.heroEmoji}>👨‍🍳</Text>
        <Text style={styles.heroTitle}>Bienvenido a tu</Text>
        <Text style={styles.heroSubtitle}>Cocina Digital</Text>
        <Text style={styles.heroDescription}>
          Descubre, cocina y disfruta de las mejores recetas
        </Text>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Explorar</Text>
        <View style={styles.menuGrid}>
          {menuItems.map(renderMenuItem)}
        </View>
      </View>

      <View style={styles.quickStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>50+</Text>
          <Text style={styles.statLabel}>Recetas</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>15</Text>
          <Text style={styles.statLabel}>Categorías</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>5★</Text>
          <Text style={styles.statLabel}>Valoración</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitleText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 2,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 20,
  },
  logoutText: {
    color: '#e74c3c',
    fontWeight: '600',
    fontSize: 14,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  heroEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroDescription: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width * 0.8,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  menuGrid: {
    gap: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 24,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  arrowIcon: {
    fontSize: 24,
    color: '#bdc3c7',
    fontWeight: '300',
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 30,
    borderRadius: 16,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#ecf0f1',
  },
});

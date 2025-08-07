import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Tabs Page</Text>
      <Image
        source={{ uri: 'https://.com/image.pnghttps://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTluauEHCYK123wZ3haPf-P4hGVlCcR39mtpSLByvSFOsWqFbWRDhYjGDO5o0N_h2DQ7udd4iKtj14QH9QCO9DVyfxqQOMLq-hJ1r58H9tn' }}
        style={styles.image}
      />
      <Text style={styles.description}>
        This is the main content of the tabs page.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'green',
  },  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
  },
});
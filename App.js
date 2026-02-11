import { Text, View } from "react-native";
import { auth } from "./firebase/firebaseConfig";

export default function App() {
  return (
    <View style={{ marginTop: 50, alignItems: "center" }}>
      <Text>Firebase Connected Successfully</Text>
      <Text>{auth ? "Auth Loaded" : "Auth Failed"}</Text>
    </View>
  );
}

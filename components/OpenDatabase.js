import { Platform } from "react-native";
import * as SQLite from 'expo-sqlite';
export function openDatabase(database_name) {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        };
      },
    };
  }

  const db = SQLite.openDatabase(database_name);
  return db;
}

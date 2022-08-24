import { Platform } from "react-native";
import * as SQLite from 'expo-sqlite';
export function openDatabase(database_name) {
  // returns transaction object if the operating system is web not mobile.
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        };
      },
    };
  }
  // opens the database that has the entered name or create if it doesn't exist.
  const db = SQLite.openDatabase(database_name);
  return db;
}

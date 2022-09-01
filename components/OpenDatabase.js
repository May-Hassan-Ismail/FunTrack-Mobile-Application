import { Platform } from "react-native";
import * as SQLite from 'expo-sqlite';

// function for opening a specific local SQLite database and it takes the database name as an input.
export function openDatabase(database_name) {
  // returns empty transaction object if the operating system is web not mobile.
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

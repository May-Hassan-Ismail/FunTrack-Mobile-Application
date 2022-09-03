import React from 'react';
import {render} from 'react-native-testing-library';
import {createTables, addTask, editTask, extractUncompletedTasks, extractLoggedInUser,
        completeTask, addMoodStatus, authenticateUser, createUser} from '../components/database';

jest.useFakeTimers();

// mocking window.alert
window.alert = jest.fn();

// mocking sql database.
var sqlResult = { insertId: 1, rows: { _array: [] } };
const tx = { executeSql: jest.fn((query, sub=[], func=()=>true) => func({}, sqlResult)) };
const db = { transaction: jest.fn((func) => func(tx)) };

describe('Database Testing by mocking sql', () => {

  it('executes 4 queries for creating the db schema', () => {
      createTables(db);
      // tests the create tables function executes 4 sql queries for creating the 4 tables in the schema.
      expect(tx.executeSql.mock.calls.length).toEqual(4);
  });

  it('executes the create user query', () => {
      createUser("Testing username", "Testing password", null, db);
      // tests the create user function executes the query for creating a new user.
      expect(tx.executeSql.mock.calls.length).toEqual(5);
  });

  it('executes the create user query', () => {
      window.alert.mockClear();
      authenticateUser("Testing username", "Testing password", null, db);
      // tests the authenticateUser function executes the query for authenticating the user while loggin in to the account.
      expect(tx.executeSql.mock.calls.length).toEqual(6);
  });

  it('executes the extract logged in user query', () => {
      extractLoggedInUser(db);
      // tests the extractLoggedInUser function executes the query for extracting the logged in user.
      expect(tx.executeSql.mock.calls.length).toEqual(7);
  });

  it('executes the extract uncompleted tasks query', () => {
      const result = extractUncompletedTasks(new Date("2-2-2020"), [], 1, db);
      // tests the extractUncompletedTasks function executes the query for extracting the list of uncompleted tasks.
      expect(tx.executeSql.mock.calls.length).toEqual(8);
  });

  it('returns the lis of uncompleted tasks', () => {
      const result = extractUncompletedTasks(new Date("2-2-2020"), [], 1, db);
      // an empty list is returned as there's no uncompleted tasks
      expect(result).toEqual([]);
  });

  it('executes the add task query', () => {
      addTask(1, {name: "testing task", date: "2-2-2020", time: "10:10", rem_date: "1-2-2020", color: "red"}, 1, db);
      // tests the addTask function executes the query for adding a new task.
      expect(tx.executeSql.mock.calls.length).toEqual(10);
  });

  it('executes the edit task query', () => {
      editTask({name: "testing task edited", date: "2-2-2020", time: "10:10", rem_date: "1-2-2020", color: "red"}, 1, 1, db);
      // tests the editTask function executes the query for editing the task.
      expect(tx.executeSql.mock.calls.length).toEqual(11);
  });

  it('executes the complete task query', () => {
      completeTask(1, db);
      // tests the completeTask function executes the query for marking the task as completed.
      expect(tx.executeSql.mock.calls.length).toEqual(12);
  });

  it('executes the 2 sql queries of add mood status function', () => {
      addMoodStatus(1, "2-2-2020", 3, db);
      // tests the addMoodStatus function executes the two query for either adding or updating the user's mood level.
      expect(tx.executeSql.mock.calls.length).toEqual(14);
  });

});

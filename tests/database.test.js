import React from 'react';
import {render} from 'react-native-testing-library';
//import {createTable, createUser, authenticateUser, extractUncompletedTasks, addTask, editTask, loggedIn, extractLoggedInUser} from '../components/database';
import {createTables, addTask, extractUncompletedTasks, extractLoggedInUser, createUser} from '../components/database';
import {openDatabase} from '../components/OpenDatabase';

const db = openDatabase('db.TodoTestDB');
jest.mock('../components/database');

//jest.useFakeTimers();
jest.setTimeout(30000);

/*
var sqlResult = { insertId: 1, rows: { _array: [] } };
const tx = { executeSql: jest.fn((query, sub=[], func=()=>true) => func({}, sqlResult)) };
const db = { transaction: jest.fn((func) => func(tx)) };
const rootStore = { db: db };
*/
describe('Database Testing', () => {
  /*
  it('mocks sql', () => {
      expect(tx.executeSql.mock.calls.length).toEqual(0);
  });
  */
  beforeAll(()=>{
    createTables(db);
    createUser("test", "testPass", null, db);
    extractLoggedInUser(db);
    addTask(0, {name: "newTask", time:new Date().toString(), date:new Date().toISOString(), color:"pink",
             rem_date:new Date().toString().slice(0,15)}, "", db);
  })
  it('returns list of uncompleted tasks', async() => {
    let unCompList = [];
    unCompList = extractUncompletedTasks(new Date(), [], db);
    //await new Promise((r) => setTimeout(r, 2000));
    jest.runAllTimers();
    setTimeout(() => {
        expect(unCompList.length).toEqual(1);
     }, 200);

  });
});

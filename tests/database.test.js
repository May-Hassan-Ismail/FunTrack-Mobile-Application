import React from 'react';
import {render} from 'react-native-testing-library';
//import {createTable, createUser, authenticateUser, extractUncompletedTasks, addTask, editTask, loggedIn, extractLoggedInUser} from '../components/database';
import {createTables, addTask, extractUncompletedTasks} from '../components/database';
import {openDatabase} from '../components/OpenDatabase';

jest.useFakeTimers();
const db = openDatabase('db.TodoTestDB');

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
    createTables(db);
    addTask({name: "newTask", time:new Date().toString(), date:new Date().toISOString(), color:"pink", rem_date:new Date().toString().slice(0,15)}, 1, "", db);
    it('returns list of uncompleted tasks', () => {
        expect(extractUncompletedTasks(new Date(), [], db)).toEqual([]);
    });
});

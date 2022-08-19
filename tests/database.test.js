import React from 'react';
import {render} from 'react-native-testing-library';

jest.useFakeTimers();

var sqlResult = { insertId: 1, rows: { _array: [] } };
const tx = { executeSql: jest.fn((query, sub=[], func=()=>true) => func({}, sqlResult)) };
const db = { transaction: jest.fn((func) => func(tx)) };
const rootStore = { db: db };

describe('TransactionsStore', () => {
    //const store = new TransactionsStore(rootStore);

    it('mocks sql', () => {
        expect(tx.executeSql.mock.calls.length).toEqual(0);
    });
});

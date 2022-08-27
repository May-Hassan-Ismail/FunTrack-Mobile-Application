import React from 'react';
import {render} from 'react-native-testing-library';
import {createTables} from '../components/database';
import App from '../App';

import {openDatabase} from '../components/OpenDatabase';

const db = openDatabase('db.TodoTestDB');
jest.mock('../components/database');
createTables(db);
jest.useFakeTimers();

describe("<App />", () =>{
  it('should match snapshot', () =>{
    const snap = render(<App />).toJSON();
    expect(snap).toMatchSnapshot();
  })
});

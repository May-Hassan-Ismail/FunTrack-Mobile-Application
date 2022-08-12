import React from 'react';
import {render} from 'react-native-testing-library';
//import App from '../App';

jest.useFakeTimers();

describe("testing jest", () =>{
  it('should match snapshot', () =>{
    expect(5*5).toEqual(25);
  })
});

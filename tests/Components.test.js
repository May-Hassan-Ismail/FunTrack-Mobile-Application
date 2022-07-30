import React from 'react';
import {render} from 'react-native-testing-library';
import CheckDay from '../components/CheckDay';
import CheckReminder from '../components/CheckReminder';
import Footer from '../components/Footer';
import Task from '../components/Task';
import List from '../components/List';

jest.useFakeTimers();


describe("<CheckDay />", () =>{
  it('should match snapshot', () =>{
    const snap = render(<CheckDay />).toJSON();
    expect(snap).toMatchSnapshot();
  })
});
describe("<CheckReminder />", () =>{
  it('should match snapshot', () =>{
    const snap = render(<CheckReminder />).toJSON();
    expect(snap).toMatchSnapshot();
  })
});

/*
describe("<Task />", () =>{

  it('should match snapshot', () =>{
    const item = {
      category_id: null,
      date: "2022-07-29T10:00:00.000Z",
      id: 77,
      priority: 3,
      reminder_date: "Fri Jul 29 2022",
      state: "completed",
      tag: "",
      time: "Fri Jul 29 2022 00:20:07 GMT+0200 (EET)",
      title: "test",
      user_id: 1,
    }
    const snap = render(<Task task={item} key={0} index={0} nav={null} title="Testing" selected={0} mode="uncompleted"/>).toJSON();
    expect(snap).toMatchSnapshot();
  })
});

describe("<Footer />", () =>{
  it('should match snapshot', () =>{
    const snap = render(<Footer nav={null}/>).toJSON();
    expect(snap).toMatchSnapshot();
  })
});

describe("<List />", () =>{
  it('should match snapshot', () =>{
    const snap = render(<List />).toJSON();
    expect(snap).toMatchSnapshot();
  })
});
*/

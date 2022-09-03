import React from 'react';
import {render} from 'react-native-testing-library';
import CheckDay from '../components/CheckDay';
import CheckReminder from '../components/CheckReminder';
import Footer from '../components/Footer';
import Task from '../components/Task';
import List from '../components/List';

jest.useFakeTimers();

// matching the snapshot of the CheckDay component with the previously created one.
describe("<CheckDay />", () =>{
  const snap = render(<CheckDay />).toJSON();
  it('should match snapshot', () =>{
    expect(snap).toMatchSnapshot();
  })
  it('tests the number of child elements', () =>{
    // testing number of child elements of the CheckDay component.
    expect(snap.children.length).toBe(3);
  })
});

// matching the snapshot of the CheckReminder component with the previously created one.
describe("<CheckReminder />", () =>{
  const snap = render(<CheckReminder />).toJSON();

  it('should match snapshot', () =>{
    expect(snap).toMatchSnapshot();
  })
  it('tests the number of child elements', () =>{
    // testing number of child elements of the CheckReminder component.
    expect(snap.children.length).toBe(5);
  })
});

// matching the snapshot of the Footer component with the previously created one.
describe("<Footer />", () =>{
  const snap = render(<Footer nav={{navigate: null}}/>).toJSON();

  it('should match snapshot', () =>{
    expect(snap).toMatchSnapshot();
  })
  it('tests the number of child elements', () =>{
    // testing number of child elements of the Footer component.
    expect(snap.children.length).toBe(5);
  })
});

// matching the snapshot of the Task component with the previously created one.
describe("<Task />", () =>{
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

  it('should match snapshot', () =>{
    expect(snap).toMatchSnapshot();
  })
  it('tests the number of child elements', () =>{
    // testing number of child elements of the Task component.
    expect(snap.children.length).toBe(2);
  })
});

// matching the snapshot of the List component with the previously created one.
describe("<List />", () =>{
  const item = {
    id: 1,
    title: "test",
    color:'red',
    icon: ""
  }
  const snap = render(<List list={item} delFun={null} editFun={null} index={0} />).toJSON();

  it('should match snapshot', () =>{
    expect(snap).toMatchSnapshot();
  })
  it('tests the number of child elements', () =>{
    // testing number of child elements of the List component.
    expect(snap.children.length).toBe(2);
  })
});

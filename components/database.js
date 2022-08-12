import {openDatabase} from './OpenDatabase';
import { Alert } from 'react-native';

const db = openDatabase();

export let loggedIn = [{id:0}]
export const extractLoggedInUser = () =>{
  db.transaction(async (tx)=>{
    await tx.executeSql(
      "SELECT * FROM users WHERE state = 'loggedin'", null, // passing sql query and parameters:null
        // success callback which sends two things Transaction object and ResultSet Object
        (txObj, { rows: { _array } }) => loggedIn=_array,
        // failure callback which sends two things Transaction object and Error
        (txObj, error) => console.log('Error ', error)
      );
  });
}
extractLoggedInUser();
const calcPerformance = (pieChart, list, pList, cList, catList) =>{
  let sum = 0;
  let sumComp = 0;
  let countComp=0;
  let countUnComp=0;
  let countOverdue=0;
  for(let i=0;i<list.length;i++){
    sum+=(4-list[i].priority);
    if(list[i].state == 'completed'){
      countComp++;
      sumComp+=(4-list[i].priority);
    }
    else if(pieChart == true){
      if(list[i].time.slice(16,21) < new Date().toString().slice(16,21)){
        countOverdue++;
      }else{
        countUnComp++;
      }
    }
  }
  if(pieChart == true){
    catList.push(countUnComp);
    catList.push(countComp)
    catList.push(countOverdue)
  }
  cList.push(sumComp);
  if(sum == 0){
    pList.push(100);
  }
  else {
    pList.push((sumComp/sum)*100);
  }
}
export const createTables = ()=>{
 db.transaction(tx => {
   tx.executeSql(
     "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, " +
     "state TEXT CHECK( state IN ('loggedin','loggedout') ) DEFAULT 'loggedout')"
   )
 });
 db.transaction(tx => {
   tx.executeSql(
     "CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, "+
       "user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, "+
       "title TEXT, color TEXT DEFAULT 'pink', icon TEXT DEFAULT '')"
   )
 });
 db.transaction(tx => {
   tx.executeSql(
     "CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, "+
       "user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, "+
       "category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL, "+
       "title TEXT, time TEXT, date TEXT, reminder_date TEXT, "+
       "state TEXT CHECK( state IN ('completed','uncompleted') ), "+
       "tag TEXT, priority INTEGER)"
   )
   });
}

const createDefaultCategories = () =>{
  extractLoggedInUser();
  db.transaction(async (tx)=>{
    await tx.executeSql(
      "INSERT INTO categories (user_id, title, color, icon) VALUES (?,?,?,?), (?,?,?,?), (?,?,?,?), (?,?,?,?)",
        [loggedIn[0].id, "Priorities", "pink", "calendar-today", loggedIn[0].id, "Wish List", "#66B2ff", "unicorn-variant",
        loggedIn[0].id, "Shopping", "#B266ff", "cart-heart", loggedIn[0].id, "Exercise", "#99FF99", "run-fast"]
    );
  });
}

export const createUser = (username, password, navigation) =>{
  if(username != "" && password !=""){
    db.transaction(async (tx)=>{
      await tx.executeSql(
        "INSERT INTO users (username, password, state) VALUES (?,?,?)", [username, password, 'loggedin'],
        (txObj, { rows: { _array } }) => navigation.navigate('Home', { title: "HomeScreen"}),
        // failure callback which sends two things Transaction object and Error
        (txObj, error) => {
          alert(error);
        }
      );
    });
    createDefaultCategories();
  }
  else{
    alert("Invalid username or password!")
  }
}

export const authenticateUser = (username, password, navigation)  =>{
  db.transaction(async (tx)=>{
    await tx.executeSql(
      "SELECT * FROM users WHERE username =?", [username], // passing sql query and parameters:null
        // success callback which sends two things Transaction object and ResultSet Object
        (txObj, { rows: { _array } }) => {
          if(_array.length == 0) alert("Invalid username!");
          else if(_array[0].password != password) alert("Invalid password!");
          else{
            tx.executeSql("UPDATE users SET state='loggedin' WHERE username =?", [username]);
            navigation.navigate('Home',  { title: "HomeScreen"});
          };
        },
        // failure callback which sends two things Transaction object and Error
        (txObj, error) => console.log('Error ', error)
      );
  });
}

export const extractTasks = (date, pList, cList, catList, pieChart)=>{
  extractLoggedInUser();
  db.transaction(tx => {
    tx.executeSql("SELECT * FROM tasks WHERE date LIKE '%"+date.toISOString().slice(0,10)+"%' AND user_id =?", [loggedIn[0].id], // passing sql query and parameters:null
      // success callback which sends two things Transaction object and ResultSet Object
      (txObj, { rows: { _array } }) => calcPerformance(pieChart, _array, pList, cList, catList),
      // failure callback which sends two things Transaction object and Error
      (txObj, error) => console.log('Error ', error)
      ) // end executeSQL
  })
  return {performL:pList, countList: cList, catList: catList};
}

export const extractTasksByCatOrTitle= (unCompTasksList, compTasksList, category, title)=>{
  if(category != null){
    db.transaction(tx => {
      tx.executeSql("SELECT * FROM tasks WHERE state='uncompleted' AND category_id=?", [category], // passing sql query and parameters:null
        // success callback which sends two things Transaction object and ResultSet Object
        (txObj, { rows: { _array } }) => unCompTasksList = _array,
        // failure callback which sends two things Transaction object and Error
        (txObj, error) => console.log('Error ', error)
        ) // end executeSQL
    })
    db.transaction(tx => {
      tx.executeSql("SELECT * FROM tasks WHERE state='completed' AND category_id=?", [category], // passing sql query and parameters:null
        // success callback which sends two things Transaction object and ResultSet Object
        (txObj, { rows: { _array } }) => compTasksList = (_array),
        // failure callback which sends two things Transaction object and Error
        (txObj, error) => console.log('Error ', error)
        ) // end executeSQL
    })
  }
  else if(title == 'Today'){
    db.transaction(tx => {
      tx.executeSql("SELECT * FROM tasks WHERE date LIKE '%"+ new Date().toISOString().slice(0,10)+"%' AND state='uncompleted'", null, // passing sql query and parameters:null
        // success callback which sends two things Transaction object and ResultSet Object
        (txObj, { rows: { _array } }) => unCompTasksList = _array,
        // failure callback which sends two things Transaction object and Error
        (txObj, error) => console.log('Error ', error)
        ) // end executeSQL
    })

    db.transaction(tx => {
      tx.executeSql("SELECT * FROM tasks WHERE date LIKE '%"+ new Date().toISOString().slice(0,10)+"%' AND state='completed'", null, // passing sql query and parameters:null
        // success callback which sends two things Transaction object and ResultSet Object
        (txObj, { rows: { _array } }) => compTasksList = (_array),
        // failure callback which sends two things Transaction object and Error
        (txObj, error) => console.log('Error ', error)
        ) // end executeSQL
    })
  }
  return {unCompL:unCompTasksList, compL: compTasksList};
}

export const addTask = async(user_id, task, category) =>{
  if( task.name != null && task.name != ""){
    let cat_id = null;
    if(category!=""){
      cat_id = category;
    }
    db.transaction(tx=>{
      tx.executeSql(
        "INSERT INTO tasks (user_id, category_id, title, time, date, reminder_date, state, tag, priority) VALUES (?,?,?,?,?,?,?,?,?)",
        [user_id, cat_id, task.name, task.time, task.date, task.rem_date, "uncompleted", "", task.color]
      );
    });
  }
}
export const editTask = (task, id) =>{
  if( task.name != null && task.name != ""){
    db.transaction(async (tx)=>{
      await tx.executeSql(
        "UPDATE tasks SET title=?, time=?, date=?, reminder_date=?, tag=?, priority=? WHERE id =?",
        [task.name, task.time, task.date, task.rem_date, "", task.color, id]
      );
    });
  }
}

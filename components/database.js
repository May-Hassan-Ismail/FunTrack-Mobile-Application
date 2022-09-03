import {openDatabase} from './OpenDatabase';
import { Alert } from 'react-native';
import {schedulePushNotification} from './Notifications'

// opens the TodoDB database.
const datab = openDatabase('db.TodoDB');

export let loggedIn = [{id:0}];
// extracts the user whose state is logged in from the database.
export const extractLoggedInUser = (db) =>{
  db.transaction(async (tx)=>{
    await tx.executeSql(
      "SELECT * FROM users WHERE state = 'loggedin'", null, // passing sql query and parameters:null
        // success callback which sends two things Transaction object and ResultSet Object
        // assigns the result object to the loggedIn variable
        (txObj, { rows: { _array } }) => loggedIn=_array,
        // failure callback which sends two things Transaction object and Error
        (txObj, error) => console.log('Error ', error)
      );
  });
}

// function for creating all the tables in the database schema if they are not already created before.
export const createTables = (db)=>{
 db.transaction(tx => {
   // creating the users table with all the properties.
   tx.executeSql(
     "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, " +
     "state TEXT CHECK( state IN ('loggedin','loggedout') ) DEFAULT 'loggedout')"
   )
 });
 // creating the categories table with all the properties.
 db.transaction(tx => {
   tx.executeSql(
     "CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, "+
       "user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, "+
       "title TEXT, color TEXT DEFAULT 'pink', icon TEXT DEFAULT '')"
   )
 });
 // creating the tasks table with all the properties.
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
   // creating the mood table with all the properties.
   db.transaction(tx => {
     tx.executeSql(
       "CREATE TABLE IF NOT EXISTS mood (id INTEGER PRIMARY KEY AUTOINCREMENT, "+
         "user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, "+
         "date TEXT, level INTEGER DEFAULT 3)"
     )
   });
}

// function for creating default categories for the user to use, and the user can delete any of them if he/she wants.
const createDefaultCategories = (db) =>{
  extractLoggedInUser(db);
  db.transaction(async (tx)=>{
    await tx.executeSql(
      "INSERT INTO categories (user_id, title, color, icon) VALUES (?,?,?,?), (?,?,?,?), (?,?,?,?), (?,?,?,?)",
        [loggedIn[0].id, "Priorities", "#FFBEBE", "calendar-today", loggedIn[0].id, "Wish List", "#90C2C2", "unicorn-variant",
        loggedIn[0].id, "Shopping", "#A7E0A7", "cart-heart", loggedIn[0].id, "Exercise", "#E0F5B6", "run-fast"]
    );
  });
}

/*
  * function for creating a new user which is called after the click on the signup button.
  * params:
    1) username of the account to be created.
    2) Password of the account to be created.
    3) navigarion object.
    4) open datababse.
*/
export const createUser = (username, password, navigation, db) =>{
  if(username != "" && password !=""){
    // inserting a new row in the users table with the entered username and password.
    db.transaction(async (tx)=>{
      await tx.executeSql(
        "INSERT INTO users (username, password, state) VALUES (?,?,?)", [username, password, 'loggedin'],
        (txObj, { rows: { _array } }) => {
          // navigating to the Home page after creating a new user in the users table.
          navigation.navigate('Home', { title: "HomeScreen"});
          // creates the default categories to the user the he/she can remove, if he/she wants to.
          createDefaultCategories(db);
        },
        // alert the user that the username is not valid because it has to be unique.
        (txObj, error) => {
          alert("Invalid username, an account with the same username already exists!")
        }
      );
    });
  }
  else{
    alert("Empty fields are not allowed!")
  }
}

/*
  * authenticating the user by matching the password stored in the database to the entered one.
  * params:
    1) username of the account to be authenticated.
    2) Password of the account to be authenticated.
    3) navigarion object.
    4) open datababse.
*/
export const authenticateUser = (username, password, navigation, db)  =>{
  db.transaction(async (tx)=>{
    await tx.executeSql(
      "SELECT * FROM users WHERE username =?", [username],
        (txObj, { rows: { _array } }) => {
          // if no data is returned for the entered username the user will be alerted.
          if(_array.length == 0) alert("Invalid username!");
          // if the 2 passwords don't match the user will be alerted that the password is invalid.
          else if(_array[0].password != password) alert("Invalid password!");
          // if the 2 passwords match each other, the user's state will be updated to be loggedin
          // the the user will be navigated to his/her home page.
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

/*
  * function returns the list of uncompleted tasks of a specific date and which belongs to the logged in user.
  * params:
    1) date for filtering the uncompleted tasks with.
    2) list array for saving the returned list of tasks.
    3) open datababse.
*/
export const extractUncompletedTasks = (date, list, user_id, db)=>{
  db.transaction(tx => {
    // extracts the list of tasks of the entered date and which state is uncompleted and which belongs to the logged in user.
    tx.executeSql("SELECT * FROM tasks WHERE date LIKE '%"+date.toISOString().slice(0,10)+"%' AND state='uncompleted' AND user_id=?",
      [user_id],
      // asigns the result object to the list to be returned.
      (txObj, { rows: { _array } }) => list = (_array),
      // failure callback which sends two things Transaction object and Error.
      (txObj, error) => console.log('Error ', error)
      ) // end executeSQL
  });
  // returns the result object.
  return list;
}

/** function that takes the list of tasks as an input and calculates the following:
  * percentage of the user's perfromance by dividing the completed tasks/total number of tasks with taking
    the priorities in to consideration so the high priority task contributes by 4 points, middle -> 3, low -> 2 and no -> 1.
    and If there are no tasks the user's performance will considered to be 100%.
  * Counts of the uncompleted, completed and overdue tasks in the list to be used in the pie Chart.
  * params:
    1) pieChart boolean value for ordering calculating the pie chart data item or not.
    2) list of tasks to calculate the user's performance in them.
    3) pList array for saving the user's performance.
    4) cList array for saving the sum value of the completed tasks of the entered array of tasks.
    4) catList array for saving data item that will be used in creating the pie chart.
*/
const calcPerformance = (pieChart, list, pList, cList, catList) =>{
  let sum = 0;
  let sumComp = 0;
  let countComp=0;
  let countUnComp=0;
  let countOverdue=0;
  for(let i=0;i<list.length;i++){
    // adds the value to the sum of all tasks with taking the priority into consideration.
    sum+=(4-list[i].priority);
    if(list[i].state == 'completed'){
      // counts completed tasks.
      countComp++;
      // adds the value to the sum of the completed tasks with taking the priority into consideration.
      sumComp+=(4-list[i].priority);
    }
    // if the function is called for the pie chart calculations, the number of uncompleted, completed, and overdue tasks will be counted.
    else if(pieChart == true){
      // if task's time is less than the current time, the task will be counted as an overdue task.
      if(list[i].time.slice(16,21) < new Date().toString().slice(16,21)){
        countOverdue++;
      }else{
        countUnComp++;
      }
    }
  }
  // if the function is called for the pie chart calculations, the number of calculated tasks will be pushed to the list.
  if(pieChart == true){
    catList.push(countUnComp);
    catList.push(countComp);
    catList.push(countOverdue);
  }
  cList.push(sumComp);
  // if no tasks the user's performance will be considered 100%.
  if(sum == 0){
    pList.push(100);
  }
  else {
    pList.push((sumComp/sum)*100);
  }
}

/*
  * function for extracting the tasks of a specific date.
  * it calls the calcPerformance function to do all the calculations on the returned list.
  * params:
    1) date at which the user's performance on the tasks of that date will be calculated.
    2) pList of savind the user's performance.
    3) cList for saving the sum of the completed tasks.
    4) catList for saving the Pie Chart data item.
    5) pieChart boolean value for ordering calculating the pie chart data item or not.
    6) open datababse.
*/
export const calcUserPerformance = (date, pList, cList, catList, pieChart, db)=>{
  extractLoggedInUser(db);
  db.transaction(tx => {
    tx.executeSql("SELECT * FROM tasks WHERE date LIKE '%"+date.toISOString().slice(0,10)+"%' AND user_id =?", [loggedIn[0].id],
     // calls the caclPerformance function with passing the ResultSet object.
      (txObj, { rows: { _array } }) => calcPerformance(pieChart, _array, pList, cList, catList),

      (txObj, error) => console.log('Error ', error)
      )
  })
  // returns the lists that holds all the calculations including the performances list and the categories list for the pieChart.
  return {performL:pList, countList: cList, catList: catList};
}

/*
  * function for adding a mood level of a specific date for a specific user.
  * If there's a saved mood level of the date it will be updated with the newely selected mood level by the user.
  * params:
    1) user_id.
    2) date where the mood level is reported.
    3) mood level.
    4) open datababse.
*/
export const addMoodStatus = (user_id, date, level, db) =>{
  db.transaction(async (tx)=>{
    await tx.executeSql(
      "SELECT * FROM mood WHERE user_id =? AND date =?", [user_id, date],

        (txObj, { rows: { _array } }) => {
          // if there's no previously stored mood level of that date for that user the reported mood level will be inserted.
          if(_array.length == 0){
            tx.executeSql(
              "INSERT INTO mood (user_id, date, level) VALUES (?,?,?)", [user_id, date, level]);
          }
          // if there's a previously saved mood level it will be updated to the newly selected mood level by the user.
          else{
            tx.executeSql("UPDATE mood SET level=? WHERE user_id =? AND date =?", [level, user_id, date]);
          };
        },
        (txObj, error) => console.log('Error ', error)
      );
  });
}

/*
  * function for adding a new task by inserting the task to the tasks table for the logged in user and with the selected properties.
  * params:
    1) user_id of the task to be edited.
    2) task to be edited.
    3) category id of the task to be edited.
    4) open datababse.
*/
export const addTask = async(user_id, task, category, db) =>{
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
      // schedule a noftification for the created task if its reminder date is today.
      if(task.rem_date == new Date().toString().slice(0,15)){
        tx.executeSql("SELECT * FROM tasks ORDER BY id DESC LIMIT 1", null,
          (txObj, { rows: { _array } }) => schedulePushNotification(_array[0]),

          (txObj, error) => console.log('Error ', error)
        );
      }
    });
  }
}

/*
  * function for editing a task by updating the task in the tasks table for the logged in user with the edited properties.
  * params:
    1) task to be edited.
    2) id of the task to be edited.
    3) category id of the task to be edited.
    4) open datababse.
*/
export const editTask = (task, id, category, db) =>{
  if( task.name != null && task.name != ""){
    let cat_id = null;
    if(category!=""){
      cat_id = category;
    }
    db.transaction(async (tx)=>{
      await tx.executeSql(
        "UPDATE tasks SET title=?, time=?, date=?, reminder_date=?, category_id=?, priority=? WHERE id =?",
        [task.name, task.time, task.date, task.rem_date, cat_id, task.color, id]
      );
    });
    // send a notification to the user if the reminder date of the updated task is today.
    if(task.rem_date == new Date().toString().slice(0,15)){
      schedulePushNotification({title: task.name, date: task.date, id: id});
    }
  }
}

// marks the task as completed by updating its state to the value completed and it takes the task id as an input.
export const completeTask = (id, db) =>{
  db.transaction(async (tx)=>{
    await tx.executeSql(
      "UPDATE tasks SET state=? WHERE id =?",
      ['completed', id]
    );
  });
}

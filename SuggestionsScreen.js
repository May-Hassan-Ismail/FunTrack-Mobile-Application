import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, SafeAreaView, Image,
         ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import {extractUncompletedTasks, extractCategorizedOverdueTasks, calcUserPerformance, editTask,
        loggedIn, extractLoggedInUser} from './components/database';
import { LinearRegression } from 'js-regression';
import {openDatabase} from './components/OpenDatabase';
import AppLoading from 'expo-app-loading';
import Task from './components/Task';
import Footer from './components/Footer';

const db = openDatabase();
const wait = (timeout) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

export function SuggestionsScreen({ route, navigation }) {
  let data=[];
  let model;
  const [loading, setLoading] = useState(true);
  const [unCompTaskList, setUnCompTaskList] = useState([]);
  const [overDueList, setOverDueList] = useState([]);
  const [pomodoroList, setPomodoroList] = useState([]);
  const [moodX, setMoodX] = useState([]);
  const [moodY, setMoodY] = useState([]);
  let regression = new LinearRegression({
    alpha: 0.001,
    iterations: 300,
    lambda: 0.0
  });
  useEffect(()=>{
    setLoading(true);
    if(route.params != undefined){
      if(route.params.mode == "update" && route.params.task.date != ""){
        editTask(route.params.task, route.params.index, route.params.category);
      }
    }

  }, [route]);

  const setup = () =>{
    setUnCompTaskList([]);
    setOverDueList([]);
    setPomodoroList([])
    let performanceList= [];
    let catList= [];
    let compCount= [];
    let moodLevels = [];
    let fullObj ={};
    db.transaction(async (tx)=>{
      await tx.executeSql(
        "SELECT * FROM mood WHERE user_id =?", [loggedIn[0].id], // passing sql query and parameters:null
          // success callback which sends two things Transaction object and ResultSet Object
          (txObj, { rows: { _array } }) =>{
            _array.map((item, key)=>{
              fullObj = calcUserPerformance(new Date(item.date), performanceList, compCount, catList, false);
              moodLevels.push(item.level);
            });
            setMoodX(fullObj.performL);
            setMoodY(moodLevels);
          },
          // failure callback which sends two things Transaction object and Error
          (txObj, error) => console.log('Error ', error)
        );
    });
    db.transaction(tx => {
      tx.executeSql("SELECT * FROM tasks WHERE date LIKE '%"+new Date().toISOString().slice(0,10)+"%' AND state='uncompleted' AND user_id=?",
        [loggedIn[0].id],
        // success callback which sends two things Transaction object and ResultSet Object
        (txObj, { rows: { _array } }) => setUnCompTaskList(_array),
        // failure callback which sends two things Transaction object and Error
        (txObj, error) => console.log('Error ', error)
        ) // end executeSQL
    });
    db.transaction(tx => {
      tx.executeSql("SELECT category_id FROM tasks WHERE date<? AND state='uncompleted' AND user_id=? GROUP BY category_id ORDER BY COUNT(*) DESC",
        [new Date().toISOString().slice(0,10), loggedIn[0].id],
        // success callback which sends two things Transaction object and ResultSet Object
        (txObj, { rows: { _array } }) => {
          if(_array.length > 0){
            for(let i=0;i<Math.min(_array.length, 2);i++){
              tx.executeSql("SELECT * FROM tasks WHERE date<? AND state='uncompleted' AND user_id=? AND category_id =?",
                [new Date().toISOString().slice(0,10), loggedIn[0].id, _array[i].category_id],
                (txObj, { rows: { _array } }) =>{
                  if(i==0){
                    setPomodoroList(_array);
                  }else{
                    setOverDueList(_array);
                  }
                },
                (txObj, error) => console.log('Error ', error));
            }
          }
        },
        // failure callback which sends two things Transaction object and Error
        (txObj, error) => console.log('Error ', error)
        ) // end executeSQL
    });

    //setUnCompTaskList(extractUncompletedTasks(new Date(), unCompTasks));
    //setOverDueList(extractCategorizedOverdueTasks(new Date(), []))
  }
  const deleteTask = (id) =>{
    db.transaction(async (tx)=>{
      await tx.executeSql(
        "DELETE FROM tasks WHERE id =?", [id]
      );
    });
    setLoading(true);
  }
  // marks the task as completed
  const completeTask = (id) =>{
    db.transaction(async (tx)=>{
      await tx.executeSql(
        "UPDATE tasks SET state=? WHERE id =?",
        ['completed', id]
      );
    });
    setLoading(true);
  }

  const trainModel = () =>{
    moodY.map((item, key)=>{
      data.push( [moodX[key]/100, 2.0 + moodY[key] * moodX[key]/100 + 2.0 * moodX[key]/100 * moodX[key]/100])
    })
    // train the linear regression with the training data.
    if(data.length > 0){
      model = regression.fit(data);
    }
  }
  const finish = () =>{
    wait(200).then(() => {
      setLoading(false);
    });
  }

  if (loading) {
    return <AppLoading
           startAsync={()=> setup()}
           onFinish={()=> finish()}
           onError={console.warn}/>;
  }
  else{
    return(
      <View style={styles.container}>
        {
          trainModel()
        }
        <ScrollView style={{maxHeight:'95%'}}>
          {
            unCompTaskList.length >0 &&
              <View style={styles.taskCont}>
                <Text style={styles.taskTitle}> Finish those and elevate your mood </Text>
                {
                  data.length > 0 &&
                  <Text style={styles.taskTitle}> from {Math.round(regression.transform([0]))} to {Math.round(regression.transform([1]))}</Text>
                }
                {
                  unCompTaskList?.map((item, ind)=>{
                    return(
                      <Task task={item} key={ind} index={ind} nav={navigation} title={'SuggestionsScreen'} navTitle={'Suggestions'}
                        selected={false} mode="uncompleted" delFun={deleteTask} compFun={completeTask}/>
                    )
                  })
                }
              </View>
          }
          {
            unCompTaskList.length ==0 &&
              <View style={styles.taskCont}>
                <Text style={styles.taskTitle}> Today's expected mood is {Math.round(regression.transform([1]))}</Text>
              </View>
          }
          {
            overDueList.length >0 &&
            <View style={[styles.taskCont, {backgroundColor:"pink"}]}>
              <Text style={styles.taskTitle}> Finish those to be more Satisfied</Text>
              {
                overDueList?.map((item, ind)=>{
                  return(
                    <Task task={item} key={ind} index={ind} nav={navigation} title={'SuggestionsScreen'} navTitle={'Suggestions'}
                      selected={false} mode="uncompleted" delFun={deleteTask} compFun={completeTask}/>
                  )
                })
              }
            </View>
          }
          {
            pomodoroList.length >0 &&
            <View style={styles.taskCont}>
              <Text style={styles.taskTitle}> Spend just 15 mins in: </Text>
              {
                pomodoroList?.map((item, ind)=>{
                  return(
                    <Task task={item} key={ind} index={ind} nav={navigation} title={'HomeScreen'} navTitle={'Suggestions'}
                      selected={false} mode="uncompleted" delFun={deleteTask} compFun={completeTask}/>
                  )
                })
              }
            </View>
          }
          {
            pomodoroList.length == 0 && overDueList.length == 0 && unCompTaskList.length == 0 &&
            <View style={styles.taskCont}>
              <Text> You are doing great 🎊 , Keep up the hard work! 💪</Text>
            </View>
          }
        </ScrollView>
        <Footer nav={navigation}/>
      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fc',
    justifyContent: 'center',
  },
  taskTitle:{
    fontFamily: "Skranji_700Bold",
    fontSize: 15,
    color:'white'
  },
  taskCont: {
    borderRadius: 10,
    margin: 5,
    backgroundColor:'#99CCFF',
    padding:10,
  },
});

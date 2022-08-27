import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Dimensions, ScrollView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import AppLoading from 'expo-app-loading';
import Footer from '../components/Footer';
import {calcUserPerformance, loggedIn, extractLoggedInUser} from '../components/database';
import { LineChart, PieChart, ProgressChart } from "react-native-chart-kit";
import {openDatabase} from '../components/OpenDatabase';

// opens the TodoDB database.
const db = openDatabase('db.TodoDB');
// use dimensions for extracting the screen width to make the application responsive.
const screenWidth = Dimensions.get("window").width*0.95;

// timer function for rendering the page after waiting for the data fetching and doing the calculations on the data.
const wait = (timeout) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

export function PerformanceScreen({ route, navigation }) {
  // stores the start date of the 5 day line chart.
  const [startDate, setStartDate] = useState(new Date(new Date().valueOf() - 86400000 * 4));
  // stores the list of uncompleted tasks.
  const [unCompTaskList, setUnCompTaskList] = useState([]);
  // stores the list of dates of the 5 day line chart.
  const [dates, setDates] = useState([]);
  // stores the list of the percentages of the user's performance in the selected 5 days.
  const [performList, setPerformList] = useState([]);
  // loading state for rendering the components after the data is fetched and the calculations are done.
  const [loading, setLoading] = useState(true);
  // list of the count of tasks in each task's category (completed, uncompleted, overdue).
  const [catList, setCatList] = useState([]);
  // stores the count of the overdue tasks.
  const [overDueCount, setOverDueCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    // refresh the screen once the user navigates to it.
    setLoading(true);
    return () => { isMounted = false };
  }, [route]);

  // function for moving right or left the line and the progress charts for showing the user's performance in different dates.
  const reRend = (direction) =>{
    if(direction == 'left')
      setStartDate(new Date(startDate.valueOf() - 86400000 * 5));
    else {
      setStartDate(new Date(startDate.valueOf() + 86400000 * 5));
    }
    // reloading the page after changing dates.
    setLoading(true);
  }

  // function for extracting the count of tasks with dates less than the current data and which state is uncompleted (overdue)
  const extractOverdueCount = () =>{
    extractLoggedInUser(db);
    db.transaction(tx => {
      tx.executeSql("SELECT COUNT(*) as c FROM tasks WHERE date<? AND state='uncompleted' AND user_id = ?",
        [new Date().toISOString().slice(0,10), loggedIn[0].id],
        // assigns the ResultSet Object to the overDueCount state.
        (txObj, { rows: { _array } }) => setOverDueCount(_array[0].c),
        // failure callback which sends two things Transaction object and Error
        (txObj, error) => console.log('Error ', error)
        )
    });
  }

  // function that do all the analysis and the calculations of the user's data to show the user's performance.
  const analysis = ()=>{
    extractOverdueCount();
    // calls the calcUserPerformance function for extracting the list of today's tasks and doing all the calculations.
    // the piechart flag is passed as true for calculating the counts of the tasks in the different categories.
    let listObj = calcUserPerformance(new Date(), [], [],[], true, db);
    // assigning the returned categories List that contains the count of tasks of different categories to the catList variable.
    setCatList(listObj.catList);

    let performanceList= [];
    let catList= [];
    let compCount= [];
    let datesList= [];
    let fullObj = {};

    // looping through the 5 days to calculated the performance in each day.
    for(let i =0;i<5;i++){
      // calculating the next day by adding the a day after being converted into seconds.
      let newD = new Date(startDate.valueOf() + 86400000 * i);
      datesList.push(newD.toString().slice(4,10));
      // calls the calcUserPerformance function with the pieChart flag being false as the tasks counts are not needed.
      fullObj = calcUserPerformance(newD, performanceList, compCount, catList, false, db);
    }
    // assigns the list of dates of the 5 days to the dates list.
    setDates(datesList);
    // assigns the returned performances list to the performList variable.
    setPerformList(fullObj.performL);
  }

  // function for waiting until all the data fetching, analysis and calculations are done.
  const finish = () =>{
    wait(200).then(() => {
      // change the loading state to false for rendering the screen components.
      setLoading(false);
    });
  }
  // if the screen is in the loading state, then the analysis function will be called.
  // after finishing, the finish function will be called to change the loading state to false for the screen to be rendered.
  if (loading) {
    return <AppLoading
           startAsync={()=> analysis()}
           onFinish={()=> finish()}
           onError={console.warn}/>;
  }
  else{
    return(
      <View style={styles.container}>
      <SafeAreaView style={styles.safeView}>
      <ScrollView style={{maxHeight:'90%', marginTop:'2%'}}>
        <View>
          {/* The pie chart with using the data returned from the calculations, and each category has different color */}
          <Text style = {styles.taskTitle}>Today's Pie Chart</Text>
          <PieChart
            data={[{
                name: "Uncompleted",
                count: catList[0],
                color: "#A5CA5A",
                legendFontColor: "#7F7F7F",
                legendFontSize: 15
            },
            {
                name: "Completed",
                count: catList[1],
                color: "#3A8282",
                legendFontColor: "#7F7F7F",
                legendFontSize: 15
            },
            {
                name: "Overdue",
                count: (catList[2]+overDueCount),
                color: "#D86161",
                legendFontColor: "#7F7F7F",
                legendFontSize: 15
            }]}
            width={screenWidth}
            height={250}
            chartConfig={{
              backgroundColor: "white",
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            hideLegend={false}
            style={{
              borderRadius: 16,
            }}
            accessor={"count"}
            backgroundColor={"white"}
            paddingLeft={"15"}
            center={[5, 0]}
            absolute
          />
        </View>
        {/* Line Chart container with 2 buttons to move forward and backward in time by calling the reRend function */}
        <View style={styles.chartCont}>
          <Text style = {styles.taskTitle}>5 day Line Chart</Text>
          <View style = {styles.buttonCont}>
            <TouchableOpacity onPress = {() => reRend('left')}>
              <AntDesign name="caretleft" size={30} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress = {() => reRend('right')}>
              <AntDesign name="caretright" size={30} color="black" />
            </TouchableOpacity>
          </View>
          <LineChart
            data={{
              labels: dates,
              datasets: [{data: performList}]
            }}
            width={screenWidth}
            height={250}
            yAxisSuffix="%"
            yAxisInterval={1}
            fromZero={true}
            chartConfig={{
              backgroundGradientFrom: "#E0F5B6",
              backgroundGradientTo: "#90C2C2",
              decimalPlaces: 0, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#90C2C2"
              }
            }}
            style={{
              alignItems:'center',
              justifyContent: 'center',
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>
        {/* Progress Chart using the data returned from the calculations to show the % of the user's performance */}
        <View style={styles.chartCont}>
          <Text style = {styles.taskTitle}>3 day Progress Chart</Text>
          <ProgressChart
            data={{labels: [dates[2],dates[3], dates[4]],
                    data: [performList[2]/100,performList[3]/100, performList[4]/100]}}
            width={screenWidth}
            height={250}
            strokeWidth={16}
            radius={32}
            chartConfig={{
              backgroundColor: "white",
              backgroundGradientFrom: "white",
              backgroundGradientTo: "white",
              decimalPlaces: 0, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            hideLegend={false}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>
        </ScrollView>
        {/* Adding the footer component with passing the navigation object as a prop */}
        <Footer nav={navigation}/>
        <StatusBar barStyle="light-content" backgroundColor= '#f4f6fc' />
      </SafeAreaView>
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
  safeView:{
    height:'100%',
    alignItems:'center',
  },
  taskTitle:{
    fontFamily: "Skranji_700Bold",
    fontSize: 20,
    color:'black',
  },
  chartCont:{
    marginTop:12,
  },
  buttonCont:{
    flexDirection:'row',
    justifyContent: 'space-between',
    marginHorizontal:"5%"
  },
});

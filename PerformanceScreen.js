import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, SafeAreaView, Dimensions,
         KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Alert, ScrollView } from 'react-native';
import { MaterialCommunityIcons, AntDesign, FontAwesome5 } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import List from './components/List';
import Footer from './components/Footer';
import {extractTasks, loggedIn, extractLoggedInUser} from './components/database';
import AppLoading from 'expo-app-loading';
import Task from './components/Task';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from "react-native-chart-kit";
import {openDatabase} from './components/OpenDatabase';

const db = openDatabase();
const screenWidth = Dimensions.get("window").width*0.95;

const wait = (timeout) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

export function PerformanceScreen({ route, navigation }) {
  const [startDate, setStartDate] = useState(new Date(new Date().valueOf() - 86400000 * 4));
  const [unCompTaskList, setUnCompTaskList] = useState([]);
  const [dates, setDates] = useState([]);
  const [fullDates, setFullDates] = useState([]);
  const [performList, setPerformList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countComp, setCountComp] = useState([]);
  const [catList, setCatList] = useState([]);
  const [overDueCount, setOverDueCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    // to refresh the screen once naviagtion happens.
    setLoading(true);
    return () => { isMounted = false };
  }, [route]);

  const reRend = (direction) =>{
    if(direction == 'left')
      setStartDate(new Date(startDate.valueOf() - 86400000 * 5));
    else {
      setStartDate(new Date(startDate.valueOf() + 86400000 * 5));
    }
    setLoading(true);
    analysis();
  }
  const extractOverdueCount = () =>{
    extractLoggedInUser();
    db.transaction(tx => {
      tx.executeSql("SELECT COUNT(*) as c FROM tasks WHERE date<? AND state='uncompleted' AND user_id = ?",
        [new Date().toISOString().slice(0,10), loggedIn[0].id],
        // success callback which sends two things Transaction object and ResultSet Object
        (txObj, { rows: { _array } }) => setOverDueCount(_array[0].c),
        // failure callback which sends two things Transaction object and Error
        (txObj, error) => console.log('Error ', error)
        ) // end executeSQL
    });
  }
  const analysis = ()=>{
    extractOverdueCount();

    let listObj = extractTasks(new Date(), [], [],[], true);
    setCatList(listObj.catList);

    let performanceList= [];
    let catList= [];
    let compCount= [];
    let datesList= [];
    let fullDate = [];
    let fullObj = {};
    for(let i =0;i<5;i++){
      let newD = new Date(startDate.valueOf() + 86400000 * i);
      fullDate.push(newD);
      datesList.push(newD.toString().slice(4,10));
      fullObj = extractTasks(newD, performanceList, compCount, catList, false);
    }
    setDates(datesList);
    setFullDates(fullDate);
    setPerformList(fullObj.performL);
    setCountComp(fullObj.countList);
  }

  const finish = () =>{
    wait(200).then(() => {
      setLoading(false);
    });
  }

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
          <Text style = {styles.taskTitle}>Today's Pie Chart</Text>
          <PieChart
            data={[{
                name: "Uncompleted",
                population: catList[0],
                color: "rgba(131, 167, 234, 1)",
                legendFontColor: "#7F7F7F",
                legendFontSize: 15
            },
            {
                name: "Completed",
                population: catList[1],
                color: "#57DBD0",
                legendFontColor: "#7F7F7F",
                legendFontSize: 15
            },
            {
                name: "Overdue",
                population: (catList[2]+overDueCount),
                color: "#FF9999",
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
            accessor={"population"}
            backgroundColor={"white"}
            paddingLeft={"15"}
            center={[5, 0]}
            absolute
          />
        </View>
        <View style={styles.chartCont}>
          <Text style = {styles.taskTitle}>5-days Line Chart</Text>
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
              backgroundGradientFrom: "#33AAFF",
              backgroundGradientTo: "#ffa726",
              decimalPlaces: 0, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#ffa726"
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
        <View style={styles.chartCont}>
          <Text style = {styles.taskTitle}>3-days Progress Chart</Text>
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
        <Footer nav={navigation}/>
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
    fontSize: 25,
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
